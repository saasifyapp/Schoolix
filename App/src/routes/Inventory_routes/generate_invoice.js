const express = require('express');
const router = express.Router();

// Endpoint to retrieve the last invoice number from the table
router.get("/inventory/generate_invoice/getLast_invoice_number", (req, res) => {
    // Query to fetch the last invoice number from the table
    let query_lastInvoiceNumber = "SELECT MAX(invoiceNo) AS lastInvoiceNumber FROM inventory_invoice_details";

    // Execute the SQL query
    connection.query(query_lastInvoiceNumber, (err, result) => {
        if (err) {
            console.error("Error fetching last invoice number: " + err.stack);
            return res.status(500).json({ error: "Error fetching last invoice number" });
        }

        // Extract the last invoice number from the result
        const lastInvoiceNumber = result[0].lastInvoiceNumber || 0;

        // Send the last invoice number as JSON response
        res.json({ lastInvoiceNumber });
    });
});

// Endpoint to get books based on the selected class
router.post("/inventory/generate_invoice/get_books", (req, res) => {
    const selectedClass = req.body.class; // Retrieve the selected class from the request body

    //console.log("Received class for books:", selectedClass); // Debugging line to check received class

    // SQL query to get books based on the selected class
    let query_getBooks = `SELECT title, selling_price FROM inventory_book_details WHERE class_of_title = ?`;

    // Execute the SQL query
    connection.query(query_getBooks, [selectedClass], (err, rows) => {
        if (err) {
            console.error("Error fetching books data: " + err.stack);
            return res.status(500).json({ error: "Error fetching books data" });
        }

        //console.log("Books query result:", rows); // Debugging line to check query result
        res.json(rows);
    });
});

// Endpoint to get all uniforms
router.get("/inventory/generate_invoice/get_uniforms", (req, res) => {
    // SQL query to get all uniforms
    let query_getUniforms = `SELECT uniform_item, size_of_item, selling_price FROM inventory_uniform_details`;

    // Execute the SQL query
    connection.query(query_getUniforms, (err, rows) => {
        if (err) {
            console.error("Error fetching uniforms data: " + err.stack);
            return res.status(500).json({ error: "Error fetching uniforms data" });
        }

       // console.log("Uniforms query result:", rows); // Debugging line to check query result
        res.json(rows);
    });
});

// Endpoint to get price of uniform based on selected size
router.post("/inventory/generate_invoice/get_uniform_price", (req, res) => {
    const { uniformName, size } = req.body;

    // Query the database to get the price for the selected size of the uniform
    let query_getUniformPrice = `SELECT selling_price FROM inventory_uniform_details WHERE uniform_item = ? AND size_of_item = ?`;

    // Execute the SQL query
    connection.query(query_getUniformPrice, [uniformName, size], (err, rows) => {
        if (err) {
            console.error("Error fetching uniform price: " + err.stack);
            return res.status(500).json({ error: "Error fetching uniform price" });
        }

        // Send the price as JSON response
        if (rows.length > 0) {
            res.json({ price: rows[0].selling_price });
        } else {
            res.status(404).json({ error: "Price not found for the selected size" });
        }
    });
});
 

////////////////////////////////////////////// SEND/RECEIVE DATA TO/FROM DATABASE /////////////////////////////////

/************************************** GENERATE BUTTON FUNCTIONALITY    **************** */

// Endpoint to check if the buyer exists for the given class
router.post("/inventory/generate_invoice/check_buyer", (req, res) => {
    const { buyerName, buyerClass } = req.body;
    //console.log(buyerName, buyerClass);

    // Query to check if the buyer exists for the given class
    let query_checkBuyer = "SELECT * FROM inventory_invoice_details WHERE buyerName = ? AND class_of_buyer = ?";

    // Execute the SQL query
    connection.query(query_checkBuyer, [buyerName, buyerClass], (err, result) => {
        if (err) {
            console.error("Error checking buyer:", err);
            return res.status(500).json({ error: "Error checking buyer" });
        }

        // Check if the buyer exists for the given class
        if (result.length > 0) {
            // Buyer exists
            res.json({ exists: true });
            //console.log(result);
        } else {
            // Buyer does not exist
            res.json({ exists: false });
        }
    });
});


/************************************** PRINT BUTTON FUNCTIONALITY    **************** */

