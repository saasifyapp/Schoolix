const express = require('express');
const router = express.Router();
const mysql = require('mysql');


const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to handle date filter query (GET request)
router.get("/inventory/invoice/query_by_date", (req, res) => {
    const date = req.query.date; // Get the date from query parameters

    // Construct the SQL query to filter based on the date part of the timestamp
    let query = `SELECT * FROM inventory_invoice_details WHERE billDate = ?`;

    // Execute the SQL query
    req.connectionPool.query(query, [date], (err, rows) => {
        if (err) {
            console.error("Error fetching data:", err);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });
});


// Endpoint to handle class filter query (GET request)
router.get("/inventory/invoice/query_by_class", (req, res) => {
    const classOfBuyer = req.query.class;

    let query;
    let params = [];

    if (classOfBuyer === "All Class") {
        query = `SELECT * FROM inventory_invoice_details`;
    } else {
        query = `SELECT * FROM inventory_invoice_details WHERE class_of_buyer = ?`;
        params.push(classOfBuyer);
    }

    req.connectionPool.query(query, params, (err, rows) => {
        if (err) {
            console.error("Error fetching data:", err);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });
});


// Endpoint to handle query for defaulter list (Get request)
router.get("/inventory/invoice/query_by_defaulter", (req, res) => {
    const isDefaulter = req.query.defaulter; // Get the value of the defaulter switch (true/false)

    // Construct the SQL query to filter based on the balance_amount
    let query;
    if (isDefaulter === 'true') {
        query = `SELECT * FROM inventory_invoice_details WHERE balance_amount != 0`;
    } 

    // Execute the SQL query
    req.connectionPool.query(query, (err, rows) => {
        if (err) {
            console.error("Error fetching data:", err);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });
});

module.exports = router;