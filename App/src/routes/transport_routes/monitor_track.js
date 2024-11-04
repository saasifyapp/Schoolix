const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed


// Use the connection manager middleware
router.use(connectionManager);



// Endpoint to fetch school's location (latitude and longitude)
router.get('/getSchoolLocation', (req, res) => {
    const schoolName = req.cookies.schoolName;
    const username = req.cookies.username;

    if (!schoolName || !username) {
        console.log('Missing schoolName or username');
        return res.status(400).json({ error: 'School name and username are required' });
    }

    const sql = 'SELECT fixed_latitude, fixed_longitude FROM user_details WHERE schoolName = ? AND LoginName = ? LIMIT 1';
    const params = [schoolName, username];

    //console.log('SQL Query:', sql);
    //console.log('Parameters:', params);

    connection_auth.query(sql, params, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length === 0) {
            console.log('School location not found');
            return res.status(404).json({ error: 'School location not found' });
        }

        //console.log('Query Results:', results);
        res.status(200).json(results[0]);
    });
});

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


// Endpoint to fetch pick-drop logs based on vehicle number and shift
router.get('/exportPickDropLogs', (req, res) => {
    const vehicleNo = req.query.vehicleNo;
    const shiftName = req.query.shiftName;

    // SQL query to fetch pick-drop logs
    const pickDropLogsSql = `
        SELECT 
            student_name, 
            pick_drop_location, 
            date_of_log, 
            type_of_log, 
            vehicle_no, 
            driver_name, 
            shift, 
            standard
        FROM transport_pick_drop_logs 
        WHERE vehicle_no = ? AND shift = ?
    `;
    const pickDropLogsValues = [vehicleNo, shiftName];

    req.connectionPool.query(pickDropLogsSql, pickDropLogsValues, (pickDropLogsError, pickDropLogsResults) => {
        if (pickDropLogsError) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        // Send the results back to the client
        res.status(200).json(pickDropLogsResults);
    });
});


module.exports = router;