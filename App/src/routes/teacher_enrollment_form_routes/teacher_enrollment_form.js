const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to get distinct shift details
router.get('/get-shift-details', (req, res) => {
    const sql = `
        SELECT DISTINCT route_shift_name 
        FROM transport_route_shift_details 
        WHERE route_shift_type = 'shift';
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, error: 'Database query failed' });
        }

        if (results.length > 0) {
            res.status(200).json({ success: true, shifts: results.map(result => result.route_shift_name) });
        } else {
            res.status(200).json({ success: false, shifts: [] });
        }
    });
});

// Endpoint to filter based on route_stops LIKE and shift_name = ?
router.post('/get-Vehicle-Running-for-teacher', (req, res) => {
    let { routeStops, shiftName } = req.body;

    if (typeof routeStops === 'string') {
        routeStops = routeStops.trim();
    }

    if (typeof shiftName === 'string') {
        shiftName = shiftName.trim();
    }

    const sql = `
        SELECT vehicle_no, driver_name, shift_name, route_stops
        FROM transport_schedule_details
        WHERE route_stops LIKE ? AND shift_name = ?
        LIMIT 1000;
    `;

    const queryParams = [`%${routeStops}%`, shiftName];

    req.connectionPool.query(sql, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, error: 'Database query failed' });
        }

        if (results.length > 0) {
            res.status(200).json({ success: true, vehicles: results });
        } else {
            res.status(200).json({ success: false, vehicles: [] });
        }
    });
});


// Endpoint to get detailed vehicle info based on vehicle number, route, and shift
router.get('/get-vehicle-info-for-teacher', (req, res) => {
    const { vehicleNo, route, shift } = req.query;

    if (!vehicleNo || !route || !shift) {
        return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    const sql = `
        SELECT vehicle_no, driver_name, vehicle_capacity, available_seats
        FROM transport_schedule_details
        WHERE vehicle_no = ? AND route_stops LIKE ? AND shift_name = ?
        LIMIT 1;
    `;

    const queryParams = [vehicleNo, `%${route}%`, shift];

    req.connectionPool.query(sql, queryParams, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ success: false, error: 'Database query failed' });
        }

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(200).json([]);
        }
    });
});

module.exports = router;