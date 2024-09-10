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

// Endpoint to delete a shift by its ID
router.delete('/deleteShift/:shiftId', (req, res) => {
    const { shiftId } = req.params;

    // Query to delete the shift from the database (example using MySQL)
    const deleteQuery = 'DELETE FROM transport_route_shift_details WHERE route_shift_id = ?';

    req.connectionPool.query(deleteQuery, [shiftId], (error, results) => {
        if (error) {
            console.error('Error deleting shift:', error);
            return res.status(500).json({ message: 'Error deleting shift' });
        }

        // Check if any rows were affected (i.e., if the shift existed)
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // If successful, send a success message
        res.status(200).json({ message: 'Shift deleted successfully' });
    });
});

// Update shift endpoint
router.post('/updateShift', (req, res) => {
    const { shiftId, shiftName, shiftClasses } = req.body;

    if (!shiftId || !shiftName || shiftClasses === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Construct SQL query
    const sql = `UPDATE transport_route_shift_details
                 SET route_shift_name = ?, route_shift_detail = ?
                 WHERE route_shift_id = ?`;

    req.connectionPool.query(sql, [shiftName, shiftClasses, shiftId], (err, result) => {
        if (err) {
            console.error('Error updating shift:', err);
            return res.status(500).json({ message: 'Error updating shift' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        res.json({ message: 'Shift updated successfully' });
    });
});

module.exports = router;