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


// Endpoint to handle overflow allocation of students to multiple buses
router.post('/allocate_overflowStudentsToBuses', (req, res) => {
    const { vehicleNo, routeStops, shiftClasses, vehicleCapacity, routeName, shiftName } = req.body;

    console.log('Received request data:', req.body);

    const stopsArray = routeStops.split(',').map(stop => stop.trim());
    const classesArray = shiftClasses.split(',').map(cls => cls.trim());

    console.log('Stops Array:', stopsArray);
    console.log('Classes Array:', classesArray);

    // Fetch students based on route and shift
    const fetchStudentsSql = `
        SELECT student_id, transport_pickup_drop, Standard, Division
        FROM (
            SELECT student_id, transport_pickup_drop, Standard, Division
            FROM pre_primary_student_details
            WHERE transport_needed = 1 AND transport_tagged IS NULL
            UNION ALL
            SELECT student_id, transport_pickup_drop, Standard, Division
            FROM primary_student_details
            WHERE transport_needed = 1 AND transport_tagged IS NULL
        ) AS combined
        WHERE combined.transport_pickup_drop IN (?) AND CONCAT(combined.Standard, ' ', combined.Division) IN (?)
    `;
    req.connectionPool.query(fetchStudentsSql, [stopsArray, classesArray], (fetchError, students) => {
        if (fetchError) {
            console.error('Database query failed for fetching students:', fetchError);
            return res.status(500).json({ success: false, error: 'Database query failed for fetching students' });
        }

        console.log('Fetched students:', students);

        let remainingStudents = students.length;
        const studentsToAllocate = students.map(student => student.student_id);

        if (remainingStudents <= vehicleCapacity) {
            // Allocate students to the primary bus
            allocateStudentsToBus(vehicleNo, studentsToAllocate, stopsArray, classesArray, routeName, shiftName, vehicleCapacity, [], res, req, students);
        } else {
            // Allocate students to the primary bus up to its capacity
            const primaryBusStudents = studentsToAllocate.slice(0, vehicleCapacity);
            const remainingStudentIds = studentsToAllocate.slice(vehicleCapacity);

            // Allocate students to the primary bus
            allocateStudentsToBus(vehicleNo, primaryBusStudents, stopsArray, classesArray, routeName, shiftName, vehicleCapacity, remainingStudentIds, res, req, students);
        }
    });
});

function allocateStudentsToBus(vehicleNo, studentIds, stopsArray, classesArray, routeName, shiftName, vehicleCapacity, remainingStudentIds, res, req, allStudents) {
    console.log('Allocating students to bus:', vehicleNo);

    const sqlUpdatePrePrimary = `
        UPDATE pre_primary_student_details
        SET transport_tagged = ?
        WHERE student_id IN (?)
    `;
    const sqlUpdatePrimary = `
        UPDATE primary_student_details
        SET transport_tagged = ?
        WHERE student_id IN (?)
    `;

    req.connectionPool.query(sqlUpdatePrePrimary, [vehicleNo, studentIds], (updateErrorPrePrimary, updateResultsPrePrimary) => {
        if (updateErrorPrePrimary) {
            console.error('Database update failed for pre_primary_student_details:', updateErrorPrePrimary);
            return res.status(500).json({ success: false, error: 'Database update failed for pre_primary_student_details' });
        }

        req.connectionPool.query(sqlUpdatePrimary, [vehicleNo, studentIds], (updateErrorPrimary, updateResultsPrimary) => {
            if (updateErrorPrimary) {
                console.error('Database update failed for primary_student_details:', updateErrorPrimary);
                return res.status(500).json({ success: false, error: 'Database update failed for primary_student_details' });
            }

            // Fetch the student count for the primary bus
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

                // Update the transport_schedule_details table for the primary bus
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

                    // Handle remaining students
                    if (remainingStudentIds.length > 0) {
                        // Extract the transport_pickup_drop locations for the remaining students
                        const remainingStopsArray = allStudents.filter(student => remainingStudentIds.includes(student.student_id)).map(student => student.transport_pickup_drop);
                        handleOverflowStudents(vehicleNo, remainingStudentIds, remainingStopsArray, routeName, shiftName, res, req);
                    } else {
                        res.status(200).json({ success: true });
                    }
                });
            });
        });
    });
}

