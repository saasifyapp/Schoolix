const express = require('express');
const router = express.Router();

router.post("/inventory/generate_invoice/get_books", (req, res) => {
    const selectedClass = req.body.class; // Retrieve the selected class from the request body

    console.log("Received class:", selectedClass); // Debugging line to check received class

    // Construct the SQL query to filter based on the selected class
    let query = `SELECT title, selling_price FROM inventory_book_details WHERE class_of_title = ?`;

    // Execute the SQL query
    connection.query(query, [selectedClass], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }

        console.log("Query result:", rows); // Debugging line to check query result
        res.json(rows);
    });
});

module.exports = router;
