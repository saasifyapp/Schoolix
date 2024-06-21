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

// Handle form submission  // INSERT TO DATABASE //
router.post('/submit', (req, res) => {

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS pre_adm_registered_students (
            student_name varchar(25) NOT NULL,
            mobile_no varchar(10) NOT NULL,
            res_address varchar(25) NOT NULL,
            dob varchar(10) NOT NULL,
            standard varchar(8) DEFAULT NULL
        )
    `;
    connection.query(createTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
    });

    const createTableQuery2 = `
        CREATE TABLE IF NOT EXISTS pre_adm_admitted_students (
            student_name varchar(25) NOT NULL,
            mobile_no varchar(10) NOT NULL,
            res_address varchar(25) NOT NULL,
            dob varchar(10) NOT NULL,
            standard varchar(8) DEFAULT NULL
        )
    `;
    connection.query(createTableQuery2, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
    });


    const { student_name, mobile_no, res_address, dob, standard } = req.body;
    const dataToInsert = { student_name, mobile_no, res_address, dob, standard };

    const query = connection.query('INSERT INTO pre_adm_registered_students SET ?', dataToInsert, (err, result) => {
        if (err) {
            console.error('Error inserting data: ' + err.stack);
            res.status(500).send('Error inserting data');
            return;
        }
        console.log('Inserted ' + result.affectedRows + ' row(s)');
        res.status(200).send('Data inserted successfully');
    });


});

module.exports = router;