function handleOverflowStudents(primaryVehicleNo, remainingStudentIds, remainingStopsArray, routeName, shiftName, res, req) {
    console.log('Handling overflow students:', remainingStudentIds);
    console.log('Stops Array for overflow:', remainingStopsArray);
    console.log('Route Name:', routeName);
    console.log('Shift Name:', shiftName);

    // Construct the SQL query with multiple LIKE conditions for each stop
    const likeConditions = remainingStopsArray.map(stop => `route_stops LIKE '%${stop}%'`).join(' OR ');

    const fetchAvailableBusesSql = `
        SELECT vehicle_no, vehicle_capacity, available_seats
        FROM transport_schedule_details
        WHERE (${likeConditions}) AND shift_name = ? AND vehicle_no != ?
        ORDER BY vehicle_capacity DESC
    `;
    console.log('SQL Query:', fetchAvailableBusesSql);

    req.connectionPool.query(fetchAvailableBusesSql, [shiftName, primaryVehicleNo], (fetchError, availableBuses) => {
        if (fetchError) {
            console.error('Database query failed for fetching available buses:', fetchError);
            return res.status(500).json({ success: false, error: 'Database query failed for fetching available buses' });
        }

        console.log('Available buses for overflow:', availableBuses);

        if (availableBuses.length === 0) {
            return res.status(400).json({ success: false, error: 'Not enough buses to allocate all students. Please allocate a new bus.' });
        }

        const busesToAllocate = [];
        let remainingCount = remainingStudentIds.length;

        for (const bus of availableBuses) {
            if (remainingCount <= 0) break;

            const seatsToAllocate = Math.min(remainingCount, bus.available_seats || bus.vehicle_capacity);
            busesToAllocate.push({ vehicleNo: bus.vehicle_no, capacity: bus.vehicle_capacity, students: remainingStudentIds.slice(0, seatsToAllocate) });
            remainingStudentIds = remainingStudentIds.slice(seatsToAllocate);
            remainingCount -= seatsToAllocate;
        }

        if (remainingCount > 0) {
            return res.status(400).json({ success: false, error: 'Not enough buses to allocate all students. Please allocate a new bus.' });
        }

        updateBusesAndRespond(busesToAllocate, remainingStopsArray, routeName, shiftName, res, req);
    });
}

function updateBusesAndRespond(busesToAllocate, stopsArray, routeName, shiftName, res, req) {
    const allocateNextBus = (index) => {
        if (index >= busesToAllocate.length) {
            return res.status(200).json({ success: true });
        }

        const { vehicleNo, students } = busesToAllocate[index];
        const studentIds = students.map(student => student.student_id);

        const sqlUpdatePrePrimary = `
            UPDATE pre_primary_student_details
            SET transport_tagged = ?
            WHERE student_id IN (?)
        `;
        const sqlUpdatePrimary = `
            UPDATE primary_student_details
            SET transport_tagged = ?
            WHERE student_id IN (?)
        `;

        req.connectionPool.query(sqlUpdatePrePrimary, [vehicleNo, studentIds], (updateErrorPrePrimary, updateResultsPrePrimary) => {
            if (updateErrorPrePrimary) {
                console.error('Database update failed for pre_primary_student_details:', updateErrorPrePrimary);
                return res.status(500).json({ success: false, error: 'Database update failed for pre_primary_student_details' });
            }

            req.connectionPool.query(sqlUpdatePrimary, [vehicleNo, studentIds], (updateErrorPrimary, updateResultsPrimary) => {
                if (updateErrorPrimary) {
                    console.error('Database update failed for primary_student_details:', updateErrorPrimary);
                    return res.status(500).json({ success: false, error: 'Database update failed for primary_student_details' });
                }

                // Fetch current available seats and students tagged for the bus
                const fetchBusDetailsSql = `
                    SELECT available_seats, students_tagged, vehicle_capacity
                    FROM transport_schedule_details
                    WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
                `;
                req.connectionPool.query(fetchBusDetailsSql, [vehicleNo, routeName, shiftName], (fetchError, fetchResults) => {
                    if (fetchError || fetchResults.length === 0) {
                        console.error('Database query failed for fetching bus details:', fetchError);
                        return res.status(500).json({ success: false, error: 'Database query failed for fetching bus details' });
                    }

                    const availableSeats = fetchResults[0].available_seats !== null ? fetchResults[0].available_seats : fetchResults[0].vehicle_capacity;
                    const studentsTagged = fetchResults[0].students_tagged !== null ? fetchResults[0].students_tagged : 0;

                    console.log(`Bus details for ${vehicleNo}: availableSeats=${availableSeats}, studentsTagged=${studentsTagged}`);

                    // Update the transport_schedule_details table
                    const updateScheduleSql = `
                        UPDATE transport_schedule_details
                        SET available_seats = ?, students_tagged = ?
                        WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
                    `;
                    req.connectionPool.query(updateScheduleSql, [availableSeats - students.length, studentsTagged + students.length, vehicleNo, routeName, shiftName], (scheduleError, scheduleResults) => {
                        if (scheduleError) {
                            console.error('Database update failed for transport_schedule_details:', scheduleError);
                            return res.status(500).json({ success: false, error: 'Database update failed for transport_schedule_details' });
                        }

                        // Allocate the next bus
                        allocateNextBus(index + 1);
                    });
                });
            });
        });
    };

    // Start allocating buses
    allocateNextBus(0);
}

