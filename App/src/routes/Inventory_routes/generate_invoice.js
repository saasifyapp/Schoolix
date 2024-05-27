const express = require('express');
const router = express.Router();

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


module.exports = router;
