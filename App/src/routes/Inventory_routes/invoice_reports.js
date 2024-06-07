const express = require('express');
const router = express.Router();


// Route to handle date filter query (GET request)
router.get("/inventory/invoice/query_by_date", (req, res) => {
    const date = req.query.date; // Get the date from query parameters

    // Construct the SQL query to filter based on the date part of the timestamp
    let query = `SELECT * FROM inventory_invoice_details WHERE billDate = ?`;

    // Execute the SQL query
    connection.query(query, [date], (err, rows) => {
        if (err) {
            console.error("Error fetching data:", err);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });
});

module.exports = router;