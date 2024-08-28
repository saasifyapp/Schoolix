const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to fetch distinct standards with divisions for shift assignment
router.get('/distinctStandardsDivisions', (req, res) => {
    const sql = `
        SELECT DISTINCT CONCAT(Standard, ' ', Division) AS standard_with_division
        FROM (
            SELECT Standard, Division FROM pre_primary_student_details
            UNION
            SELECT Standard, Division FROM primary_student_details
        ) AS combined_standards
        ORDER BY Standard;
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to add a new shift
router.post('/addShift', (req, res) => {
    const { shiftName, shiftType } = req.body;

    // Validate required fields
    if (!shiftName || !shiftType) {
        return res.status(400).json({ error: 'Shift Name and Shift Type are required fields' });
    }

    // Insert data into the table
    const sql = `
        INSERT INTO transport_route_shift_details (route_shift_type, route_shift_name, route_shift_detail)
        VALUES ('shift', ?, ?)
    `;
    const values = [shiftName, shiftType];

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(200).json({ message: 'Shift added successfully', id: results.insertId });
    });
});

// Endpoint to fetch all shift details where route_shift_type is 'shift'
router.get('/displayShifts', (req, res) => {
    const sql = `
        SELECT route_shift_id, route_shift_name, route_shift_detail
        FROM transport_route_shift_details
        WHERE route_shift_type = 'shift'
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;