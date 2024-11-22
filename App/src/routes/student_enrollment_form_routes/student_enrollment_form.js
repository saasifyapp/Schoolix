const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);



// GET Endpoint to fetch unique castes from combined tables
router.get('/getUniqueCastes', (req, res) => {
    const query = `
        SELECT Caste 
        FROM primary_student_details
        UNION
        SELECT Caste 
        FROM pre_primary_student_details;
    `;

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching unique castes:', error);
            return res.status(500).json({ error: 'Error fetching unique castes' });
        }
        res.status(200).json(results);
    });
});


// New endpoint to fetch the next GR Number based on section
router.get('/getNextGrno', (req, res) => {
    const { section } = req.query; // Get the section parameter from query string
    console.log(`Received section: ${section}`); // For testing, just log the section value

    let query = `SELECT MAX(Grno) AS maxGrno FROM test_student_details`;

    // Future: Modify the query or logic based on the section value
    if (section) {
        // Example modification if needed:
        // query = `SELECT MAX(Grno) AS maxGrno FROM ${section}_student_details`;
    }

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching GR Number:', error);
            return res.status(500).json({ error: 'Error fetching GR Number' });
        }
        const maxGrno = results[0].maxGrno || 0; // If no records, start from 0
        const nextGrno = maxGrno + 1;
        res.status(200).json({ nextGrno, section });
    });
});



module.exports = router;