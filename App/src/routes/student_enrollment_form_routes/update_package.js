const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
//const { connection_auth } = require('../../../main_server'); // Adjust the path as needed

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to get distinct classes based on section
router.get("/get-distinct-class", (req, res) => {
    const { section } = req.query;

    // Validate input parameters
    if (!section) {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query
    let query = `SELECT DISTINCT Standard FROM ${tableName}`;

    // Execute the query
    req.connectionPool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error", details: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No classes found" });
        }

        // Custom sorting function to handle numeric values correctly
        results.sort((a, b) => {
            const numA = parseInt(a.Standard.replace("th", "").replace("st", "").replace("nd", "").replace("rd", ""));
            const numB = parseInt(b.Standard.replace("th", "").replace("st", "").replace("nd", "").replace("rd", ""));
            return numA - numB;
        });

        // Return the results
        res.json(results);
    });
});

// Endpoint to get distinct divisions based on class
router.get("/get-distinct-division-for-class", (req, res) => {
    const { section, class: selectedClass } = req.query;

    // Validate input parameters
    if (!section || !selectedClass) {
        return res.status(400).json({ error: "Invalid section or class parameter" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query
    let query = `SELECT DISTINCT Division FROM ${tableName} WHERE Standard = ?`;

    // Execute the query
    req.connectionPool.query(query, [selectedClass], (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error", details: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No divisions found" });
        }

        // Return the results
        res.json(results);
    });
});



// Endpoint to get student details for package update
router.get("/get-student-details-for-package-update", (req, res) => {
    const { section } = req.query;

    // Validate input parameters
    if (!section) {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query
    let query = `
        SELECT 
            student_id,
            Grno,
            Name,
            CONCAT(Standard, ' ', Division) AS ClassDivision,
            package_breakup,
            total_package
        FROM ${tableName}
    `;

    // Execute the query
    req.connectionPool.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error", details: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        // Return the results
        res.json(results);
    });
});


module.exports = router;