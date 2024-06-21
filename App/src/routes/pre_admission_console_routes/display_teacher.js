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

//retrieve teacher data
router.get('/teachers', (req, res) => {
    const query = 'SELECT * FROM pre_adm_registered_teachers';
    connection.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching data: ' + err.stack);
            res.status(500).json({ error: 'Error fetching data' });
            return;
        }
        res.json(rows);
    });
});

// Endpoint to admit a teacher
router.post("/move-to-admitted-teacher", (req, res) => {
    const teacherName = req.query.name;
    const mobileNo = req.query.mobile;
    const address = req.query.address;
    const dob = req.query.dob;
    const qualification = req.query.qualification;
    const experience = req.query.experience;

    // Construct the SQL query to insert the teacher into the admitted database
    const insertQuery = `INSERT INTO pre_adm_admitted_teachers (teacher_name, mobile_no, res_address, dob, qualification, experience) VALUES (?, ?, ?, ?, ?, ?)`;

    // Execute the SQL query to insert the teacher into the admitted database
    connection.query(insertQuery, [teacherName, mobileNo, address, dob, qualification, experience], (insertErr, insertResult) => {
        if (insertErr) {
            console.error("Error inserting teacher into admitted database:", insertErr);
            return res.status(500).send("Error admitting teacher");
        }

        // Construct the SQL query to delete the teacher from the database
        const query = `DELETE FROM pre_adm_registered_teachers WHERE teacher_name = ? AND mobile_no = ? LIMIT 1`;

        // Execute the SQL query to delete the teacher from the database
        connection.query(query, [teacherName, mobileNo], (err, result) => {
            if (err) {
                console.error("Error removing teacher:", err);
                return res.status(500).send("Error removing teacher");
            }
            if (result.affectedRows === 0) {
                // If no teacher was deleted (i.e., teacher not found), send a 404 response
                return res.status(404).send("Teacher not found");
            }
            console.log("Teacher removed:", result);
            res.status(200).send("Teacher admitted and removed successfully");
        });
    });
});

// Endpoint to search for teachers
router.get("/teachers/search", (req, res) => {
    const searchTerm = req.query.search;

    // Construct the SQL query to search for teachers based on the provided search term
    const query = `SELECT * FROM pre_adm_registered_teachers WHERE teacher_name LIKE '%${searchTerm}%'`;

    // Execute the SQL query to search for teachers
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error searching for teachers:", err);
            return res.status(500).send("Error searching for teachers");
        }

        // Send the results back to the client
        res.json(results);
    });
});

// Endpoint to remove a teacher
router.delete("/remove-teacher", (req, res) => {
    const teacherName = req.query.name;
    const mobileNo = req.query.mobile;

    // Construct the SQL query to delete the teacher from the database
    const query = `DELETE FROM pre_adm_registered_teachers WHERE teacher_name = ? AND mobile_no = ? LIMIT 1`;

    // Execute the SQL query with the teacher's name and mobile number as parameters
    connection.query(query, [teacherName, mobileNo], (err, result) => {
        if (err) {
            console.error("Error removing teacher:", err);
            return res.status(500).send("Error removing teacher");
        }
        if (result.affectedRows === 0) {
            // If no teacher was deleted (i.e., teacher not found), send a 404 response
            return res.status(404).send("Teacher not found");
        }
        console.log("Teacher removed:", result);
        // Send a success response
        res.status(200).send("Teacher removed successfully");
    });
});

module.exports = router;