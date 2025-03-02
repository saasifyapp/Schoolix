const express = require('express');
const router = express.Router();
const mysql = require('mysql');


const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Handle form submission // INSERT TO DATABASE //
router.post('/submit', (req, res) => {

    // Extract parameters from request body
    const { student_name, mobile_no, res_address, dob, standard, references } = req.body;
    const registeration_date = new Date().toISOString().split('T')[0]; // today's date in YYYY-MM-DD format
    // Set type to 'registered'
    const type = 'registered';

    // Package data to be inserted into the database
    const dataToInsert = { student_name, mobile_no, res_address, dob, standard, references, registeration_date, type };

    // Insert data into the database
    const query = req.connectionPool.query('INSERT INTO pre_adm_student_details SET ?', dataToInsert, (err, result) => {
        if (err) {
            console.error('Error inserting data: ' + err.stack);
            res.status(500).send('Error inserting data');
            return;
        }
        console.log('Inserted ' + result.affectedRows + ' row(s)');
        res.status(200).send('Data inserted successfully');
    });
});



// Add a new endpoint to retrieve student data // READ FROM DATABASE
router.get('/students', (req, res) => {
    const query = `SELECT * FROM pre_adm_student_details WHERE type = 'registered'`;
    req.connectionPool.query(query, (err, rows) => {
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
    let query = `SELECT * FROM pre_adm_student_details WHERE standard = ? AND type = 'registered'`;

    // Execute the SQL query
    req.connectionPool.query(query, [selectedClass], (err, rows) => {
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
    let query = `SELECT * FROM pre_adm_student_details WHERE student_name LIKE ? AND type = 'registered'`;

    // Execute the SQL query
    req.connectionPool.query(query, [`%${searchQuery}%`], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });


});

// Endpoint for admitting and removing students
router.post("/move-to-admitted", (req, res) => {
    const studentName = req.query.name;
    const mobileNo = req.query.mobile;
    const admitted_date = new Date().toISOString().split('T')[0]; // today's date in YYYY-MM-DD format

    // Construct the SQL query to update the student's type to 'admitted' and set the admitted_date
    const updateQuery = `
        UPDATE pre_adm_student_details
        SET type = 'admitted', admission_date = ?
        WHERE student_name = ? AND mobile_no = ?
    `;

    // Execute the SQL query to update the student's type and set the admitted_date
    req.connectionPool.query(updateQuery, [admitted_date, studentName, mobileNo], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("Error updating student to admitted status:", updateErr);
            return res.status(500).send("Error admitting student");
        }

        if (updateResult.affectedRows === 0) {
            // If no student was updated (i.e., student not found), send a 404 response
            res.status(404).send("Student not found");
            return;
        }
        
        console.log("Student admitted successfully:", updateResult);
        res.status(200).send("Student admitted successfully");
    });
});

router.delete("/remove-student", (req, res) => {

    const studentName = req.query.name;
    const mobileNo = req.query.mobile;

    // Construct the SQL query to delete the student from the database
    const query = `DELETE FROM pre_adm_student_details WHERE student_name = ? AND mobile_no = ? LIMIT 1`;

    // Execute the SQL query with the student's name as a parameter
    req.connectionPool.query(query, [studentName, mobileNo], (err, result) => {
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


// Display Admitted DATA
// Add a new endpoint to retrieve student data // READ FROM DATABASE
router.get('/admitted_student', (req, res) => {
    const query = `SELECT * FROM pre_adm_student_details WHERE type = 'admitted'`;
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
    let query = `SELECT * FROM pre_adm_student_details WHERE standard = ? AND type = 'admitted'`;

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
    let query = `SELECT * FROM pre_adm_student_details WHERE student_name LIKE ? AND type = 'admitted'`;

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
    const query = `DELETE FROM pre_adm_student_details WHERE student_name = ? AND mobile_no = ? LIMIT 1`;

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