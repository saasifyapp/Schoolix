const express = require('express');
const router = express.Router();
const mysql = require('mysql');


const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


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
    req.connectionPool.query(createTableQuery, (err, result) => {
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
    req.connectionPool.query(createTableQuery2, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
    });


    const { student_name, mobile_no, res_address, dob, standard } = req.body;
    const dataToInsert = { student_name, mobile_no, res_address, dob, standard };

    const query = req.connectionPool.query('INSERT INTO pre_adm_registered_students SET ?', dataToInsert, (err, result) => {
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