// Endpoint to insert invoice details into the table - inventory_invoice_details
router.post("/inventory/generate_invoice/invoice_details", (req, res) => {
    const { invoiceNo, invoiceDate, buyerName, buyerMobile, buyerClass, totalAmount, amountPaid, balanceAmount } = req.body;

    // Query to insert invoice details into the database
    let query_insertInvoiceDetails = `INSERT INTO inventory_invoice_details (invoiceNo, billDate, buyerName, buyerPhone, class_of_buyer, total_payable, paid_amount, balance_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    // Execute the SQL query
    connection.query(query_insertInvoiceDetails, [invoiceNo, invoiceDate, buyerName, buyerMobile, buyerClass, totalAmount, amountPaid, balanceAmount], (err, result) => {
        if (err) {
            console.error("Error inserting invoice details: " + err.stack);
            return res.status(500).json({ error: "Error inserting invoice details" });
        }

        // Send success response if insertion is successful
        res.json({ message: "Invoice details inserted successfully" });
    });
});

router.post("/inventory/generate_invoice/invoice_items", (req, res) => {
    const { invoiceNo, bookDetails, uniformDetails } = req.body;

    // Combine book and uniform details into a single array for easier processing
    const allDetails = [
        ...bookDetails.map(book => ({ type: 'book', ...book })),
        ...uniformDetails.map(uniform => ({ type: 'uniform', ...uniform }))
    ];

    let operationsCount = allDetails.length;
    if (operationsCount === 0) {
        return res.json({ message: "No items to insert" });
    }

    let errorOccurred = false;

    allDetails.forEach(detail => {
        let query, values;
        if (detail.type === 'book') {
            query = `INSERT INTO inventory_invoice_items (invoiceNo, item_name, class_size, quantity, type) VALUES (?, ?, ?, ?, ?)`;
            values = [invoiceNo, detail.title, detail.class, detail.quantity, detail.book_type];
        } else {
            query = `INSERT INTO inventory_invoice_items (invoiceNo, item_name, class_size, quantity, type) VALUES (?, ?, ?, ?, ?)`;
            values = [invoiceNo, detail.item, detail.size, detail.quantity, detail.uniform_type];
        }

        connection.query(query, values, (err, result) => {
            operationsCount--;
            if (err) {
                console.error(`Error inserting ${detail.type} details: ` + err.stack);
                errorOccurred = true;
            }

            if (operationsCount === 0) {
                if (errorOccurred) {
                    return res.status(500).json({ error: "Error inserting invoice items" });
                } else {
                    res.json({ message: "Invoice items inserted successfully" });
                }
            }
        });
    });
});


// Endpoint to reduce the remaining quantity of purchased items for both books and uniforms
router.post("/inventory/reduce_quantity", (req, res) => {
    const { invoiceNo } = req.body;

    // Query to get purchased items from inventory_invoice_items
    let query_getPurchasedItems = `SELECT item_name, class_size, quantity, type FROM inventory_invoice_items WHERE invoiceNo = ?`;

    connection.query(query_getPurchasedItems, [invoiceNo], (err, results) => {
        if (err) {
            console.error("Error fetching purchased items: " + err.stack);
            return res.status(500).json({ error: "Error fetching purchased items" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No purchased items found for this invoice" });
        }

        // Separate purchased items into books and uniforms
        let books = results.filter(item => item.type === 'Book');
        let uniforms = results.filter(item => item.type === 'Uniform');

        // Update remaining quantities for books
        if (books.length > 0) {
            let bookUpdatePromises = books.map(book => {
                return new Promise((resolve, reject) => {
                    let { item_name, class_size, quantity } = book;
                    let query_updateBookQuantity = `UPDATE inventory_book_details SET remaining_quantity = remaining_quantity - ? WHERE title = ? AND class_of_title = ?`;

                    connection.query(query_updateBookQuantity, [quantity, item_name, class_size], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
            });

            Promise.all(bookUpdatePromises)
                .then(() => {
                    console.log("Remaining quantities for books updated successfully");
                })
                .catch(err => {
                    console.error("Error updating remaining quantities for books: " + err.stack);
                });
        }

        // Update remaining quantities for uniforms
        if (uniforms.length > 0) {
            let uniformUpdatePromises = uniforms.map(uniform => {
                return new Promise((resolve, reject) => {
                    let { item_name, class_size, quantity } = uniform;
                    let query_updateUniformQuantity = `UPDATE inventory_uniform_details SET remaining_quantity = remaining_quantity - ? WHERE uniform_item = ? AND size_of_item = ?`;

                    connection.query(query_updateUniformQuantity, [quantity, item_name, class_size], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
            });

            Promise.all(uniformUpdatePromises)
                .then(() => {
                    console.log("Remaining quantities for uniforms updated successfully");
                })
                .catch(err => {
                    console.error("Error updating remaining quantities for uniforms: " + err.stack);
                });
        }

        res.json({ message: "Remaining quantities updated successfully" });
    });
});


module.exports = router;
