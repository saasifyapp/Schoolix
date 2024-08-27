const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to fetch driver details for dynamic dropdown of Conductor-For
router.get('/getDriverDetails', (req, res) => {
    const query = req.query.q;

    const sql = `
        SELECT name, vehicle_no 
        FROM transport_driver_conductor_details 
        WHERE driver_conductor_type = 'driver' AND (name LIKE ? OR vehicle_no LIKE ?)
    `;
    const values = [`%${query}%`, `%${query}%`];

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});


// Endpoint to handle driverConductor form submission
router.post('/addDriverConductor', (req, res) => {
    const { name, contact, address, type, vehicle_no, vehicle_type, vehicle_capacity } = req.body;

    // Validate required fields
    if (!name || !contact || !address || !type) {
        return res.status(400).json({ error: 'Name, contact, address, and type are required fields' });
    }

    // Insert data into the table
    const sql = `
        INSERT INTO transport_driver_conductor_details (name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, contact, address, type, vehicle_no, vehicle_type, vehicle_capacity];

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(200).json({ message: 'Driver/Conductor added successfully', id: results.insertId });
    });
});



module.exports = router;