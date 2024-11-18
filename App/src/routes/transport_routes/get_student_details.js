const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to fetch vehicle details for list students functionality
router.get('/listStudents_getVehicleDetails', (req, res) => {
    const query = req.query.q;

    // SQL query to fetch vehicle details
    const vehicleSql = `
        SELECT DISTINCT
            vehicle_no, 
            driver_name
        FROM transport_schedule_details 
        WHERE (driver_name LIKE ? OR vehicle_no LIKE ?) AND students_tagged IS NOT NULL
    `;
    const vehicleValues = [`%${query}%`, `%${query}%`];

    req.connectionPool.query(vehicleSql, vehicleValues, (vehicleError, vehicleResults) => {
        if (vehicleError) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.status(200).json(vehicleResults);
    });
});

// Endpoint to fetch shift details based on vehicle number
router.get('/listStudents_shiftDetails', (req, res) => {
    const vehicleNo = req.query.vehicleNo;

    // SQL query to fetch shift details based on vehicle number
    const shiftSql = `
        SELECT DISTINCT
            shift_name, 
            classes_alloted 
        FROM transport_schedule_details 
        WHERE vehicle_no = ?
    `;
    const shiftValues = [vehicleNo];

    req.connectionPool.query(shiftSql, shiftValues, (shiftError, shiftResults) => {
        if (shiftError) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.status(200).json(shiftResults);
    });
});


// Endpoint to fetch route stops based on vehicle number and shift name
router.get('/listStudents_getStops', (req, res) => {
    const vehicleNo = req.query.vehicleNo;
    const shiftName = req.query.shiftName;

    // SQL query to fetch route stops based on vehicle number and shift name
    const stopSql = `
        SELECT 
            route_stops
        FROM transport_schedule_details
        WHERE vehicle_no = ? AND shift_name = ?
    `;
    const stopValues = [vehicleNo, shiftName];

    req.connectionPool.query(stopSql, stopValues, (stopError, stopResults) => {
        if (stopError) {
            console.error('Database query failed:', stopError); // Log the error details
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (stopResults.length > 0 && stopResults[0].route_stops) {
            res.status(200).json({ route_stops: stopResults[0].route_stops });
        } else {
            res.status(200).json({ route_stops: '' });
        }
    });
});


// Endpoint to fetch classes based on vehicle number and shift name
router.get('/listStudents_getClass', (req, res) => {
    const vehicleNo = req.query.vehicleNo;
    const shiftName = req.query.shiftName;

    // SQL query to fetch classes based on vehicle number and shift name
    const classSql = `
        SELECT 
            classes_alloted
        FROM transport_schedule_details
        WHERE vehicle_no = ? AND shift_name = ?
    `;
    const classValues = [vehicleNo, shiftName];

    req.connectionPool.query(classSql, classValues, (classError, classResults) => {
        if (classError) {
            console.error('Database query failed:', classError); // Log the error details
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (classResults.length > 0 && classResults[0].classes_alloted) {
            res.status(200).json({ classes_alloted: classResults[0].classes_alloted });
        } else {
            res.status(200).json({ classes_alloted: '' });
        }
    });
});

// Endpoint to fetch vehicle info based on vehicle number and shift
router.get('/listStudents_getVehicleInfo', (req, res) => {
    const vehicleNo = req.query.vehicleNo;
    const shiftName = req.query.shiftName;

    // SQL query to fetch vehicle info
    const vehicleInfoSql = `
        SELECT DISTINCT
            vehicle_no, 
            driver_name,
            vehicle_capacity,
            available_seats
        FROM transport_schedule_details 
        WHERE vehicle_no = ? AND shift_name = ?
    `;
    const vehicleInfoValues = [vehicleNo, shiftName];

    req.connectionPool.query(vehicleInfoSql, vehicleInfoValues, (vehicleInfoError, vehicleInfoResults) => {
        if (vehicleInfoError) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.status(200).json(vehicleInfoResults);
    });
});


// Endpoint to fetch student and teacher details based on vehicle number, shift name, route, and class
router.get('/fetch_getStudentsList', (req, res) => {
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
                    standard, 
                    division, 
                    f_mobile_no, 
                    transport_pickup_drop 
                FROM pre_primary_student_details 
                WHERE standard IN (?) AND division IN (?) AND transport_pickup_drop IN (?) AND transport_tagged = ?
                UNION
                SELECT 
                    name, 
                    standard, 
                    division, 
                    f_mobile_no, 
                    transport_pickup_drop 
                FROM primary_student_details 
                WHERE standard IN (?) AND division IN (?) AND transport_pickup_drop IN (?) AND transport_tagged = ?
                UNION
                SELECT 
                    name, 
                    'Teacher' AS standard, 
                    '' AS division, 
                    mobile_no AS f_mobile_no, 
                    transport_pickup_drop 
                FROM teacher_details 
                WHERE transport_pickup_drop IN (?) AND transport_tagged = ? AND (${classesAlloted.map(cls => `FIND_IN_SET(?, classes_alloted) > 0`).join(' OR ')})
            `;
            const studentTeacherValues = [
                standards, divisions, routeStops, vehicleNo, 
                standards, divisions, routeStops, vehicleNo, 
                routeStops, vehicleNo, ...classesAlloted
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

            // Add sorting based on route_stops
            studentTeacherSql += ` ORDER BY FIELD(transport_pickup_drop, ${routeStops.map(() => '?').join(', ')})`;

            // Add the routeStops array again for the FIELD function
            studentTeacherValues.push(...routeStops);

            req.connectionPool.query(studentTeacherSql, studentTeacherValues, (studentTeacherError, studentTeacherResults) => {
                if (studentTeacherError) {
                    return res.status(500).json({ error: 'Database query failed' });
                }

                // Count students and teachers
                const studentCount = studentTeacherResults.filter(result => result.standard !== 'Teacher').length;
                const teacherCount = studentTeacherResults.filter(result => result.standard === 'Teacher').length;

                res.status(200).json({
                    studentCount,
                    teacherCount,
                    data: studentTeacherResults
                });
            });
        } else {
            res.status(200).json({
                studentCount: 0,
                teacherCount: 0,
                data: []
            });
        }
    });
});

module.exports = router;