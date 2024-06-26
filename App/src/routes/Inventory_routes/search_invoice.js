const express = require('express'); 
const router = express.Router();
const mysql = require('mysql');


const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Get data for invoice display
router.get('/inventory/invoices', (req, res) => {
    const query = `SELECT 
                    invoiceNo, 
                    billDate, 
                    buyerName, 
                    buyerPhone, 
                    class_of_buyer, 
                    total_payable, 
                    paid_amount, 
                    balance_amount, 
                    mode_of_payment 
                   FROM inventory_invoice_details`;

    req.connectionPool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching invoice data: ' + err.stack);
            return res.status(500).json({ error: 'Error fetching invoice data' });
        }
        res.json(results);
    });
});

// Get data for search invoice 
router.get('/inventory/searchinvoices', (req, res) => {
    const searchQuery = req.query.search?.trim(); // Get optional search term

    let query = `SELECT * FROM inventory_invoice_details WHERE 1 = 1`;

    if (req.query.invoiceNo) {
        // Search by invoice number
        const escapedQuery = req.connectionPool.escape(req.query.invoiceNo + '%');
        query += ` AND invoiceNo LIKE ${escapedQuery}`;
    } else if (searchQuery) {
        // Search by buyer name (if invoiceNo is not present)
        const escapedQuery = req.connectionPool.escape('%' + searchQuery + '%');
        query += ` AND (invoiceNo LIKE ${escapedQuery} OR buyerName LIKE ${escapedQuery})`;
    }

    // Execute the SQL query with parameters
    req.connectionPool.query(query, (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });
});

// Add a new endpoint to retrieve student data based on the selected class
router.get("/inventory/class/:class", (req, res) => {
    const selectedClass = req.params.class; // Get the selected class from request parameters

    // Construct the SQL query to filter based on the standard column
    let query = `SELECT * FROM inventory_invoice_details WHERE class_of_buyer = ?`;

    // Execute the SQL query
    req.connectionPool.query(query, [selectedClass], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });
});

router.put('/inventory/updatePaidAmount', (req, res) => {
    const { invoiceNo, paidAmount, balanceAmount, invoiceDate, modeOfPayment, newPaidAmount } = req.body;

    const updateQuery = `
        UPDATE inventory_invoice_details 
        SET paid_amount = ?, balance_amount = ?
        WHERE invoiceNo = ?
    `;

    const insertQuery = `
        INSERT INTO inventory_payment_history (invoiceNo, paid_amount, mode_of_payment, updatedDate)
        VALUES (?, ?, ?, ?)
    `;

    req.connectionPool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).send('Error getting connection');
        }

        connection.beginTransaction(err => {
            if (err) {
                console.error('Error starting transaction:', err);
                connection.release();
                return res.status(500).send('Error starting transaction');
            }

            connection.query(updateQuery, [paidAmount, balanceAmount, invoiceNo], (err, result) => {
                if (err) {
                    console.error('Error updating invoice:', err);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).send('Error updating invoice');
                    });
                }

                connection.query(insertQuery, [invoiceNo, newPaidAmount, modeOfPayment, invoiceDate], (err, result) => {
                    if (err) {
                        console.error('Error inserting payment history:', err);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).send('Error inserting payment history');
                        });
                    }

                    connection.commit(err => {
                        if (err) {
                            console.error('Error committing transaction:', err);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).send('Error committing transaction');
                            });
                        }

                        connection.release();
                        res.status(200).send('Invoice updated and payment history inserted successfully');
                    });
                });
            });
        });
    });
});

