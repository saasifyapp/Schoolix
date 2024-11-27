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


// Endpoint to update student transport tagged details in both tables
router.post('/updateStudentTransport', (req, res) => {
    const { grNo, studentName, standard, division, vehicleTagged } = req.body;

    if (!grNo || !studentName || !standard || !division || !vehicleTagged) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const queryPrimary = `
        UPDATE primary_student_details
        SET transport_tagged = ?
        WHERE Grno = ? AND Name = ? AND standard = ? AND Division = ?
    `;

    const queryPrePrimary = `
        UPDATE pre_primary_student_details
        SET transport_tagged = ?
        WHERE Grno = ? AND Name = ? AND standard = ? AND Division = ?
    `;

    const queryParams = [vehicleTagged, grNo, studentName, standard, division];

    // Execute updates on both tables
    req.connectionPool.query(queryPrimary, queryParams, (errorPrimary, resultsPrimary) => {
        if (errorPrimary) {
            console.error('Error updating primary transport tagged:', errorPrimary);
            return res.status(500).json({ success: false, error: 'Database update failed for primary table' });
        }

        req.connectionPool.query(queryPrePrimary, queryParams, (errorPrePrimary, resultsPrePrimary) => {
            if (errorPrePrimary) {
                console.error('Error updating pre-primary transport tagged:', errorPrePrimary);
                return res.status(500).json({ success: false, error: 'Database update failed for pre-primary table' });
            }

            if (resultsPrimary.affectedRows > 0 || resultsPrePrimary.affectedRows > 0) {
                res.status(200).json({ success: true, message: 'Transport tagged updated successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Student not found in either table' });
            }
        });
    });
});

module.exports = router;