const express = require('express');
const router = express.Router();
const mysql = require('mysql');


// Define dbCredentials and connection outside the endpoint
let dbCredentials;
let connection;

// Middleware to set dbCredentials and create the connection pool if it doesn't exist
router.use((req, res, next) => {
    dbCredentials = req.session.dbCredentials;
    if (!connection) {
        connection = mysql.createPool({
            host: dbCredentials.host,
            user: dbCredentials.user,
            password: dbCredentials.password,
            database: dbCredentials.database
        });
    }
    next();
});

// Add a new endpoint to retrieve student data // READ FROM DATABASE
router.get('/students', (req, res) => {
    const query = 'SELECT * FROM pre_adm_registered_students';
    connection.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching data: ' + err.stack);
            res.status(500).json({ error: 'Error fetching data' });
            return;
        }
        res.json(rows);
    });


});

// Add a new endpoint to retrieve student data based on the selected class
router.get("/students/class/:class", (req, res) => {
    const selectedClass = req.params.class; // Get the selected class from request parameters

    // Construct the SQL query to filter based on the standard column
    let query = `SELECT * FROM pre_adm_registered_students WHERE standard = ?`;

    // Execute the SQL query
    connection.query(query, [selectedClass], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });


});

// Add a new endpoint to handle search queries
router.get("/students/search", (req, res) => {
    const searchQuery = req.query.search.trim(); // Get the search query from request URL query parameters

    // Construct the SQL query to filter based on the student name
    let query = `SELECT * FROM pre_adm_registered_students WHERE student_name LIKE ?`;

    // Execute the SQL query
    connection.query(query, [`%${searchQuery}%`], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });


});

//endpoint for admit and remove students
router.post("/move-to-admitted", (req, res) => {
    const studentName = req.query.name;
    const mobileNo = req.query.mobile;
    const address = req.query.address;
    const dob = req.query.dob;
    const standard = req.query.standard;

    // Construct the SQL query to insert the student into the admitted database
    const insertQuery = `INSERT INTO pre_adm_admitted_students (student_name, mobile_no, res_address, dob, standard) VALUES (?, ?, ?, ?, ?)`;

    // Execute the SQL query to insert the student into the admitted database
    connection.query(insertQuery, [studentName, mobileNo, address, dob, standard], (insertErr, insertResult) => {
        if (insertErr) {
            console.error("Error inserting student into admitted database:", insertErr);
            return res.status(500).send("Error admitting student");
        }

        // Construct the SQL query to delete the student from the database
        const query = `DELETE FROM pre_adm_registered_students WHERE student_name = ? AND mobile_no = ? LIMIT 1`;

        // Execute the SQL query with the student's name as a parameter
        connection.query(query, [studentName, mobileNo], (err, result) => {
            if (err) {
                console.error("Error removing student:", err);
                res.status(500).send("Error removing student");
                return;
            }
            if (result.affectedRows === 0) {
                // If no student was deleted (i.e., student not found), send a 404 response
                res.status(404).send("Student not found");
                return;
            }
            console.log("Student removed:", result);
            res.status(200).send("Student removed successfully");
        });

    });

});

router.delete("/remove-student", (req, res) => {

    const studentName = req.query.name;
    const mobileNo = req.query.mobile;

    // Construct the SQL query to delete the student from the database
    const query = `DELETE FROM pre_adm_registered_students WHERE student_name = ? AND mobile_no = ? LIMIT 1`;

    // Execute the SQL query with the student's name as a parameter
    connection.query(query, [studentName, mobileNo], (err, result) => {
        if (err) {
            console.error("Error removing student:", err);
            res.status(500).send("Error removing student");
            return;
        }
        if (result.affectedRows === 0) {
            // If no student was deleted (i.e., student not found), send a 404 response
            res.status(404).send("Student not found");
            return;
        }
        console.log("Student removed:", result);
        res.status(200).send("Student removed successfully");
    });

});


module.exports = router;