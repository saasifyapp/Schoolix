const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

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

module.exports = router;