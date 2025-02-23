const express = require('express');
const router = express.Router();
 
const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// New endpoint to get distinct addresses for route assignment
router.get('/distinctAddresses', (req, res) => {
    const sql = `
        SELECT DISTINCT transport_pickup_drop
        FROM (
            SELECT transport_pickup_drop FROM pre_primary_student_details WHERE transport_pickup_drop IS NOT NULL AND is_active = 1
            UNION
            SELECT transport_pickup_drop FROM primary_student_details WHERE transport_pickup_drop IS NOT NULL AND is_active = 1
        ) AS combined_addresses;
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});


// Endpoint to validate route details before adding or updating
router.post('/route_validateDetails', (req, res) => {
    const { routeId, routeName } = req.body;

    // SQL query to check if the route name already exists for a different route
    const sqlValidateName = routeId ? `
        SELECT route_shift_id
        FROM transport_route_shift_details
        WHERE route_shift_name = ? AND route_shift_id != ?
    ` : `
        SELECT route_shift_id
        FROM transport_route_shift_details
        WHERE route_shift_name = ?
    `;
    const valuesValidateName = routeId ? [routeName, routeId] : [routeName];

    // Check if the route name already exists
    req.connectionPool.query(sqlValidateName, valuesValidateName, (validateErrorName, validateResultsName) => {
        if (validateErrorName) {
            console.error('Database validation failed:', validateErrorName);
            return res.status(500).json({ isValid: false, message: 'Database validation failed' });
        }

        if (validateResultsName.length > 0) {
            return res.status(400).json({ 
                isValid: false, 
                message: `A route with the name '<strong>${routeName}</strong>' already exists.`
            });
        }

        res.status(200).json({ isValid: true });
    });
});


// Endpoint to add a new route
router.post('/addRoute', (req, res) => {
    const { routeName, citiesAddress } = req.body;

    // Validate required fields
    if (!routeName || !citiesAddress) {
        return res.status(400).json({ error: 'Route Name and Cities/Address are required fields' });
    }

    // Insert data into the table
    const sql = `
        INSERT INTO transport_route_shift_details (route_shift_type, route_shift_name, route_shift_detail)
        VALUES ('route', ?, ?)
    `;
    const values = [routeName, citiesAddress];

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(200).json({ message: 'Route added successfully', id: results.insertId });
    });
});



// Endpoint to fetch all route details where route_shift_type is 'route'
router.get('/displayRoutes', (req, res) => {
    const sql = `
        SELECT route_shift_id, route_shift_name, route_shift_detail
        FROM transport_route_shift_details
        WHERE route_shift_type = 'route'
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to delete a route by its ID
router.delete('/deleteRoute/:routeId', (req, res) => {
    const { routeId } = req.params;
    const { routeName } = req.body;

    // Query to check if the route name exists in the schedule table
    const checkQuery = `
        SELECT COUNT(*) AS count
        FROM transport_schedule_details
        WHERE route_name = ?
    `;

    req.connectionPool.query(checkQuery, [routeName], (checkError, checkResults) => {
        if (checkError) {
            return res.status(500).json({ message: 'Error checking route in schedule' });
        }

        if (checkResults[0].count > 0) {
            // Route is tagged in the schedule, cannot delete
            return res.status(400).json({ message: 'Cannot delete route. It is tagged to a vehicle. Please untag from Tagging Console.' });
        }

        // If no record is found in the schedule table, proceed with deletion
        const deleteQuery = 'DELETE FROM transport_route_shift_details WHERE route_shift_id = ?';

        req.connectionPool.query(deleteQuery, [routeId], (deleteError, deleteResults) => {
            if (deleteError) {
                return res.status(500).json({ message: 'Error deleting route' });
            }

            // Check if any rows were affected (i.e., if the route existed)
            if (deleteResults.affectedRows === 0) {
                return res.status(404).json({ message: 'Route not found' });
            }

            // If successful, send a success message
            res.status(200).json({ message: 'Route deleted successfully' });
        });
    });
});



// Route to handle updating the transport route shift details
router.post('/updateRoute', (req, res) => {
    const { routeShiftId, routeName, routeCities, routeType } = req.body;
    
    if (!routeShiftId || !routeName || !routeCities || !routeType) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // SQL query to update the route shift table
    const updateRouteShiftQuery = `
        UPDATE transport_route_shift_details
        SET route_shift_name = ?, 
            route_shift_detail = ?, 
            route_shift_type = ?
        WHERE route_shift_id = ?`;

    req.connectionPool.query(updateRouteShiftQuery, [routeName, routeCities, routeType, routeShiftId], (routeShiftError, routeShiftResults) => {
        if (routeShiftError) {
            console.error('Error updating route shift details:', routeShiftError);
            return res.status(500).json({ error: 'Database update failed' });
        }

        // If the first update is successful, execute the update for the schedule table
        const updateScheduleQuery = `
            UPDATE transport_schedule_details
            SET route_name = ?, 
                route_stops = ?
            WHERE route_name = ?`;

        req.connectionPool.query(updateScheduleQuery, [routeName, routeCities, routeName], (scheduleError, scheduleResults) => {
            if (scheduleError) {
                console.error('Error updating schedule details:', scheduleError);
                return res.status(500).json({ error: 'Database update failed' });
            }

            // If both updates are successful
            res.status(200).json({ message: 'Route updated successfully' });
        });
    });
});

module.exports = router;