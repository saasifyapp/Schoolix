const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed

// Use the connection manager middleware
router.use(connectionManager);


router.get("/fetch-student-for-TC", (req, res) => {
    const { grno, name, section } = req.query;

    // Log the received query parameters
    console.log("Received query parameters:", { grno, name, section });

    // Validate input parameters
    if (!section || (!grno && !name)) {
        return res.status(400).json({ error: "Invalid search parameters" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        // If section is not recognized
        return res.status(400).json({ error: "Invalid section parameter" });
    }
    
    // Log the determined table name
    console.log("Using table:", tableName);

    // Construct the SQL query
    let query = `SELECT * FROM ${tableName} WHERE is_active = 1 AND `;
    let queryParams = [];

    if (grno) {
        query += "Grno = ?";
        queryParams.push(grno);
    } else if (name) {
        query += "Name LIKE ?";
        queryParams.push(`%${name}%`);
    }

    // Log the constructed query and parameters
    console.log("Constructed query:", query);
    console.log("Query parameters:", queryParams);

    // Execute the query
    req.connectionPool.query(query, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }

        // Log the query results
        console.log("Query results:", results);

        if (results.length === 0) {
            return res.status(404).json({ message: "No student found" });
        }

        // Check if the student is inactive
        if (results[0].is_active === 0) {
            return res.status(200).json({ message: "Student is inactive", student: results[0] });
        }

        // Return the results
        res.json(results);
    });
});








module.exports = router;