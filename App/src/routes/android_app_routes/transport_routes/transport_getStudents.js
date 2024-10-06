const express = require('express');
const connectionManagerAndroid = require('../../../middleware/connectionManagerAndroid'); // Adjust the path as needed

const router = express.Router();

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