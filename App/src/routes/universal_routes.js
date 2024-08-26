const express = require('express');
const router = express.Router();

const connectionManager = require('../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Route to search for students
router.get('/get_student_details', async (req, res) => {
    try {
        // Log the incoming request parameters
        // console.log('Incoming request query:', req.query);

        const searchTerm = req.query.q;
        const primaryQuery = `SELECT * FROM primary_student_details WHERE Name LIKE ?`;
        const prePrimaryQuery = `SELECT * FROM pre_primary_student_details WHERE Name LIKE ?`;
        const values = [`${searchTerm}%`];

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

        // Log the fetched details
        // console.log('Fetched student details:', combinedResults);

        res.json(combinedResults);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



module.exports = router;
