const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

// Endpoint to fetch driver details for dynamic dropdown of Conductor-For
router.get('/getDriverDetails', (req, res) => {
    const query = req.query.q;

    const sql = `
        SELECT 
            d.vehicle_no,
            d.name AS driver_name,
            c.name AS conductor_name
        FROM 
            transport_driver_conductor_details d
        LEFT JOIN 
            transport_driver_conductor_details c 
        ON 
            d.vehicle_no = c.vehicle_no 
            AND c.driver_conductor_type = 'Conductor'
        WHERE 
            d.driver_conductor_type = 'Driver' 
            AND (d.vehicle_no LIKE ? OR d.name LIKE ?);
    `;
    const values = [`%${query}%`, `%${query}%`];

    console.log('Executing SQL:', sql);
    console.log('With values:', values);

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        console.log('Query results for driver and conductor details:', results);
        res.status(200).json(results);
    });
});

// Endpoint to fetch route details
router.get('/route-details', (req, res) => {
    const query = req.query.q;

    const sql = `
        SELECT * 
        FROM transport_route_shift_details 
        WHERE route_shift_type = 'route' AND route_shift_name LIKE ?
    `;
    const values = [`%${query}%`];

    console.log('Executing SQL:', sql);
    console.log('With values:', values);

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        console.log('Query results for route details:', results);
        res.status(200).json(results);
    });
});

// Endpoint to fetch shift details
router.get('/shift-details', (req, res) => {
    const query = req.query.q;

    const sql = `
        SELECT * 
        FROM transport_route_shift_details 
        WHERE route_shift_type = 'shift' AND route_shift_name LIKE ?
    `;
    const values = [`%${query}%`];

    console.log('Executing SQL:', sql);
    console.log('With values:', values);

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        console.log('Query results for shift details:', results);
        res.status(200).json(results);
    });
});


// Endpoint to insert schedule details into the database
router.post('/addSchedule', (req, res) => {
    const { vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted } = req.body;

    const sql = `
        INSERT INTO transport_schedule_details (
            vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted];

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            console.error('Database insertion failed:', error);
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        console.log('Schedule details inserted successfully:', results);
        res.status(200).json({ message: 'Schedule details inserted successfully' });
    });
});


// Endpoint to fetch schedule details
router.get('/getScheduleDetails', (req, res) => {
    const sql = `
        SELECT * FROM transport_schedule_details;
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        console.log('Query results for schedule details:', results);
        res.status(200).json(results);
    });
});

module.exports = router;