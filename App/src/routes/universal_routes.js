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
        const query = `SELECT * FROM student_details WHERE Name LIKE ?`;
        const values = [`%${searchTerm}%`];

        req.connectionPool.query(query, values, (error, results) => {
            if (error) {
                console.error(`Error querying MySQL for search term ${searchTerm}:`, error);
                return res.status(500).json({ error: 'Error fetching student details from MySQL' });
            }
            
            // Log the fetched details
            //console.log('Fetched student details:', results);
            
            res.json(results);
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});




module.exports = router;
