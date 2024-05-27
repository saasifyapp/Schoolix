const express = require('express');
const router = express.Router();

// Endpoint to get books based on the selected class
router.post("/inventory/generate_invoice/get_books", (req, res) => {
    const selectedClass = req.body.class; // Retrieve the selected class from the request body

    console.log("Received class for books:", selectedClass); // Debugging line to check received class

    // SQL query to get books based on the selected class
    let query_getBooks = `SELECT title, selling_price FROM inventory_book_details WHERE class_of_title = ?`;

    // Execute the SQL query
    connection.query(query_getBooks, [selectedClass], (err, rows) => {
        if (err) {
            console.error("Error fetching books data: " + err.stack);
            return res.status(500).json({ error: "Error fetching books data" });
        }

        console.log("Books query result:", rows); // Debugging line to check query result
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

        console.log("Uniforms query result:", rows); // Debugging line to check query result
        res.json(rows);
    });
});

module.exports = router;
