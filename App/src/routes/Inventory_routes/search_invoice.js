const express = require('express'); 
const router = express.Router();
const mysql = require('mysql');


// Define dbCredentials and connection outside the endpoint
let dbCredentials;
let connection;

// Middleware to set dbCredentials and connection
router.use((req, res, next) => {
    dbCredentials = req.session.dbCredentials;
    connection = mysql.createPool({
        host: dbCredentials.host,
        user: dbCredentials.user,
        password: dbCredentials.password,
        database: dbCredentials.database
    });
    next();
});


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

    connection.query(query, (err, results) => {
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
        const escapedQuery = connection.escape(req.query.invoiceNo + '%');
        query += ` AND invoiceNo LIKE ${escapedQuery}`;
    } else if (searchQuery) {
        // Search by buyer name (if invoiceNo is not present)
        const escapedQuery = connection.escape('%' + searchQuery + '%');
        query += ` AND (invoiceNo LIKE ${escapedQuery} OR buyerName LIKE ${escapedQuery})`;
    }

    // Execute the SQL query with parameters
    connection.query(query, (err, rows) => {
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
    connection.query(query, [selectedClass], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });
});

// Update paid amount for an invoice
router.put('/inventory/updatePaidAmount', (req, res) => {
    const { invoiceNo, paidAmount, balanceAmount } = req.body;

    const query = `
        UPDATE inventory_invoice_details 
        SET paid_amount = ?, balance_amount = ? 
        WHERE invoiceNo = ?
    `;

    connection.query(query, [paidAmount, balanceAmount, invoiceNo], (err, result) => {
        if (err) {
            console.error('Error updating invoice:', err);
            return res.status(500).send('Error updating invoice');
        }
        res.status(200).send('Invoice updated successfully');
    });
});

// Delete invoice endpoint //

router.delete("/inventory/deleteInvoice", (req, res) => {
    const invoiceNo = req.query.name;

    // SQL queries to delete related items first, then the invoice
    const selectItemsQuery = `SELECT item_name, quantity, type, class_size FROM inventory_invoice_items WHERE invoiceNo = ?`;
    const deleteItemsQuery = `DELETE FROM inventory_invoice_items WHERE invoiceNo = ?`;
    const deleteInvoiceQuery = `DELETE FROM inventory_invoice_details WHERE invoiceNo = ? LIMIT 1`;

    // Fetch related items
    connection.query(selectItemsQuery, [invoiceNo], (err, items) => {
        if (err) {
            console.error("Error fetching invoice items:", err);
            res.status(500).send("Error fetching invoice items");
            return;
        }

        // Delete related items
        connection.query(deleteItemsQuery, [invoiceNo], (err, result) => {
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
                    connection.query(updateBookQuery, [quantity, item_name, class_size], (err, result) => {
                        if (err) {
                            console.error(`Error updating book details for ${item_name}:`, err);
                        }
                    });
                } else if (type === 'Uniform') {
                    const updateUniformQuery = `UPDATE inventory_uniform_details SET remaining_quantity = remaining_quantity + ? WHERE uniform_item = ? AND size_of_item = ?`;
                    connection.query(updateUniformQuery, [quantity, item_name, class_size], (err, result) => {
                        if (err) {
                            console.error(`Error updating uniform details for ${item_name}:`, err);
                        }
                    });
                }
            });

            // Delete the invoice
            connection.query(deleteInvoiceQuery, [invoiceNo], (err, result) => {
                if (err) {
                    console.error("Error deleting invoice:", err);
                    res.status(500).send("Error deleting invoice");
                    return;
                }

                if (result.affectedRows === 0) {
                    res.status(404).send("Invoice not found");
                    return;
                }
                res.status(200).send("Invoice deleted successfully");
            });
        });
    });
});


module.exports = router;