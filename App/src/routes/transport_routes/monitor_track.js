const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

// Endpoint to fetch all coordinates
router.get('/fetch-all-coordinates', (req, res) => {
    const query = `
        SELECT name, vehicle_no, latitude, longitude, location_timestamp
        FROM transport_driver_conductor_details
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `;

    req.connectionPool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching coordinates:', err);
            return res.status(500).json({ error: 'Failed to fetch coordinates' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No coordinates found' });
        }

        res.json(results);
    });
});

module.exports = router;