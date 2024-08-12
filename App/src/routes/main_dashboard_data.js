const express = require('express');
const router = express.Router();
const mysql = require('mysql');


const connectionManager = require('../middleware/connectionManager'); // Adjust the path to match the new location

// Use the connection manager middleware
router.use(connectionManager);


router.get('/main_dashboard_data', (req, res) => {

    // Define an object to store counts for each table
    const counts = {};

    // Array of table names
    const tableNames = ['pre_adm_registered_students', 'pre_adm_admitted_students', 'pre_adm_registered_teachers', 'pre_adm_admitted_teachers']; // Adjust table names as per your database schema

    // Fetch counts for each table
    const promises = tableNames.map(tableName => {
        return new Promise((resolve, reject) => {
            req.connectionPool.query(`SELECT COUNT(*) AS count FROM ${tableName}`, (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for table ${tableName}:`, error);
                    reject(error);
                } else {
                    if (results && results.length > 0 && results[0].count !== undefined) {
                        // Extract the count value using the alias 'count'
                        const count = results[0].count;
                        // Store the count in the counts object
                        counts[tableName] = count;
                        resolve();
                    } else {
                        console.error(`No count found for table ${tableName}`);
                        counts[tableName] = 0; // Assuming count is 0 if not found
                        resolve();
                    }
                }
            });
        });
    });

    

    // Once all counts are fetched, send them as a response
    Promise.all(promises)
        .then(() => {
            res.json(counts);
        })
        .catch(error => {
            res.status(500).json({ error: 'Error fetching counts from MySQL' });
        });
});



router.get('/main_dashboard_library_data', (req, res) => {
    // Define an object to store counts for each category
    const counts = {};


    // Define queries for each count
    const queries = {
        totalBooks: 'SELECT COUNT(*) AS count FROM library_book_details',
        memberCount: 'SELECT COUNT(*) AS count FROM library_member_details',
        booksIssued: `SELECT COUNT(*) AS count FROM library_transactions`,
        booksAvailable: `SELECT SUM(available_quantity) AS count FROM library_book_details`,
        outstandingBooks: `SELECT COUNT(*) AS count FROM library_transactions WHERE return_date < CURDATE()`,
        booksIssuedToday: `SELECT COUNT(*) AS count FROM library_transaction_log WHERE transaction_date = CURDATE() AND transaction_type = 'issue'`,
        booksReturnedToday: `SELECT COUNT(*) AS count FROM library_transaction_log WHERE transaction_date = CURDATE() AND transaction_type = 'return'`,
        penaltiesCollected: `SELECT SUM(penalty_paid) AS count FROM library_transaction_log WHERE penalty_status = 'paid'`
    };

    // Fetch counts for each category
    const promises = Object.keys(queries).map(key => {
        return new Promise((resolve, reject) => {
            req.connectionPool.query(queries[key], (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for ${key}:`, error);
                    reject(error);
                } else {
                    if (results && results.length > 0 && results[0].count !== undefined) {
                        // Extract the count value using the alias 'count'
                        counts[key] = results[0].count;
                        //console.log(`${key}: ${counts[key]}`); // Log the count value
                        resolve();
                    } else {
                        console.error(`No count found for ${key}`);
                        counts[key] = 0; // Assuming count is 0 if not found
                        console.log(`${key}: ${counts[key]}`); // Log the count value
                        resolve();
                    }
                }
            });
        });
    });

    // Once all counts are fetched, send them as a response
    Promise.all(promises)
        .then(() => {
            res.json(counts);
        })
        .catch(error => {
            res.status(500).json({ error: 'Error fetching counts from MySQL' });
        });
});


// Endpoint to get Student counts //

router.get('/student_counts', (req, res) => {
    // Define an object to store counts
    const counts = {};

    // Define queries for each count
    const queries = {
        totalStudents: 'SELECT COUNT(*) AS count FROM student_details',
        maleStudents: "SELECT COUNT(*) AS count FROM student_details WHERE Gender = 'Male'",
        femaleStudents: "SELECT COUNT(*) AS count FROM student_details WHERE Gender = 'Female'"
    };

    // Fetch counts for each category
    const promises = Object.keys(queries).map(key => {
        return new Promise((resolve, reject) => {
            req.connectionPool.query(queries[key], (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for ${key}:`, error);
                    reject(error);
                } else {
                    if (results && results.length > 0 && results[0].count !== undefined) {
                        // Extract the count value using the alias 'count'
                        counts[key] = results[0].count;
                        resolve();
                    } else {
                        console.error(`No count found for ${key}`);
                        counts[key] = 0; // Assuming count is 0 if not found
                        resolve();
                    }
                }
            });
        });
    });

    // Once all counts are fetched, send them as a response
    Promise.all(promises)
        .then(() => {
            res.json(counts);
        })
        .catch(error => {
            res.status(500).json({ error: 'Error fetching counts from MySQL' });
        });
});

module.exports = router;