// Endpoint to fetch transport schedule details
router.get('/allocate_getScheduleDetails', (req, res) => {
    const sql = `
        SELECT 
            id,
            vehicle_no, 
            driver_name, 
            route_name, 
            route_stops, 
            shift_name, 
            classes_alloted, 
            available_seats, 
            students_tagged 
        FROM transport_schedule_details
        WHERE students_tagged IS NOT NULL
 
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to detag a bus
router.post('/allocate_detagBus', (req, res) => {
    const { vehicleNo, routeName, shiftName, classesAlloted } = req.body;

    // Split the classesAlloted array into Standard and Division
    const classesArray = classesAlloted.map(cls => {
        const [standard, ...divisionParts] = cls.split(' ');
        const division = divisionParts.join(' ');
        return { standard, division };
    });

    // Generate the SQL WHERE clause for Standard and Division pairs
    const whereClause = classesArray.map(({ standard, division }) => `(Standard = '${standard}' AND Division = '${division}')`).join(' OR ');

    // SQL query to update transport_tagged to NULL for specific students in pre_primary_student_details
    const sqlUpdateStudentsPrePrimary = `
        UPDATE pre_primary_student_details
        SET transport_tagged = NULL
        WHERE transport_tagged = ? AND (${whereClause})
    `;
    const sqlUpdateStudentsPrimary = `
        UPDATE primary_student_details
        SET transport_tagged = NULL
        WHERE transport_tagged = ? AND (${whereClause})
    `;
    const valuesUpdateStudents = [vehicleNo];

    // Execute the queries
    req.connectionPool.query(sqlUpdateStudentsPrePrimary, valuesUpdateStudents, (updateErrorPrePrimary, updateResultsPrePrimary) => {
        if (updateErrorPrePrimary) {
            console.error('Database update failed for pre_primary_student_details:', updateErrorPrePrimary);
            return res.status(500).json({ success: false, error: 'Database update failed for pre_primary_student_details' });
        }

        req.connectionPool.query(sqlUpdateStudentsPrimary, valuesUpdateStudents, (updateErrorPrimary, updateResultsPrimary) => {
            if (updateErrorPrimary) {
                console.error('Database update failed for primary_student_details:', updateErrorPrimary);
                return res.status(500).json({ success: false, error: 'Database update failed for primary_student_details' });
            }

            // Fetch vehicle capacity
            const fetchVehicleCapacitySql = `
                SELECT vehicle_capacity
                FROM transport_schedule_details
                WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
            `;
            req.connectionPool.query(fetchVehicleCapacitySql, [vehicleNo, routeName, shiftName], (fetchError, fetchResults) => {
                if (fetchError || fetchResults.length === 0) {
                    console.error('Database query failed for fetching vehicle capacity:', fetchError);
                    return res.status(500).json({ success: false, error: 'Database query failed for fetching vehicle capacity' });
                }

                const vehicleCapacity = fetchResults[0].vehicle_capacity;

                // SQL query to update transport_schedule_details
                const sqlUpdateSchedule = `
                    UPDATE transport_schedule_details
                    SET available_seats = ?, students_tagged = NULL
                    WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
                `;
                const valuesUpdateSchedule = [vehicleCapacity, vehicleNo, routeName, shiftName];

                req.connectionPool.query(sqlUpdateSchedule, valuesUpdateSchedule, (updateErrorSchedule, updateResultsSchedule) => {
                    if (updateErrorSchedule) {
                        console.error('Database update failed for transport_schedule_details:', updateErrorSchedule);
                        return res.status(500).json({ success: false, error: 'Database update failed for transport_schedule_details' });
                    }

                    res.status(200).json({ success: true });
                });
            });
        });
    });
});

module.exports = router;