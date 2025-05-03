const express = require('express');
const router = express.Router();

const connectionManager = require('../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

// Route to search for students
router.get('/get_student_details', async (req, res) => {
    try {
        const searchTerm = req.query.q.trim();
        let primaryQuery, prePrimaryQuery, values;

        if (/^\d+$/.test(searchTerm)) { // If input is a number, search by Grno
            primaryQuery = `SELECT * FROM primary_student_details WHERE Grno LIKE ? AND is_active = 1`;
            prePrimaryQuery = `SELECT * FROM pre_primary_student_details WHERE Grno LIKE ? AND is_active = 1`;
            values = [`${searchTerm}%`];  // Partial match for Grno
        } else { // Otherwise, search by Name
            primaryQuery = `SELECT * FROM primary_student_details WHERE Name LIKE ? AND is_active = 1`;
            prePrimaryQuery = `SELECT * FROM pre_primary_student_details WHERE Name LIKE ? AND is_active = 1`;
            values = [`${searchTerm}%`];  // Partial match for Name
        }

        // Execute both queries
        const primaryPromise = new Promise((resolve, reject) => {
            req.connectionPool.query(primaryQuery, values, (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for primary search term ${searchTerm}:`, error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        const prePrimaryPromise = new Promise((resolve, reject) => {
            req.connectionPool.query(prePrimaryQuery, values, (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for pre-primary search term ${searchTerm}:`, error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        // Wait for both queries to complete
        const [primaryResults, prePrimaryResults] = await Promise.all([primaryPromise, prePrimaryPromise]);

        // Combine the results
        const combinedResults = [...primaryResults, ...prePrimaryResults];

        res.json(combinedResults);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Keep-alive route FIRST — before any auth/session middleware
router.get('/keep-alive', (req, res) => {
    console.log(`✅ [KEEP-ALIVE] Server is alive at ${new Date().toLocaleString()}`);
    res.status(200).json({ message: 'Server is alive!' });
});

module.exports = router;
