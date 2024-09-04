const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to fetch vehicle details for list students functionality
router.get('/listStudents_getVehicleDetails', (req, res) => {
    const query = req.query.q;

    // SQL query to fetch vehicle details
    const vehicleSql = `
        SELECT DISTINCT
            vehicle_no, 
            driver_name, 
            conductor_name, 
            vehicle_capacity,
            available_seats,
            students_tagged 
        FROM transport_schedule_details 
        WHERE driver_name LIKE ? OR vehicle_no LIKE ?
    `;
    const vehicleValues = [`%${query}%`, `%${query}%`];

    req.connectionPool.query(vehicleSql, vehicleValues, (vehicleError, vehicleResults) => {
        if (vehicleError) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.status(200).json(vehicleResults);
    });
});


// Endpoint to fetch shift details based on vehicle number
router.get('/listStudents_shiftDetails', (req, res) => {
    const vehicleNo = req.query.vehicleNo;

    // SQL query to fetch shift details based on vehicle number
    const shiftSql = `
        SELECT DISTINCT
            shift_name, 
            classes_alloted 
        FROM transport_schedule_details 
        WHERE vehicle_no = ?
    `;
    const shiftValues = [vehicleNo];

    req.connectionPool.query(shiftSql, shiftValues, (shiftError, shiftResults) => {
        if (shiftError) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.status(200).json(shiftResults);
    });
});


// Endpoint to fetch route stops based on vehicle number and shift name
router.get('/listStudents_getStops', (req, res) => {
    const vehicleNo = req.query.vehicleNo;
    const shiftName = req.query.shiftName;

    // SQL query to fetch route stops based on vehicle number and shift name
    const stopSql = `
        SELECT 
            route_stops
        FROM transport_schedule_details
        WHERE vehicle_no = ? AND shift_name = ?
    `;
    const stopValues = [vehicleNo, shiftName];

    req.connectionPool.query(stopSql, stopValues, (stopError, stopResults) => {
        if (stopError) {
            console.error('Database query failed:', stopError); // Log the error details
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (stopResults.length > 0 && stopResults[0].route_stops) {
            res.status(200).json({ route_stops: stopResults[0].route_stops });
        } else {
            res.status(200).json({ route_stops: '' });
        }
    });
});


// Endpoint to fetch classes based on vehicle number and shift name
router.get('/listStudents_getClass', (req, res) => {
    const vehicleNo = req.query.vehicleNo;
    const shiftName = req.query.shiftName;

    // SQL query to fetch classes based on vehicle number and shift name
    const classSql = `
        SELECT 
            classes_alloted
        FROM transport_schedule_details
        WHERE vehicle_no = ? AND shift_name = ?
    `;
    const classValues = [vehicleNo, shiftName];

    req.connectionPool.query(classSql, classValues, (classError, classResults) => {
        if (classError) {
            console.error('Database query failed:', classError); // Log the error details
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (classResults.length > 0 && classResults[0].classes_alloted) {
            res.status(200).json({ classes_alloted: classResults[0].classes_alloted });
        } else {
            res.status(200).json({ classes_alloted: '' });
        }
    });
});


module.exports = router;