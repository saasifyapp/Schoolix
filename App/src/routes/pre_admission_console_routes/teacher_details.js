const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

// Handle form submission // INSERT TO DATABASE //
router.post('/submit_teacher', (req, res) => {
    const { teacher_name, mobile_no, res_address, dob, qualification, experience, references } = req.body;
    const registration_date = new Date().toISOString().split('T')[0]; // today's date in YYYY-MM-DD format
    const type = 'registered';

    const dataToInsert = { teacher_name, mobile_no, res_address, dob, qualification, experience, references, registration_date, type };

    const query = req.connectionPool.query('INSERT INTO pre_adm_teacher_details SET ?', dataToInsert, (err, result) => {
        if (err) {
            console.error('Error inserting data: ' + err.stack);
            res.status(500).send('Internal Server Error');
            return;
        }
        //console.log('Inserted ' + result.affectedRows + ' row(s)');
        res.status(200).send('Data inserted successfully');
    });
});

// Retrieve registered teacher data
router.get('/teachers', (req, res) => {
    const query = `SELECT * FROM pre_adm_teacher_details WHERE type = 'registered'`;
    req.connectionPool.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching data: ' + err.stack);
            res.status(500).json({ error: 'Error fetching data' });
            return;
        }
        res.json(rows);
    });
});

// Endpoint to update a teacher's status to admitted
router.post("/move-to-admitted-teacher", (req, res) => {
    const teacherName = req.query.name;
    const mobileNo = req.query.mobile;
    const admission_date = new Date().toISOString().split('T')[0]; // today's date in YYYY-MM-DD format

    // Construct the SQL query to update the teacher's type to 'admitted' and set the admission_date
    const updateQuery = `
        UPDATE pre_adm_teacher_details
        SET type = 'admitted', admission_date = ?
        WHERE teacher_name = ? AND mobile_no = ?
    `;

    // Execute the SQL query to update the teacher's type and set the admission_date
    req.connectionPool.query(updateQuery, [admission_date, teacherName, mobileNo], (updateErr, updateResult) => {
        if (updateErr) {
            console.error("Error updating teacher to admitted status:", updateErr);
            return res.status(500).send("Error admitting teacher");
        }

        if (updateResult.affectedRows === 0) {
            // If no teacher was updated (i.e., teacher not found), send a 404 response
            return res.status(404).send("Teacher not found");
        }

        //console.log("Teacher admitted successfully:", updateResult);
        res.status(200).send("Teacher admitted successfully");
    });
});

// Endpoint to search for registered teachers
router.get("/teachers/search", (req, res) => {
    const searchTerm = req.query.search.trim();
    const query = `SELECT * FROM pre_adm_teacher_details WHERE teacher_name LIKE ? AND type = 'registered'`;

    req.connectionPool.query(query, [`%${searchTerm}%`], (err, results) => {
        if (err) {
            console.error("Error searching for teachers:", err);
            return res.status(500).send("Error searching for teachers");
        }
        res.json(results);
    });
});

// Delete registered teacher
router.delete("/remove-teacher", (req, res) => {
    const teacherName = req.query.name;
    const mobileNo = req.query.mobile;

    // Construct the SQL query to delete the teacher from the database
    const query = `DELETE FROM pre_adm_teacher_details WHERE teacher_name = ? AND mobile_no = ? LIMIT 1`;

    // Execute the SQL query with the teacher's name and mobile number as parameters
    req.connectionPool.query(query, [teacherName, mobileNo], (err, result) => {
        if (err) {
            console.error("Error removing teacher:", err);
            return res.status(500).send("Error removing teacher");
        }
        if (result.affectedRows === 0) {
            // If no teacher was deleted (i.e., teacher not found), send a 404 response
            return res.status(404).send("Teacher not found");
        }
        //console.log("Teacher removed:", result);
        res.status(200).send("Teacher removed successfully");
    });
});

// Display admitted teacher data
router.get('/admitted_teachers', (req, res) => {
    const query = `SELECT * FROM pre_adm_teacher_details WHERE type = 'admitted'`;
    req.connectionPool.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching data: ' + err.stack);
            res.status(500).json({ error: 'Error fetching data' });
            return;
        }
        res.json(rows);
    });
});

// Search for admitted teachers
router.get("/admitted_teachers/search", (req, res) => {
    const searchQuery = req.query.search.trim();
    const query = `SELECT * FROM pre_adm_teacher_details WHERE teacher_name LIKE ? AND type = 'admitted'`;

    req.connectionPool.query(query, [`%${searchQuery}%`], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });
});

// Delete admitted teacher
router.delete("/remove-adm-teacher", (req, res) => {
    const teacherName = req.query.name;
    const mobileNo = req.query.mobile;

    // Construct the SQL query to delete the teacher from the database
    const query = `DELETE FROM pre_adm_teacher_details WHERE teacher_name = ? AND mobile_no = ? AND type = 'admitted' LIMIT 1`;

    // Execute the SQL query with the teacher's name and mobile number as parameters
    req.connectionPool.query(query, [teacherName, mobileNo], (err, result) => {
        if (err) {
            console.error("Error removing teacher:", err);
            return res.status(500).send("Error removing teacher");
        }
        if (result.affectedRows === 0) {
            // If no teacher was deleted (i.e., teacher not found), send a 404 response
            return res.status(404).send("Teacher not found");
        }
        //console.log("Teacher removed:", result);
        res.status(200).send("Teacher removed successfully");
    });
});

module.exports = router;