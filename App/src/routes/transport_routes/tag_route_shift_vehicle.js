const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

// Endpoint to fetch driver and conductor details for dynamic dropdown of Conductor-For
router.get('/tag_getVehicleDetails', (req, res) => {
    const query = req.query.q;

    // SQL query to fetch driver details
    const driverSql = `
        SELECT 
            name AS driver_name, 
            vehicle_no, 
            vehicle_type, 
            vehicle_capacity, 
            (SELECT name FROM transport_driver_conductor_details WHERE vehicle_no = tdc.vehicle_no AND driver_conductor_type = 'Conductor') AS conductor_name
        FROM transport_driver_conductor_details tdc
        WHERE driver_conductor_type = 'Driver' AND (name LIKE ? OR vehicle_no LIKE ?)
    `;
    const driverValues = [`%${query}%`, `%${query}%`];

    req.connectionPool.query(driverSql, driverValues, (driverError, driverResults) => {
        if (driverError) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.status(200).json(driverResults);
    });
});

// Endpoint to fetch all route details where route_shift_type is 'route'
router.get('/tag_getRouteDetails', (req, res) => {
    const sql = `
        SELECT route_shift_name, route_shift_detail
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

// Endpoint to fetch all shift details where route_shift_type is 'shift'
router.get('/tag_getShiftDetails', (req, res) => {
    const sql = `
        SELECT route_shift_name, route_shift_detail
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

// Endpoint to populate transport schedule details
router.post('/tag_populateTransportSchedule', (req, res) => {
    const { vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted, vehicle_capacity } = req.body;

    const sqlInsert = `
        INSERT INTO transport_schedule_details (vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted,available_seats, vehicle_capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valuesInsert = [vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted,vehicle_capacity, vehicle_capacity];

    req.connectionPool.query(sqlInsert, valuesInsert, (insertError, insertResults) => {
        if (insertError) {
            console.error('Database insertion failed:', insertError);
            return res.status(500).json({ success: false, error: 'Database insertion failed' });
        }

        res.status(200).json({ success: true });
    });
});


// Endpoint to display route and shift allocation data
router.get('/tag_display_route_shift_allocation_data', (req, res) => {
    const sql = `
        SELECT id, vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted
        FROM transport_schedule_details
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to delete a transport schedule record
router.delete('/delete_transport_schedule/:id', (req, res) => {
    const { id } = req.params;

    // First, check if students_tagged is NULL for the given id
    const checkSql = `
        SELECT vehicle_no, students_tagged, driver_name, route_name, shift_name
        FROM transport_schedule_details
        WHERE id = ?
    `;

    req.connectionPool.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
            console.error('Database query failed:', checkError);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (checkResults.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        const { vehicle_no, students_tagged, driver_name, route_name, shift_name } = checkResults[0];

        if (students_tagged !== null) {
            return res.status(400).json({ 
                error: 'Cannot delete record with students tagged', 
                vehicle_no: vehicle_no, 
                students_tagged: students_tagged,
                driver_name:  driver_name,
                route_name: route_name,
                shift_name: shift_name
            });
        }

        // Proceed with deletion if students_tagged is NULL
        const deleteSql = `
            DELETE FROM transport_schedule_details
            WHERE id = ?
        `;

        req.connectionPool.query(deleteSql, [id], (deleteError, deleteResults) => {
            if (deleteError) {
                console.error('Database query failed:', deleteError);
                return res.status(500).json({ error: 'Database query failed' });
            }

            if (deleteResults.affectedRows === 0) {
                return res.status(404).json({ error: 'Record not found' });
            }

            res.status(200).json({ 
                success: true,
                vehicle_no: vehicle_no,
                route_name: route_name,
                shift_name: shift_name,
                driver_name:  driver_name

            });
        });
    });
});


module.exports = router;

