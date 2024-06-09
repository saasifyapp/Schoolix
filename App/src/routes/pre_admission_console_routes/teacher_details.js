const express = require('express');
const router = express.Router();
const mysql = require('mysql');


// Define dbCredentials and connection outside the endpoint
let dbCredentials;
let connection;

// Middleware to set dbCredentials and connection
router.use((req, res, next) => {
    dbCredentials = req.session.dbCredentials;
    connection = mysql.createPool({
        host: dbCredentials.host,
        user: dbCredentials.user,
        password: dbCredentials.password,
        database: dbCredentials.database
    });
    next();
});


// Handle form submission  // INSERT TO DATABASE
router.post('/submit_teacher', (req, res) => {

    const createTableQuery3 = `
    CREATE TABLE IF NOT EXISTS pre_adm_registered_teachers (
        teacher_name varchar(25) NOT NULL,
        mobile_no varchar(10) NOT NULL,
        res_address varchar(30) NOT NULL,
        dob varchar(10) NOT NULL,
        qualification varchar(30) NOT NULL,
        experience varchar(30) NOT NULL
        
    )
    `;
    connection.query(createTableQuery3, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
    });

    const createTableQuery4 = `
    CREATE TABLE IF NOT EXISTS pre_adm_admitted_teachers (
        teacher_name varchar(25) NOT NULL,
        mobile_no varchar(10) NOT NULL,
        res_address varchar(30) NOT NULL,
        dob varchar(10) NOT NULL,
        qualification varchar(30) NOT NULL,
        experience varchar(30) NOT NULL

    )
    `;

    connection.query(createTableQuery4, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
    });

    const { teacher_name, mobile_no, res_address, dob, qualification, experience } = req.body;

    const dataToInsert = { teacher_name, mobile_no, res_address, dob, qualification, experience };

    const query = connection.query('INSERT INTO pre_adm_registered_teachers SET ?', dataToInsert, (err, result) => {
        if (err) {
            console.error('Error inserting data: ' + err.stack);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log('Inserted ' + result.affectedRows + ' row(s)');
        res.status(200).send('Data inserted successfully');


    });


});

module.exports = router;