router.delete("/inventory/deleteInvoice", (req, res) => {
    const invoiceNo = req.query.name;

    // SQL queries to delete related items first, then the invoice
    const selectItemsQuery = `SELECT item_name, quantity, type, class_size FROM inventory_invoice_items WHERE invoiceNo = ?`;
    const deleteItemsQuery = `DELETE FROM inventory_invoice_items WHERE invoiceNo = ?`;
    const deleteHistoryQuery = `DELETE FROM inventory_payment_history WHERE invoiceNo = ?`;
    const deleteInvoiceQuery = `DELETE FROM inventory_invoice_details WHERE invoiceNo = ? LIMIT 1`;

    // Fetch related items
    req.connectionPool.query(selectItemsQuery, [invoiceNo], (err, items) => {
        if (err) {
            console.error("Error fetching invoice items:", err);
            res.status(500).send("Error fetching invoice items");
            return;
        }

        // Delete related items
        req.connectionPool.query(deleteItemsQuery, [invoiceNo], (err, result) => {
            if (err) {
                console.error("Error deleting invoice items:", err);
                res.status(500).send("Error deleting invoice items");
                return;
            }

            // Update book and uniform details based on deleted items
            items.forEach(item => {
                const { item_name, quantity, type, class_size } = item;
                if (type === 'Book') {
                    const updateBookQuery = `UPDATE inventory_book_details SET remaining_quantity = remaining_quantity + ? WHERE title = ? AND class_of_title = ?`;
                    req.connectionPool.query(updateBookQuery, [quantity, item_name, class_size], (err, result) => {
                        if (err) {
                            console.error(`Error updating book details for ${item_name}:`, err);
                        }
                    });
                } else if (type === 'Uniform') {
                    const updateUniformQuery = `UPDATE inventory_uniform_details SET remaining_quantity = remaining_quantity + ? WHERE uniform_item = ? AND size_of_item = ?`;
                    req.connectionPool.query(updateUniformQuery, [quantity, item_name, class_size], (err, result) => {
                        if (err) {
                            console.error(`Error updating uniform details for ${item_name}:`, err);
                        }
                    });
                }
            });

            // Delete the payment history
            req.connectionPool.query(deleteHistoryQuery, [invoiceNo], (err, result) => {
                if (err) {
                    console.error("Error deleting payment history:", err);
                    res.status(500).send("Error deleting payment history");
                    return;
                }

                // Delete the invoice
                req.connectionPool.query(deleteInvoiceQuery, [invoiceNo], (err, result) => {
                    if (err) {
                        console.error("Error deleting invoice:", err);
                        res.status(500).send("Error deleting invoice");
                        return;
                    }

                    if (result.affectedRows === 0) {
                        res.status(404).send("Invoice not found");
                        return;
                    }
                    res.status(200).send("Invoice and related payment history deleted successfully");
                });
            });
        });
    });
});


// Endpoint to fetch and print invoice details
router.get('/get_invoice/:invoiceNo', (req, res) => {
    const invoiceNo = req.params.invoiceNo;

    // Query to fetch invoice details
    const invoiceQuery = `
        SELECT 
            invoiceNo, 
            billDate, 
            buyerName, 
            buyerPhone, 
            class_of_buyer, 
            total_payable, 
            paid_amount, 
            balance_amount, 
            mode_of_payment 
        FROM inventory_invoice_details 
        WHERE invoiceNo = ?`;

    // Query to fetch invoice items
    const itemsQuery = `
       SELECT 
        ii.item_name,
        ii.class_size,
        ii.quantity, 
        CASE
            WHEN ii.type = 'Book' THEN bd.selling_price
            WHEN ii.type = 'Uniform' THEN ud.selling_price
            ELSE 0
        END AS purchase_price,
        ii.quantity * CASE
            WHEN ii.type = 'Book' THEN bd.selling_price
            WHEN ii.type = 'Uniform' THEN ud.selling_price
            ELSE 0
        END AS total,
        CASE
            WHEN ii.type = 'Uniform' THEN CONCAT(ii.item_name, ' (Size: ', ii.class_size, ')')
            ELSE ii.item_name
        END AS display_name
    FROM inventory_invoice_items ii
    LEFT JOIN inventory_uniform_details ud 
        ON ii.item_name = ud.uniform_item 
        AND ii.class_size = ud.size_of_item
        AND ii.type = 'Uniform'
    LEFT JOIN inventory_book_details bd 
        ON ii.item_name = bd.title 
        AND ii.type = 'Book'
    WHERE ii.invoiceNo = ?;`;

    // Execute invoice details query
    req.connectionPool.query(invoiceQuery, [invoiceNo], (err, invoiceResults) => {
        if (err) {
            console.error('Error fetching invoice data: ' + err.stack);
            return res.status(500).json({ error: 'Error fetching invoice data' });
        }

        // If no invoice found
        if (invoiceResults.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Execute invoice items query
        req.connectionPool.query(itemsQuery, [invoiceNo], (err, itemsResults) => {
            if (err) {
                console.error('Error fetching invoice items: ' + err.stack);
                return res.status(500).json({ error: 'Error fetching invoice items' });
            }

            // Combine invoice details and items into a single object
            const invoiceData = {
                invoiceDetails: invoiceResults[0],
                invoiceItems: itemsResults
            };

            // Send the combined result as JSON response
            res.json(invoiceData);
        });
    });
});




module.exports = router;