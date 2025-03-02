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
            SELECT Standard, Division FROM pre_primary_student_details WHERE is_active = 1
            UNION
            SELECT Standard, Division FROM primary_student_details WHERE is_active = 1
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


// Endpoint to validate shift details before adding or updating
router.post('/shift_validateDetails', (req, res) => {
    const { shiftId, shiftName } = req.body;

    // SQL query to check if the shift name already exists for a different shift
    const sqlValidateName = shiftId ? `
        SELECT route_shift_id
        FROM transport_route_shift_details
        WHERE route_shift_name = ? AND route_shift_id != ?
    ` : `
        SELECT route_shift_id
        FROM transport_route_shift_details
        WHERE route_shift_name = ?
    `;
    const valuesValidateName = shiftId ? [shiftName, shiftId] : [shiftName];

    // Check if the shift name already exists
    req.connectionPool.query(sqlValidateName, valuesValidateName, (validateErrorName, validateResultsName) => {
        if (validateErrorName) {
            console.error('Database validation failed:', validateErrorName);
            return res.status(500).json({ isValid: false, message: 'Database validation failed' });
        }

        if (validateResultsName.length > 0) {
            return res.status(400).json({ 
                isValid: false, 
                message: `A shift with the name '<strong>${shiftName}</strong>' already exists.`
            });
        }

        res.status(200).json({ isValid: true });
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
    const { shiftName } = req.body;

    // Query to check if the shift name exists in the transport_schedule_details table
    const checkQuery = `
        SELECT COUNT(*) AS count
        FROM transport_schedule_details
        WHERE shift_name = ?
    `;

    req.connectionPool.query(checkQuery, [shiftName], (checkError, checkResults) => {
        if (checkError) {
            return res.status(500).json({ message: 'Error checking shift in schedule' });
        }

        if (checkResults[0].count > 0) {
            // Shift is tagged in the schedule, cannot delete
            return res.status(400).json({ message: 'Cannot delete shift. It is tagged to a vehicle. Please untag from Tagging Console.' });
        }

        // If no record is found in the schedule table, proceed with deletion
        const deleteQuery = 'DELETE FROM transport_route_shift_details WHERE route_shift_id = ?';

        req.connectionPool.query(deleteQuery, [shiftId], (deleteError, deleteResults) => {
            if (deleteError) {
                return res.status(500).json({ message: 'Error deleting shift' });
            }

            // Check if any rows were affected (i.e., if the shift existed)
            if (deleteResults.affectedRows === 0) {
                return res.status(404).json({ message: 'Shift not found' });
            }

            // If successful, send a success message
            res.status(200).json({ message: 'Shift deleted successfully' });
        });
    });
});

// Update shift endpoint
router.post('/updateShift', (req, res) => {
    const { shiftId, shiftName, shiftClasses } = req.body;

    if (!shiftId || !shiftName || shiftClasses === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Construct SQL query to update the route shift details
    const updateRouteShiftQuery = `UPDATE transport_route_shift_details
                                   SET route_shift_name = ?, route_shift_detail = ?
                                   WHERE route_shift_id = ?`;

    req.connectionPool.query(updateRouteShiftQuery, [shiftName, shiftClasses, shiftId], (err, result) => {
        if (err) {
            console.error('Error updating shift:', err);
            return res.status(500).json({ message: 'Error updating shift' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        // After updating the route shift details,
        // update the schedule details for the same shift
        const updateScheduleQuery = `UPDATE transport_schedule_details
                                     SET shift_name = ?, classes_alloted = ?
                                     WHERE shift_name = ?`;

        req.connectionPool.query(updateScheduleQuery, [shiftName, shiftClasses, shiftName], (scheduleErr, scheduleResult) => {
            if (scheduleErr) {
                console.error('Error updating schedule details:', scheduleErr);
                return res.status(500).json({ message: 'Error updating schedule details' });
            }

            // Respond with a success message if both updates are successful
            res.status(200).json({ message: 'Shift updated successfully' });
        });
    });
});

module.exports = router;