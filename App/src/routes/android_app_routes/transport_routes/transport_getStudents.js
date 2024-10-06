const express = require('express');
const connectionManagerAndroid = require('../../../middleware/connectionManagerAndroid'); // Adjust the path as needed

const router = express.Router();

// Endpoint to fetch driver details based on driver name
router.get('/driver-details', connectionManagerAndroid, (req, res) => {
    const { driverName } = req.query;

    if (!driverName) {
        return res.status(400).json({ message: 'Driver name is required' });
    }

    const query = 'SELECT * FROM transport_schedule_details WHERE driver_name = ?';

    req.connectionPool.query(query, [driverName], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            console.log('No details found for the driver.');
            return res.status(404).json({ message: 'No details found for the driver.' });
        }

        res.json(results);
    });
});

// Endpoint to fetch a list of drivers
router.get('/android/driver-details', connectionManagerAndroid, (req, res) => {
    const query = 'SELECT name, contact, vehicle_no FROM transport_driver_conductor_details LIMIT 10';

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
});

module.exports = router;