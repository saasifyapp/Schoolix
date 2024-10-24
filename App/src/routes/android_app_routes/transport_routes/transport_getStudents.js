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

// Endpoint to fetch student and teacher details based on vehicle number, shift name, route, and class
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

            // SQL query to fetch student and teacher details
            let studentTeacherSql = `
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
                UNION
                SELECT 
                    name, 
                    'Teacher' AS class, 
                    mobile_no AS f_mobile_no, 
                    transport_pickup_drop 
                FROM teacher_details 
                WHERE transport_pickup_drop IN (?) AND transport_tagged = ?
            `;
            const studentTeacherValues = [
                standards, divisions, routeStops, vehicleNo, 
                standards, divisions, routeStops, vehicleNo, 
                routeStops, vehicleNo
            ];

            // Add filtering for route if provided
            if (route) {
                studentTeacherSql += ' AND transport_pickup_drop = ?';
                studentTeacherValues.push(route);
            }

            // Add filtering for class if provided
            if (classFilter) {
                const [standard, division] = classFilter.split(' ');
                studentTeacherSql += ' AND standard = ? AND division = ?';
                studentTeacherValues.push(standard, division);

                // Add class filter for teachers as well
                studentTeacherSql += ' AND FIND_IN_SET(?, classes_alloted) > 0';
                studentTeacherValues.push(`${standard} ${division}`);
            }

            req.connectionPool.query(studentTeacherSql, studentTeacherValues, (studentTeacherError, studentTeacherResults) => {
                if (studentTeacherError) {
                    console.error('Database query failed:', studentTeacherError); // Log the error details
                    return res.status(500).json({ error: 'Database query failed' });
                }

                console.log('Raw student and teacher results:', studentTeacherResults); // Log the raw results for debugging

                console.log(`Fetched ${studentTeacherResults.length} student(s) and teacher(s)`); // Log the count of items fetched

                res.status(200).json(studentTeacherResults);
            });
        } else {
            res.status(200).json([]);
        }
    });
});


// Endpoint to log pick/drop events
router.post('/android/log-pick-drop-event', connectionManagerAndroid, (req, res) => {
    const { studentName, pickDropLocation, typeOfLog, vehicleNo, driverName, shift, standard } = req.body;

    if (!studentName || !pickDropLocation || !typeOfLog || !vehicleNo || !driverName || !shift || !standard) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const dateOfLog = moment().tz('Asia/Kolkata').format('YYYY-MM-DD'); // Get the current date in YYYY-MM-DD format in IST

    const checkQuery = `
        SELECT * FROM transport_pick_drop_logs 
        WHERE student_name = ? AND pick_drop_location = ? AND date_of_log = ? AND type_of_log = ? AND vehicle_no = ? AND driver_name = ? AND shift = ? AND standard = ?
    `;

    req.connectionPool.query(checkQuery, [studentName, pickDropLocation, dateOfLog, typeOfLog, vehicleNo, driverName, shift, standard], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            return res.status(409).json({ message: `Student already logged under ${typeOfLog} category for this date` }); // 409 Conflict
        }

        const insertQuery = `
            INSERT INTO transport_pick_drop_logs (student_name, pick_drop_location, date_of_log, type_of_log, vehicle_no, driver_name, shift, standard)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        req.connectionPool.query(insertQuery, [studentName, pickDropLocation, dateOfLog, typeOfLog, vehicleNo, driverName, shift, standard], (error, results) => {
            if (error) {
                console.error('Error inserting into database:', error);
                return res.status(500).send('Internal Server Error');
            }

            res.status(201).json({ message: 'Log entry created successfully' });
        });
    });
});


module.exports = router;

