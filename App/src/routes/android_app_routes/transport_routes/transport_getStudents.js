const express = require('express');
const connectionManagerAndroid = require('../../../middleware/connectionManagerAndroid'); // Adjust the path as needed
const moment = require('moment-timezone');

const router = express.Router();

// Endpoint to fetch driver details based on driver name
router.get('/android/driver-details', connectionManagerAndroid, (req, res) => {
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

// Endpoint to fetch shift details based on driver name and shift name
router.get('/android/shift-details', connectionManagerAndroid, (req, res) => {
    const { driverName, shiftName } = req.query;

    if (!driverName || !shiftName) {
        return res.status(400).json({ message: 'Driver name and shift name are required' });
    }

    const query = `
        SELECT 
            shift_name, 
            students_tagged, 
            route_stops,
            LENGTH(route_stops) - LENGTH(REPLACE(route_stops, ',', '')) + 1 AS route_stops_count 
        FROM 
            transport_schedule_details 
        WHERE 
            driver_name = ? AND shift_name = ?
    `;

    req.connectionPool.query(query, [driverName, shiftName], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            console.log('No shift details found for the driver and shift name.');
            return res.status(404).json({ message: 'No shift details found for the driver and shift name.' });
        }

        res.json(results[0]);
    });
});

// API endpoint to receive coordinates
router.post('/android/send-coordinates', connectionManagerAndroid, (req, res) => {
    const { driverName, vehicleNumber, latitude, longitude } = req.body;

    // Get the current timestamp in IST
    const timestampIST = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    // Update the table with the new coordinates and timestamp
    const query = `
        UPDATE transport_driver_conductor_details
        SET latitude = ?, longitude = ?, location_timestamp = ?
        WHERE name = ? AND vehicle_no = ?
    `;

    req.connectionPool.query(query, [latitude, longitude, timestampIST, driverName, vehicleNumber], (err, result) => {
        if (err) {
            console.error('Error updating coordinates:', err);
            return res.status(500).json({ error: 'Failed to update coordinates' });
        }

        res.json({ message: 'Coordinates updated successfully' });
    });
});

// Endpoint to fetch student details based on vehicle number, shift name, route, and class
router.get('/android/get-student-details', connectionManagerAndroid, (req, res) => {
    const vehicleNo = req.query.vehicleNo;
    const shiftName = req.query.shiftName;
    const route = req.query.route || ''; // Optional route filter
    const classFilter = req.query.class || ''; // Optional class filter

    // SQL query to fetch classes_alloted and route_stops from the schedule table
    const scheduleSql = `
        SELECT 
            classes_alloted, 
            route_stops 
        FROM transport_schedule_details 
        WHERE vehicle_no = ? AND shift_name = ?
    `;
    const scheduleValues = [vehicleNo, shiftName];

    req.connectionPool.query(scheduleSql, scheduleValues, (scheduleError, scheduleResults) => {
        if (scheduleError) {
            console.error('Database query failed:', scheduleError); // Log the error details
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (scheduleResults.length > 0) {
            const classesAlloted = scheduleResults[0].classes_alloted.split(', ');
            const routeStops = scheduleResults[0].route_stops.split(', ');

            // Separate standard and division
            const standards = [];
            const divisions = [];

            classesAlloted.forEach(cls => {
                const [standard, division] = cls.split(' ');
                if (!standards.includes(standard)) {
                    standards.push(standard);
                }
                if (!divisions.includes(division)) {
                    divisions.push(division);
                }
            });

            // SQL query to fetch student details from pre_primary_student_details and primary_student_details tables
            let studentSql = `
                SELECT 
                    name, 
                    CONCAT(standard, ' ', division) AS class, 
                    f_mobile_no, 
                    transport_pickup_drop 
                FROM pre_primary_student_details 
                WHERE standard IN (?) AND division IN (?) AND transport_pickup_drop IN (?) AND transport_tagged = ?
                UNION
                SELECT 
                    name, 
                    CONCAT(standard, ' ', division) AS class, 
                    f_mobile_no, 
                    transport_pickup_drop 
                FROM primary_student_details 
                WHERE standard IN (?) AND division IN (?) AND transport_pickup_drop IN (?) AND transport_tagged = ?
            `;
            const studentValues = [standards, divisions, routeStops, vehicleNo, standards, divisions, routeStops, vehicleNo];

            // Add filtering for route if provided
            if (route) {
                studentSql += ' AND transport_pickup_drop = ?';
                studentValues.push(route);
            }

            // Add filtering for class if provided
            if (classFilter) {
                const [standard, division] = classFilter.split(' ');
                studentSql += ' AND standard = ? AND division = ?';
                studentValues.push(standard, division);
            }

            req.connectionPool.query(studentSql, studentValues, (studentError, studentResults) => {
                if (studentError) {
                    console.error('Database query failed:', studentError); // Log the error details
                    return res.status(500).json({ error: 'Database query failed' });
                }

                console.log('Raw student results:', studentResults); // Log the raw results for debugging

                console.log(`Fetched ${studentResults.length} student(s)`); // Log the count of items fetched

                res.status(200).json(studentResults);
            });
        } else {
            res.status(200).json([]);
        }
    });
});

module.exports = router;

