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
    console.log(buyerName,buyerClass)

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


/************************************** PRINT BUTTON FUNCTIONALITY    **************** */

// Endpoint to insert invoice_details into the table - inventory_invoice_details
router.post("/inventory/generate_invoice/invoice_details", (req, res) => {
    const { invoiceNo, invoiceDate, buyerName, buyerMobile, buyerClass, totalAmount, amountPaid, balanceAmount } = req.body;
    console.log(invoiceNo, invoiceDate, buyerName, buyerMobile, buyerClass, totalAmount, amountPaid, balanceAmount)

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


module.exports = router;
