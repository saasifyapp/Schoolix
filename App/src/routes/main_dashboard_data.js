const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../middleware/connectionManager'); // Adjust the path to match the new location
const { connection_auth } = require('../../main_server'); // Adjust the path as needed

// Use the connection manager middleware
router.use(connectionManager);

// Helper function to wrap connection query in a promise
const runQuery = (connection, query, params) => {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

// GET endpoint to fetch main dashboard data
router.get('/main_dashboard_data', (req, res) => {
    const counts = {};
    const tableNames = ['pre_adm_registered_students', 'pre_adm_admitted_students', 'pre_adm_registered_teachers', 'pre_adm_admitted_teachers'];

    const promises = tableNames.map(tableName => {
        return runQuery(req.connectionPool, `SELECT COUNT(*) AS count FROM ${tableName}`, [])
            .then(results => {
                counts[tableName] = results[0].count;
            })
            .catch(error => {
                console.error(`Error querying MySQL for table ${tableName}:`, error);
                counts[tableName] = 0;
            });
    });

    Promise.all(promises)
        .then(() => res.json(counts))
        .catch(error => res.status(500).json({ error: 'Error fetching counts from MySQL' }));
});

// GET endpoint to fetch main dashboard library data
router.get('/main_dashboard_library_data', (req, res) => {
    const counts = {};
    const queries = {
        totalBooks: 'SELECT COUNT(*) AS count FROM library_book_details',
        memberCount: 'SELECT COUNT(*) AS count FROM library_member_details',
        booksIssued: 'SELECT COUNT(*) AS count FROM library_transactions',
        booksAvailable: 'SELECT SUM(available_quantity) AS count FROM library_book_details',
        outstandingBooks: 'SELECT COUNT(*) AS count FROM library_transactions WHERE return_date < CURDATE()',
        booksIssuedToday: 'SELECT COUNT(*) AS count FROM library_transaction_log WHERE transaction_date = CURDATE() AND transaction_type = "issue"',
        booksReturnedToday: 'SELECT COUNT(*) AS count FROM library_transaction_log WHERE transaction_date = CURDATE() AND transaction_type = "return"',
        penaltiesCollected: 'SELECT SUM(penalty_paid) AS count FROM library_transaction_log WHERE penalty_status = "paid"'
    };

    const promises = Object.keys(queries).map(key => {
        return runQuery(req.connectionPool, queries[key], [])
            .then(results => {
                counts[key] = results[0].count;
            })
            .catch(error => {
                console.error(`Error querying MySQL for ${key}:`, error);
                counts[key] = 0;
            });
    });

    Promise.all(promises)
        .then(() => res.json(counts))
        .catch(error => res.status(500).json({ error: 'Error fetching counts from MySQL' }));
});

// POST endpoint to check confirmation status
router.post('/check-confirmation-status', async (req, res) => {
    const { loginName } = req.body;

    if (!connection_auth) {
        console.error('Database connection is not available');
        return res.status(500).json({ error: 'Database connection is not available' });
    }

    const checkUserSql = `SELECT confirmed_at_school FROM user_details WHERE LoginName = ?`;

    try {
        const userResults = await runQuery(connection_auth, checkUserSql, [loginName]);

        if (userResults.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const confirmedAtSchool = userResults[0].confirmed_at_school;
        res.json({ confirmed_at_school: confirmedAtSchool });
    } catch (error) {
        console.error('Error checking confirmation status:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// POST endpoint to confirm user location
router.post('/confirm-location', async (req, res) => {
    const { loginName, latitude, longitude } = req.body;

    if (!connection_auth) {
        console.error('Database connection is not available');
        return res.status(500).json({ error: 'Database connection is not available' });
    }

    const updateSql = `UPDATE user_details SET fixed_latitude = ?, fixed_longitude = ?, confirmed_at_school = 1 WHERE LoginName = ?`;

    try {
        await runQuery(connection_auth, updateSql, [latitude, longitude, loginName]);
        res.json({ success: true, message: 'Location confirmed and saved.' });
    } catch (error) {
        console.error('Error in confirm-location:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// GET endpoint to get student counts
router.get('/student_counts', (req, res) => {
    const counts = {};
    const queries = {
        primary_totalStudents: 'SELECT COUNT(*) AS count FROM primary_student_details',
        primary_maleStudents: "SELECT COUNT(*) AS count FROM primary_student_details WHERE Gender = 'Male'",
        primary_femaleStudents: "SELECT COUNT(*) AS count FROM primary_student_details WHERE Gender = 'Female'",
        pre_primary_totalStudents: 'SELECT COUNT(*) AS count FROM pre_primary_student_details',
        pre_primary_maleStudents: "SELECT COUNT(*) AS count FROM pre_primary_student_details WHERE Gender = 'Male'",
        pre_primary_femaleStudents: "SELECT COUNT(*) AS count FROM pre_primary_student_details WHERE Gender = 'Female'"
    };

    const promises = Object.keys(queries).map(key => {
        return runQuery(req.connectionPool, queries[key], [])
            .then(results => {
                counts[key] = results[0].count;
            })
            .catch(error => {
                console.error(`Error querying MySQL for ${key}:`, error);
                counts[key] = 0;
            });
    });

    Promise.all(promises)
        .then(() => res.json(counts))
        .catch(error => res.status(500).json({ error: 'Error fetching counts from MySQL' }));
});

module.exports = router;