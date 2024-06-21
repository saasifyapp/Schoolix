const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Define dbCredentials and connection outside the endpoint
let dbCredentials;
let connection;

// Middleware to set dbCredentials and create the connection pool if it doesn't exist
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

    // Define the class ranges
    const classRanges = {
        "Nursery to KG2": ["Nursery", "KG1", "KG2"],
        "Nursery to 4th": ["Nursery", "KG1", "KG2", "1st", "2nd", "3rd", "4th"],
        "1st to 4th": ["1st", "2nd", "3rd", "4th"],
        "5th to 10th": ["5th", "6th", "7th", "8th", "9th", "10th"],
        "1st to 10th": ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"],
        "All Class": ["Nursery", "KG1", "KG2", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]
    };

    // Get the ranges that include the selected class
    const applicableRanges = Object.keys(classRanges).filter(range => classRanges[range].includes(selectedClass));

    // SQL query to get books based on the selected class and applicable ranges
    let query_getBooks = `SELECT title, selling_price, class_of_title FROM inventory_book_details WHERE class_of_title IN (?)`;

    // Execute the SQL query
    connection.query(query_getBooks, [[selectedClass, ...applicableRanges]], (err, rows) => {
        if (err) {
            console.error("Error fetching books data: " + err.stack);
            return res.status(500).json({ error: "Error fetching books data" });
        }

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

// Endpoint to get remaining quantities of specific books
router.post("/inventory/generate_invoice/get_book_quantities", (req, res) => {
    // List of book titles from the request body
    const { bookTitles } = req.body;

    // SQL query to get remaining quantities of specific books
    let query_getBookQuantities = `SELECT title, remaining_quantity FROM inventory_book_details WHERE title IN (?)`;

    // Execute the SQL query
    connection.query(query_getBookQuantities, [bookTitles], (err, rows) => {
        if (err) {
            console.error("Error fetching book quantities: " + err.stack);
            return res.status(500).json({ error: "Error fetching book quantities" });
        }

        res.json(rows);
    });
});

// Endpoint to get remaining quantities of specific uniforms
router.post("/inventory/generate_invoice/get_uniform_quantities", (req, res) => {
    // List of uniform items from the request body
    const { uniformItems } = req.body;

    // SQL query to get remaining quantities of specific uniforms
    let query_getUniformQuantities = `SELECT uniform_item, size_of_item, remaining_quantity FROM inventory_uniform_details WHERE (uniform_item, size_of_item) IN (?)`;

    // Prepare uniform items for the SQL query
    const uniformItemsForQuery = uniformItems.map(item => [item.item, item.size]);

    // Execute the SQL query
    connection.query(query_getUniformQuantities, [uniformItemsForQuery], (err, rows) => {
        if (err) {
            console.error("Error fetching uniform quantities: " + err.stack);
            return res.status(500).json({ error: "Error fetching uniform quantities" });
        }

        res.json(rows);
    });
});

// Endpoint to check if the buyer exists for the given class
router.post("/inventory/generate_invoice/check_buyer", (req, res) => {
    const { buyerName, buyerClass } = req.body;

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
        } else {
            // Buyer does not exist
            res.json({ exists: false });
        }
    });
});

// Endpoint to insert invoice details into the table - inventory_invoice_details
router.post("/inventory/generate_invoice/invoice_details", async (req, res) => {
    const { invoiceNo, invoiceDate, buyerName, buyerMobile, buyerClass, totalAmount, amountPaid, balanceAmount, paymentMethod } = req.body;

    // Combine book and uniform details into a single array for easier processing
    const { bookDetails, uniformDetails } = req.body;
    const allDetails = [
        ...bookDetails.map(book => ({ type: 'book', ...book })),
        ...uniformDetails.map(uniform => ({ type: 'uniform', ...uniform }))
    ];

    let conn;

    try {
        // Get a connection from the pool
        conn = await new Promise((resolve, reject) => {
            connection.getConnection((err, conn) => {
                if (err) reject(err);
                else resolve(conn);
            });
        });

        // Start a transaction
        await new Promise((resolve, reject) => {
            conn.beginTransaction(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Query to insert invoice details into the database
        let query_insertInvoiceDetails = `INSERT INTO inventory_invoice_details (invoiceNo, billDate, buyerName, buyerPhone, class_of_buyer, total_payable, paid_amount, balance_amount, mode_of_payment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // Execute the SQL query for invoice details
        await new Promise((resolve, reject) => {
            conn.query(query_insertInvoiceDetails, [invoiceNo, invoiceDate, buyerName, buyerMobile, buyerClass, totalAmount, amountPaid, balanceAmount, paymentMethod], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        // Insert invoice items
        for (const detail of allDetails) {
            let query, values;
            if (detail.type === 'book') {
                query = `INSERT INTO inventory_invoice_items (invoiceNo, item_name, class_size, quantity, type) VALUES (?, ?, ?, ?, ?)`;
                values = [invoiceNo, detail.title, detail.class, detail.quantity, detail.book_type];
            } else {
                query = `INSERT INTO inventory_invoice_items (invoiceNo, item_name, class_size, quantity, type) VALUES (?, ?, ?, ?, ?)`;
                values = [invoiceNo, detail.item, detail.size, detail.quantity, detail.uniform_type];
            }

            await new Promise((resolve, reject) => {
                conn.query(query, values, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        }

        // Update remaining quantities
        let query_getPurchasedItems = `SELECT item_name, class_size, quantity, type FROM inventory_invoice_items WHERE invoiceNo = ?`;
        const results = await new Promise((resolve, reject) => {
            conn.query(query_getPurchasedItems, [invoiceNo], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        let books = results.filter(item => item.type === 'Book');
        let uniforms = results.filter(item => item.type === 'Uniform');

        // Update remaining quantities for books
        for (const book of books) {
            let { item_name, class_size, quantity } = book;
            let query_updateBookQuantity = `UPDATE inventory_book_details SET remaining_quantity = remaining_quantity - ? WHERE title = ? AND class_of_title = ?`;
            await new Promise((resolve, reject) => {
                conn.query(query_updateBookQuantity, [quantity, item_name, class_size], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        }

        // Update remaining quantities for uniforms
        for (const uniform of uniforms) {
            let { item_name, class_size, quantity } = uniform;
            let query_updateUniformQuantity = `UPDATE inventory_uniform_details SET remaining_quantity = remaining_quantity - ? WHERE uniform_item = ? AND size_of_item = ?`;
            await new Promise((resolve, reject) => {
                conn.query(query_updateUniformQuantity, [quantity, item_name, class_size], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        }

        // Commit the transaction
        await new Promise((resolve, reject) => {
            conn.commit(err => {
                if (err) reject(err);
                else resolve();
            });
        });

        res.json({ message: "Invoice details and items inserted successfully, and stock updated" });

    } catch (err) {
        if (conn) {
            // Rollback the transaction in case of error
            await new Promise((resolve, reject) => {
                conn.rollback(() => {
                    resolve();
                });
            });
        }
        console.error("Error processing invoice: " + err.stack);
        res.status(500).json({ error: "Error processing invoice" });
    } finally {
        if (conn) {
            // Release the connection back to the pool
            conn.release();
        }
    }
});

module.exports = router;