const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

// Endpoint to fetch driver and conductor details for dynamic dropdown of Conductor-For
router.get('/allocate_getVehicleDetails', (req, res) => {
    const query = req.query.q;

    // SQL query to fetch vehicle details
    const vehicleSql = `
        SELECT DISTINCT
            vehicle_no, 
            driver_name, 
            conductor_name, 
            vehicle_capacity 
        FROM transport_schedule_details 
        WHERE driver_name LIKE ? OR vehicle_no LIKE ?
    `;
    const vehicleValues = [`%${query}%`, `%${query}%`];

    req.connectionPool.query(vehicleSql, vehicleValues, (vehicleError, vehicleResults) => {
        if (vehicleError) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.status(200).json(vehicleResults);
    });
});

// Endpoint to fetch all route details where route_shift_type is 'route'
router.get('/allocate_getRouteDetails', (req, res) => {
    const sql = `
        SELECT DISTINCT route_name AS route_shift_name, route_stops AS route_shift_detail
        FROM transport_schedule_details
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to fetch all shift details where route_shift_type is 'shift'
router.get('/allocate_getShiftDetails', (req, res) => {
    const sql = `
        SELECT DISTINCT shift_name AS route_shift_name, classes_alloted AS route_shift_detail
        FROM transport_schedule_details
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});


// Endpoint to get student counts based on selected route and shift
router.get('/allocate_getStudentCount', (req, res) => {
    const { routeStops, shiftClasses } = req.query;

    const stopsArray = routeStops.split(',').map(stop => stop.trim());
    const classesArray = shiftClasses.split(',').map(cls => cls.trim());

    const sql = `
        SELECT COUNT(*) AS studentCount
        FROM (
            SELECT transport_pickup_drop, Standard, Division
            FROM pre_primary_student_details
            WHERE transport_needed = 1 AND transport_tagged IS NULL
            UNION ALL
            SELECT transport_pickup_drop, Standard, Division
            FROM primary_student_details
            WHERE transport_needed = 1 AND transport_tagged IS NULL
        ) AS combined
        WHERE combined.transport_pickup_drop IN (?) AND CONCAT(combined.Standard, ' ', combined.Division) IN (?)
    `;

    req.connectionPool.query(sql, [stopsArray, classesArray], (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results[0]);
    });
});


// New endpoint to tag students to the selected bus and update transport_schedule_details
router.post('/allocate_tagStudentsToBus', (req, res) => {
    const { vehicleNo, routeStops, shiftClasses, vehicleCapacity, routeName, shiftName } = req.body;

    //console.log('Data received by server:', req.body);


    const stopsArray = routeStops.split(',').map(stop => stop.trim());
    const classesArray = shiftClasses.split(',').map(cls => cls.trim());

    const sqlUpdatePrePrimary = `
        UPDATE pre_primary_student_details
        SET transport_tagged = ?
        WHERE transport_needed = 1 AND transport_pickup_drop IN (?) AND CONCAT(Standard, ' ', Division) IN (?) AND transport_tagged IS NULL
    `;
    const sqlUpdatePrimary = `
        UPDATE primary_student_details
        SET transport_tagged = ?
        WHERE transport_needed = 1 AND transport_pickup_drop IN (?) AND CONCAT(Standard, ' ', Division) IN (?) AND transport_tagged IS NULL
    `;

    req.connectionPool.query(sqlUpdatePrePrimary, [vehicleNo, stopsArray, classesArray], (updateErrorPrePrimary, updateResultsPrePrimary) => {
        if (updateErrorPrePrimary) {
            console.error('Database update failed for pre_primary_student_details:', updateErrorPrePrimary);
            return res.status(500).json({ success: false, error: 'Database update failed for pre_primary_student_details' });
        }

        req.connectionPool.query(sqlUpdatePrimary, [vehicleNo, stopsArray, classesArray], (updateErrorPrimary, updateResultsPrimary) => {
            if (updateErrorPrimary) {
                console.error('Database update failed for primary_student_details:', updateErrorPrimary);
                return res.status(500).json({ success: false, error: 'Database update failed for primary_student_details' });
            }

            // Fetch the student count
            const studentCountSql = `
                SELECT COUNT(*) AS studentCount
                FROM (
                    SELECT transport_pickup_drop, Standard, Division
                    FROM pre_primary_student_details
                    WHERE transport_needed = 1 AND transport_tagged = ?
                    UNION ALL
                    SELECT transport_pickup_drop, Standard, Division
                    FROM primary_student_details
                    WHERE transport_needed = 1 AND transport_tagged = ?
                ) AS combined
                WHERE combined.transport_pickup_drop IN (?) AND CONCAT(combined.Standard, ' ', combined.Division) IN (?)
            `;
            req.connectionPool.query(studentCountSql, [vehicleNo, vehicleNo, stopsArray, classesArray], (studentCountError, studentCountResults) => {
                if (studentCountError) {
                    console.error('Database query failed for student count:', studentCountError);
                    return res.status(500).json({ success: false, error: 'Database query failed for student count' });
                }

                const studentCount = studentCountResults[0].studentCount;
                const availableSeats = vehicleCapacity - studentCount;

                // Update the transport_schedule_details table
                const updateScheduleSql = `
                    UPDATE transport_schedule_details
                    SET available_seats = ?, students_tagged = ?
                    WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
                `;
                req.connectionPool.query(updateScheduleSql, [availableSeats, studentCount, vehicleNo, routeName, shiftName], (scheduleError, scheduleResults) => {
                    if (scheduleError) {
                        console.error('Database update failed for transport_schedule_details:', scheduleError);
                        return res.status(500).json({ success: false, error: 'Database update failed for transport_schedule_details' });
                    }

                    res.status(200).json({ success: true });
                });
            });
        });
    });
});



// Endpoint to fetch transport schedule details
router.get('/allocate_getScheduleDetails', (req, res) => {
    const sql = `
        SELECT 
            vehicle_no, 
            driver_name, 
            route_name, 
            route_stops, 
            shift_name, 
            classes_alloted, 
            available_seats, 
            students_tagged 
        FROM transport_schedule_details
        WHERE available_seats IS NOT NULL AND students_tagged IS NOT NULL

    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});


module.exports = router;