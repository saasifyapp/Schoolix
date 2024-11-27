const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed


// Use the connection manager middleware
router.use(connectionManager);

// Endpoint to fetch student suggestions based on the search query
router.post('/fetch-student-suggestions', (req, res) => {
    const { query } = req.body;

    // Convert query to a suitable format for comparison
    const nameSearchQuery = `%${query}%`;
    const isNumericQuery = !isNaN(query);

    let sql;
    let values;

    if (isNumericQuery) {
        const grnoSearchQuery = parseInt(query, 10);
        sql = `
            SELECT 
                name, 
                Grno AS gr_no, 
                standard, 
                Division as division, 
                f_mobile_no, 
                transport_pickup_drop, 
                transport_tagged 
            FROM pre_primary_student_details 
            WHERE Grno = ? AND transport_needed = 1
            UNION
            SELECT 
                name, 
                Grno AS gr_no, 
                Standard, 
                Division as division, 
                f_mobile_no, 
                transport_pickup_drop, 
                transport_tagged 
            FROM primary_student_details 
            WHERE Grno = ? AND transport_needed = 1;
        `;
        values = [grnoSearchQuery, grnoSearchQuery];
    } else {
        sql = `
            SELECT 
                name, 
                Grno AS gr_no, 
                standard, 
                Division as division, 
                f_mobile_no, 
                transport_pickup_drop, 
                transport_tagged 
            FROM pre_primary_student_details 
            WHERE name LIKE ? AND transport_needed = 1
            UNION
            SELECT 
                name, 
                Grno AS gr_no, 
                Standard, 
                Division AS division, 
                f_mobile_no, 
                transport_pickup_drop, 
                transport_tagged 
            FROM primary_student_details 
            WHERE name LIKE ? AND transport_needed = 1;
        `;
        values = [nameSearchQuery, nameSearchQuery];
    }

    req.connectionPool.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error fetching student suggestions:', err);
            return res.status(500).json({ error: 'Failed to fetch student suggestions' });
        }
        res.json(results);
    });
});

module.exports = router;