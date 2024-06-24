const express = require('express');
const router = express.Router();
const mysql = require('mysql');


const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);



// Display Admitted DATA
// Add a new endpoint to retrieve student data // READ FROM DATABASE
router.get('/admitted_student', (req, res) => {
    const query = 'SELECT * FROM pre_adm_admitted_students';
    req.connectionPool .query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching data: ' + err.stack);
            res.status(500).json({ error: 'Error fetching data' });
            return;
        }
        res.json(rows);
    });
});

// Add a new endpoint to retrieve student data based on the selected class
router.get("/admitted_student/class/:class", (req, res) => {
    const selectedClass = req.params.class; // Get the selected class from request parameters

    // Construct the SQL query to filter based on the standard column
    let query = `SELECT * FROM pre_adm_admitted_students WHERE standard = ?`;

    // Execute the SQL query
    req.connectionPool .query(query, [selectedClass], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });


});

// Add a new endpoint to handle search queries
router.get("/admitted_student/search", (req, res) => {
    const searchQuery = req.query.search.trim(); // Get the search query from request URL query parameters

    // Construct the SQL query to filter based on the student name
    let query = `SELECT * FROM pre_adm_admitted_students WHERE student_name LIKE ?`;

    // Execute the SQL query
    req.connectionPool .query(query, [`%${searchQuery}%`], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });


});

router.delete("/remove-adm-student", (req, res) => {

    const studentName = req.query.name;
    const mobileNo = req.query.mobile;

    // Construct the SQL query to delete the student from the database
    const query = `DELETE FROM pre_adm_admitted_students WHERE student_name = ? AND mobile_no = ? LIMIT 1`;

    // Execute the SQL query with the student's name as a parameter
    req.connectionPool .query(query, [studentName, mobileNo], (err, result) => {
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