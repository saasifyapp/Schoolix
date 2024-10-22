const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to fetch driver and conductor details for dynamic dropdown of Conductor-For
router.get('/allocate_getVehicleDetails', (req, res) => {
    const query = req.query.q;
    const routeName = req.query.routeName;
    const shiftName = req.query.shiftName;

    // SQL query to fetch vehicle details
    const vehicleSql = `
        SELECT DISTINCT
            vehicle_no, 
            driver_name, 
            conductor_name, 
            vehicle_capacity,
            available_seats 
        FROM transport_schedule_details 
        WHERE (driver_name LIKE ? OR vehicle_no LIKE ?)
        AND route_name = ? 
        AND shift_name = ?
    `;
    const vehicleValues = [`%${query}%`, `%${query}%`, routeName, shiftName];

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
    const routeName = req.query.routeName;
    const sql = `
        SELECT DISTINCT shift_name AS route_shift_name, classes_alloted AS route_shift_detail
        FROM transport_schedule_details
        WHERE route_name = ?
    `;

    req.connectionPool.query(sql, [routeName], (error, results) => {
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

    // Construct the updated SQL query
    const sql = `
        SELECT
            (SELECT COUNT(*)
             FROM (
                 SELECT transport_pickup_drop, Standard, Division
                 FROM pre_primary_student_details
                 WHERE transport_needed = 1 AND transport_tagged IS NULL
                 UNION ALL
                 SELECT transport_pickup_drop, Standard, Division
                 FROM primary_student_details
                 WHERE transport_needed = 1 AND transport_tagged IS NULL
             ) AS combined
             WHERE combined.transport_pickup_drop IN (?)
             AND CONCAT(combined.Standard, ' ', combined.Division) IN (?)
            ) AS studentCount,

            (SELECT COUNT(*)
             FROM teacher_details
             WHERE transport_needed = 1 AND transport_tagged IS NULL
             AND transport_pickup_drop IN (?)
             AND (${classesArray.map(() => `FIND_IN_SET(?, classes_alloted)`).join(' > 0 OR ')} > 0)
            ) AS teacherCount
    `;

    const queryParameters = [stopsArray, classesArray, stopsArray, ...classesArray];

    req.connectionPool.query(sql, queryParameters, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.status(200).json(results[0]);
    });
});

// Endpoint to validate if the selected route, shift, and vehicle exist in one row and fetch the driver name
router.post('/validate_tagged_routeShiftVehicle', (req, res) => {
    const { routeName, shiftName, vehicleNo } = req.body;

    const sql = `
        SELECT driver_name
        FROM transport_schedule_details
        WHERE route_name = ? AND shift_name = ? AND vehicle_no = ?
    `;

    req.connectionPool.query(sql, [routeName, shiftName, vehicleNo], (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ success: false, error: 'Database query failed' });
        }

        if (results.length > 0) {
            const driverName = results[0].driver_name;
            res.status(200).json({ success: true, driverName });
        } else {
            res.status(200).json({ success: false });
        }
    });
}); 


// New endpoint to tag students and teachers to the selected bus and update transport_schedule_details
router.post('/allocate_tagStudentsToBus', (req, res) => {
    const { vehicleNo, routeStops, shiftClasses, availableSeats, routeName, shiftName } = req.body;

    const stopsArray = routeStops.routeDetail.split(',').map(stop => stop.trim());
    const classesArray = shiftClasses.shiftDetail.split(',').map(cls => cls.trim());

    // Fetch students who need transport and are not yet tagged
    const sqlFetchStudents = `
        SELECT Student_id, Name, transport_pickup_drop, Standard, Division
        FROM pre_primary_student_details
        WHERE transport_needed = 1 AND transport_tagged IS NULL
          AND transport_pickup_drop IN (?) AND CONCAT(Standard, ' ', Division) IN (?)
        UNION ALL
        SELECT Student_id, Name, transport_pickup_drop, Standard, Division
        FROM primary_student_details
        WHERE transport_needed = 1 AND transport_tagged IS NULL
          AND transport_pickup_drop IN (?) AND CONCAT(Standard, ' ', Division) IN (?)
        ORDER BY transport_pickup_drop ASC
    `;

    // Fetch teachers who need transport and are not yet tagged
    const sqlFetchTeachers = `
        SELECT id AS Teacher_id, name AS Name, transport_pickup_drop
        FROM teacher_details
        WHERE transport_needed = 1 AND transport_tagged IS NULL
          AND transport_pickup_drop IN (?) AND (${classesArray.map(() => `FIND_IN_SET(?, classes_alloted)`).join(' > 0 OR ')} > 0)
    `;

    req.connectionPool.query(sqlFetchStudents, [stopsArray, classesArray, stopsArray, classesArray], (fetchErrorStudents, fetchResultsStudents) => {
        if (fetchErrorStudents) {
            return res.status(500).json({ success: false, error: 'Database query failed for fetching students' });
        }

        const students = fetchResultsStudents.map(row => ({
            id: row.Student_id,
            name: row.Name,
            pickupDrop: row.transport_pickup_drop,
            standard: row.Standard,
            division: row.Division
        }));

        req.connectionPool.query(sqlFetchTeachers, [stopsArray, ...classesArray], (fetchErrorTeachers, fetchResultsTeachers) => {
            if (fetchErrorTeachers) {
                return res.status(500).json({ success: false, error: 'Database query failed for fetching teachers' });
            }

            const teachers = fetchResultsTeachers.map(row => ({
                id: row.Teacher_id,
                name: row.Name,
                pickupDrop: row.transport_pickup_drop,
            }));

            // Process student allocation
            const routeStopsStudents = [...new Set(students.map(student => student.pickupDrop))];
            const classesAllotedStudents = [...new Set(students.map(student => `${student.standard} ${student.division}`))];

            const classesArrayStudents = classesAllotedStudents.map(cls => {
                const [standard, ...divisionParts] = cls.split(' ');
                const division = divisionParts.join(' ');
                return { standard, division };
            });

            const whereClauseStudents = classesArrayStudents.map(({ standard, division }) => `(Standard = '${standard}' AND Division = '${division}')`).join(' OR ');

            const sqlUpdateStudentsPrePrimary = `
                UPDATE pre_primary_student_details
                SET transport_tagged = ?
                WHERE transport_pickup_drop IN (?) AND (${whereClauseStudents}) AND transport_needed = 1
            `;
            const sqlUpdateStudentsPrimary = `
                UPDATE primary_student_details
                SET transport_tagged = ?
                WHERE transport_pickup_drop IN (?) AND (${whereClauseStudents}) AND transport_needed = 1
            `;
            const valuesUpdateStudents = [vehicleNo, routeStopsStudents];

            req.connectionPool.query(sqlUpdateStudentsPrePrimary, valuesUpdateStudents, (updateErrorPrePrimary, updateResultsPrePrimary) => {
                if (updateErrorPrePrimary) {
                    return res.status(500).json({ success: false, error: 'Database update failed for pre_primary_student_details' });
                }

                req.connectionPool.query(sqlUpdateStudentsPrimary, valuesUpdateStudents, (updateErrorPrimary, updateResultsPrimary) => {
                    if (updateErrorPrimary) {
                        return res.status(500).json({ success: false, error: 'Database update failed for primary_student_details' });
                    }

                    // Process teacher allocation
                    const sqlUpdateTeachers = `
                        UPDATE teacher_details
                        SET transport_tagged = ?
                        WHERE transport_pickup_drop IN (?)
                          AND (${classesArray.map(() => `FIND_IN_SET(?, classes_alloted)`).join(' > 0 OR ')} > 0)
                          AND transport_needed = 1
                    `;
                    const valuesUpdateTeachers = [vehicleNo, stopsArray, ...classesArray];

                    req.connectionPool.query(sqlUpdateTeachers, valuesUpdateTeachers, (updateErrorTeachers, updateResultsTeachers) => {
                        if (updateErrorTeachers) {
                            return res.status(500).json({ success: false, error: 'Database update failed for teacher_details' });
                        }

                         // Calculate the total count (students + teachers)
                         const allocatedCount = students.length + teachers.length;
                         const updatedAvailableSeats = availableSeats - allocatedCount;
 
                         // SQL query to update the transport_schedule_details
                         const sqlUpdateScheduleDetails = `
                             UPDATE transport_schedule_details
                             SET available_seats = ?, students_tagged = COALESCE(students_tagged, 0) + ?
                             WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
                         `;
                         const valuesUpdateScheduleDetails = [updatedAvailableSeats, allocatedCount, vehicleNo, routeName, shiftName];
 
                         req.connectionPool.query(sqlUpdateScheduleDetails, valuesUpdateScheduleDetails, (updateScheduleError, updateScheduleResults) => {
                             if (updateScheduleError) {
                                 console.error('Failed to update transport_schedule_details:', updateScheduleError);
                                 return res.status(500).json({ success: false, error: 'Database update failed for transport_schedule_details' });
                             }
 
                             res.status(200).json({ success: true, allocatedStudents: students, allocatedTeachers: teachers });
                         });
                    });
                });
            });
        });
    });
});


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

    // SQL queries to update transport_tagged to NULL for specific students
    const sqlUpdateStudentsPrePrimary = `
        UPDATE pre_primary_student_details
        SET transport_tagged = NULL
        WHERE transport_tagged = ? AND (${whereClause}) AND transport_needed = 1
    `;
    const sqlUpdateStudentsPrimary = `
        UPDATE primary_student_details
        SET transport_tagged = NULL
        WHERE transport_tagged = ? AND (${whereClause}) AND transport_needed = 1
    `;
    const valuesUpdateStudents = [vehicleNo];

    // Execute the queries for students
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

            // SQL query to update transport_tagged to NULL for specific teachers
            const sqlUpdateTeachers = `
                UPDATE teacher_details
                SET transport_tagged = NULL
                WHERE transport_tagged = ? AND transport_needed = 1
                AND (${classesArray.map(() => `FIND_IN_SET(?, classes_alloted)`).join(' > 0 OR ')} > 0)
            `;
            const valuesUpdateTeachers = [vehicleNo, ...classesArray.map(cls => `${cls.standard} ${cls.division}`)];

            req.connectionPool.query(sqlUpdateTeachers, valuesUpdateTeachers, (updateErrorTeachers, updateResultsTeachers) => {
                if (updateErrorTeachers) {
                    console.error('Database update failed for teacher_details:', updateErrorTeachers);
                    return res.status(500).json({ success: false, error: 'Database update failed for teacher_details' });
                }

                // Fetch vehicle capacity, driver name, and current students tagged
                const fetchVehicleDetailsSql = `
                    SELECT vehicle_capacity, driver_name, students_tagged
                    FROM transport_schedule_details
                    WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
                `;
                req.connectionPool.query(fetchVehicleDetailsSql, [vehicleNo, routeName, shiftName], (fetchError, fetchResults) => {
                    if (fetchError || fetchResults.length === 0) {
                        console.error('Database query failed for fetching vehicle details:', fetchError);
                        return res.status(500).json({ success: false, error: 'Database query failed for fetching vehicle details' });
                    }

                    const { vehicle_capacity: vehicleCapacity, driver_name: driverName, students_tagged: currentStudentsTagged } = fetchResults[0];

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

                        // Calculate detagged counts
                        const numDetaggedStudents = updateResultsPrePrimary.affectedRows + updateResultsPrimary.affectedRows;
                        const numDetaggedTeachers = updateResultsTeachers.affectedRows;

                        res.status(200).json({
                            success: true,
                            vehicle_no: vehicleNo,
                            driver_name: driverName,
                            detagged_students: numDetaggedStudents,
                            detagged_teachers: numDetaggedTeachers
                        });
                    });
                });
            });
        });
    });
});

// OVERFLOW HANDLING //

// New endpoint to handle overflow students and teachers
router.post('/handle_overflow_students', (req, res) => {
    const { routeStops, shiftClasses, vehicleNo, availableSeats, routeName, shiftName } = req.body;

    const stopsArray = routeStops.routeDetail.split(',').map(stop => stop.trim());
    const classesArray = shiftClasses.shiftDetail.split(',').map(cls => cls.trim());

    const sqlFetchStudents = `
        SELECT Student_id, Name, transport_pickup_drop, Standard, Division
        FROM pre_primary_student_details
        WHERE transport_needed = 1 AND transport_tagged IS NULL
          AND transport_pickup_drop IN (?) AND CONCAT(Standard, ' ', Division) IN (?)
        UNION ALL
        SELECT Student_id, Name, transport_pickup_drop, Standard, Division
        FROM primary_student_details
        WHERE transport_needed = 1 AND transport_tagged IS NULL
          AND transport_pickup_drop IN (?) AND CONCAT(Standard, ' ', Division) IN (?)
        ORDER BY transport_pickup_drop ASC
    `;

    const sqlFetchTeachers = `
        SELECT id AS Teacher_id, name AS Name, transport_pickup_drop
        FROM teacher_details
        WHERE transport_needed = 1 AND transport_tagged IS NULL
          AND transport_pickup_drop IN (?) AND (${classesArray.map(() => `FIND_IN_SET(?, classes_alloted)`).join(' > 0 OR ')} > 0)
    `;

    req.connectionPool.query(sqlFetchStudents, [stopsArray, classesArray, stopsArray, classesArray], (fetchErrorStudents, fetchResultsStudents) => {
        if (fetchErrorStudents) {
            return res.status(500).json({ success: false, error: 'Database query failed for fetching students' });
        }

        const students = fetchResultsStudents.map(row => ({
            id: row.Student_id,
            name: row.Name,
            pickupDrop: row.transport_pickup_drop,
            standard: row.Standard,
            division: row.Division
        }));

        req.connectionPool.query(sqlFetchTeachers, [stopsArray, ...classesArray], (fetchErrorTeachers, fetchResultsTeachers) => {
            if (fetchErrorTeachers) {
                return res.status(500).json({ success: false, error: 'Database query failed for fetching teachers' });
            }

            const teachers = fetchResultsTeachers.map(row => ({
                id: row.Teacher_id,
                name: row.Name,
                pickupDrop: row.transport_pickup_drop,
            }));

            // Allocate students and teachers to the primary bus
            allocatePrimaryBus(students, teachers, vehicleNo, availableSeats, routeName, shiftName, req.connectionPool, (allocateError, result) => {
                if (allocateError) {
                    return res.status(500).json({ success: false, error: 'Failed to allocate students and teachers to the bus' });
                }

                const { unallocatedStudents, allocatedStudents, unallocatedTeachers, allocatedTeachers } = result;

                if (unallocatedStudents.length > 0 || unallocatedTeachers.length > 0) {
                    // Allocate remaining students and teachers to the secondary bus
                    allocateSecondaryBus(unallocatedStudents, unallocatedTeachers, vehicleNo, routeName, shiftName, req.connectionPool, (secondaryAllocateError, secondaryResult) => {
                        if (secondaryAllocateError) {
                            return res.status(500).json({ success: false, error: 'Failed to allocate students and teachers to the secondary bus' });
                        }

                        res.status(200).json({ success: true, primaryBus: { allocatedStudents, allocatedTeachers }, secondaryResult });
                    });
                } else {
                    res.status(200).json({ success: true, primaryBus: { allocatedStudents, allocatedTeachers }, message: 'All students and teachers allocated to the primary bus' });
                }
            });
        });
    });
});

const allocatePrimaryBus = (students, teachers, vehicleNo, availableSeats, routeName, shiftName, connectionPool, callback) => {
    // Select the number of students and teachers equal to the available seats
    const totalToAllocate = students.length + teachers.length;
    const studentsToAllocate = students.slice(0, Math.min(availableSeats, totalToAllocate));
    const unallocatedStudents = students.slice(Math.min(availableSeats, totalToAllocate));
    const availableSeatsForTeachers = availableSeats - studentsToAllocate.length;
    const teachersToAllocate = teachers.slice(0, availableSeatsForTeachers);
    const unallocatedTeachers = teachers.slice(availableSeatsForTeachers);

    // Extract the route stops and class details from the students
    const routeStops = [...new Set(studentsToAllocate.map(student => student.pickupDrop))];
    const classesAlloted = [...new Set(studentsToAllocate.map(student => `${student.standard} ${student.division}`))];

    // Split the classesAlloted array into Standard and Division
    const classesArray = classesAlloted.map(cls => {
        const [standard, ...divisionParts] = cls.split(' ');
        const division = divisionParts.join(' ');
        return { standard, division };
    });

    // Generate the SQL WHERE clause for Standard and Division pairs
    const whereClause = classesArray.map(({ standard, division }) => `(Standard = '${standard}' AND Division = '${division}')`).join(' OR ');

    // SQL query to update transport_tagged for specific students in pre_primary_student_details
    const sqlUpdateStudentsPrePrimary = `
        UPDATE pre_primary_student_details
        SET transport_tagged = ?
        WHERE transport_pickup_drop IN (?) AND (${whereClause}) AND transport_needed = 1
    `;
    const sqlUpdateStudentsPrimary = `
        UPDATE primary_student_details
        SET transport_tagged = ?
        WHERE transport_pickup_drop IN (?) AND (${whereClause}) AND transport_needed = 1
    `;
    const valuesUpdateStudents = [vehicleNo, routeStops];

    // Execute the queries to update student details
    connectionPool.query(sqlUpdateStudentsPrePrimary, valuesUpdateStudents, (updateErrorPrePrimary, updateResultsPrePrimary) => {
        if (updateErrorPrePrimary) {
            return callback(updateErrorPrePrimary);
        }

        connectionPool.query(sqlUpdateStudentsPrimary, valuesUpdateStudents, (updateErrorPrimary, updateResultsPrimary) => {
            if (updateErrorPrimary) {
                return callback(updateErrorPrimary);
            }

            // Process teacher allocation
            const teacherIds = teachersToAllocate.map(teacher => teacher.id);

            if (teacherIds.length > 0) {
                const sqlUpdateTeachers = `
                    UPDATE teacher_details
                    SET transport_tagged = ?
                    WHERE id IN (?)
                `;
                const valuesUpdateTeachers = [vehicleNo, teacherIds];

                // Log the selected teacher IDs and the IDs being updated for debugging
                //console.log('Selected teachers for updating:', teachersToAllocate);
                //console.log('Selected teacher IDs for updating:', teacherIds);
                // console.log('SQL Query for updating teachers:', sqlUpdateTeachers);
                //console.log('Values for updating teachers:', valuesUpdateTeachers);

                connectionPool.query(sqlUpdateTeachers, valuesUpdateTeachers, (updateErrorTeachers, updateResultsTeachers) => {
                    if (updateErrorTeachers) {
                        return callback(updateErrorTeachers);
                    }

                    // Calculate the number of allocated students and teachers
                    const allocatedStudentCount = studentsToAllocate.length;
                    const allocatedTeacherCount = teachersToAllocate.length;
                    const totalAllocatedCount = allocatedStudentCount + allocatedTeacherCount;

                    // SQL query to update the transport_schedule_details
                    const sqlUpdateScheduleDetails = `
                        UPDATE transport_schedule_details
                        SET available_seats = available_seats - ?, students_tagged = COALESCE(students_tagged, 0) + ?
                        WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
                    `;
                    const valuesUpdateScheduleDetails = [totalAllocatedCount, totalAllocatedCount, vehicleNo, routeName, shiftName];

                    connectionPool.query(sqlUpdateScheduleDetails, valuesUpdateScheduleDetails, (updateScheduleError, updateScheduleResults) => {
                        if (updateScheduleError) {
                            console.error('Failed to update transport_schedule_details:', updateScheduleError);
                            return callback(updateScheduleError);
                        }

                        callback(null, { allocatedStudents: studentsToAllocate, unallocatedStudents, allocatedTeachers: teachersToAllocate, unallocatedTeachers });
                    });
                });
            } else {
                // If no teachers to allocate, proceed with updating the schedule details directly
                const allocatedStudentCount = studentsToAllocate.length;
                const totalAllocatedCount = allocatedStudentCount;

                const sqlUpdateScheduleDetails = `
                    UPDATE transport_schedule_details
                    SET available_seats = available_seats - ?, students_tagged = COALESCE(students_tagged, 0) + ?
                    WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
                `;
                const valuesUpdateScheduleDetails = [totalAllocatedCount, totalAllocatedCount, vehicleNo, routeName, shiftName];

                connectionPool.query(sqlUpdateScheduleDetails, valuesUpdateScheduleDetails, (updateScheduleError, updateScheduleResults) => {
                    if (updateScheduleError) {
                        console.error('Failed to update transport_schedule_details:', updateScheduleError);
                        return callback(updateScheduleError);
                    }

                    callback(null, { allocatedStudents: studentsToAllocate, unallocatedStudents, allocatedTeachers: teachersToAllocate, unallocatedTeachers });
                });
            }
        });
    });
};

const allocateSecondaryBus = async (unallocatedStudents, unallocatedTeachers, primaryVehicleNo, routeName, shiftName, connectionPool, callback) => {
    try {
        // Get distinct transport_pickup_drop and count of unallocated students and teachers
        const distinctPickupDrop = [...new Set([...unallocatedStudents.map(student => student.pickupDrop), ...unallocatedTeachers.map(teacher => teacher.pickupDrop)])];
        const unallocatedCount = unallocatedStudents.length + unallocatedTeachers.length;

        // Generate the SQL WHERE clause for route stops
        const whereClause = distinctPickupDrop.map(stop => `route_stops LIKE ?`).join(' OR ');
        const values = distinctPickupDrop.map(stop => `%${stop}%`);

        // SQL query to get list of vehicles that stop at the unallocated students' and teachers' addresses and exclude the primary bus
        const sqlFetchVehicles = `
            SELECT vehicle_no, route_name, available_seats, driver_name
            FROM transport_schedule_details
            WHERE (${whereClause}) AND vehicle_no != ? AND shift_name = ?
        `;

        const fetchVehiclesResults = await new Promise((resolve, reject) => {
            connectionPool.query(sqlFetchVehicles, [...values, primaryVehicleNo, shiftName], (fetchVehiclesError, results) => {
                if (fetchVehiclesError) {
                    return reject(fetchVehiclesError);
                }
                resolve(results);
            });
        });

        const vehicles = fetchVehiclesResults.map(row => ({
            vehicleNo: row.vehicle_no,
            routeName: row.route_name,
            availableSeats: row.available_seats,
            driverName: row.driver_name
        }));

        // Allocate students and teachers to secondary buses
        let remainingStudents = unallocatedStudents;
        let remainingTeachers = unallocatedTeachers;
        let allocatedStudents = [];
        let allocatedTeachers = [];
        let secondaryBusDetails = [];

        for (const vehicle of vehicles) {
            if (remainingStudents.length === 0 && remainingTeachers.length === 0) break;

            const { vehicleNo, routeName, availableSeats, driverName } = vehicle;

            const studentsToAllocate = remainingStudents.slice(0, availableSeats);
            remainingStudents = remainingStudents.slice(availableSeats);

            const availableSeatsForTeachers = availableSeats - studentsToAllocate.length;
            const teachersToAllocate = remainingTeachers.slice(0, availableSeatsForTeachers);
            remainingTeachers = remainingTeachers.slice(availableSeatsForTeachers);

            // Extract the route stops and class details from the students
            const routeStops = [...new Set(studentsToAllocate.map(student => student.pickupDrop))];
            const classesAlloted = [...new Set(studentsToAllocate.map(student => `${student.standard} ${student.division}`))];

            // Split the classesAlloted array into Standard and Division
            const classesArray = classesAlloted.map(cls => {
                const [standard, ...divisionParts] = cls.split(' ');
                const division = divisionParts.join(' ');
                return { standard, division };
            });

            // Generate the SQL WHERE clause for Standard and Division pairs
            const whereClause = classesArray.map(({ standard, division }) => `(Standard = '${standard}' AND Division = '${division}')`).join(' OR ');

            // SQL query to update transport_tagged for specific students in pre_primary_student_details
            const sqlUpdateStudentsPrePrimary = `
                UPDATE pre_primary_student_details
                SET transport_tagged = ?
                WHERE transport_pickup_drop IN (?) AND (${whereClause}) AND transport_needed = 1
            `;
            const sqlUpdateStudentsPrimary = `
                UPDATE primary_student_details
                SET transport_tagged = ?
                WHERE transport_pickup_drop IN (?) AND (${whereClause}) AND transport_needed = 1
            `;
            const valuesUpdateStudents = [vehicleNo, routeStops];

            await new Promise((resolve, reject) => {
                connectionPool.query(sqlUpdateStudentsPrePrimary, valuesUpdateStudents, (updateErrorPrePrimary) => {
                    if (updateErrorPrePrimary) {
                        return reject(updateErrorPrePrimary);
                    }
                    connectionPool.query(sqlUpdateStudentsPrimary, valuesUpdateStudents, (updateErrorPrimary) => {
                        if (updateErrorPrimary) {
                            return reject(updateErrorPrimary);
                        }
                        resolve();
                    });
                });
            });

            // Process teacher allocation
            const teacherIds = teachersToAllocate.map(teacher => teacher.id);

            if (teacherIds.length > 0) {
                const sqlUpdateTeachers = `
                    UPDATE teacher_details
                    SET transport_tagged = ?
                    WHERE id IN (?)
                `;
                const valuesUpdateTeachers = [vehicleNo, teacherIds];

                // Log the selected teacher IDs and the IDs being updated for debugging
                console.log('Selected teachers for updating (secondary bus):', teachersToAllocate);
                console.log('Selected teacher IDs for updating (secondary bus):', teacherIds);
                console.log('SQL Query for updating teachers (secondary bus):', sqlUpdateTeachers);
                console.log('Values for updating teachers (secondary bus):', valuesUpdateTeachers);

                await new Promise((resolve, reject) => {
                    connectionPool.query(sqlUpdateTeachers, valuesUpdateTeachers, (updateErrorTeachers) => {
                        if (updateErrorTeachers) {
                            return reject(updateErrorTeachers);
                        }
                        resolve();
                    });
                });
            }

            // Update the transport_schedule_details table
            const allocatedStudentCount = studentsToAllocate.length;
            const allocatedTeacherCount = teachersToAllocate.length;
            const totalAllocatedCount = allocatedStudentCount + allocatedTeacherCount;

            const sqlUpdateScheduleDetails = `
                UPDATE transport_schedule_details
                SET available_seats = available_seats - ?, students_tagged = COALESCE(students_tagged, 0) + ?
                WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
            `;
            await new Promise((resolve, reject) => {
                connectionPool.query(sqlUpdateScheduleDetails, [totalAllocatedCount, totalAllocatedCount, vehicleNo, routeName, shiftName], (updateScheduleError) => {
                    if (updateScheduleError) {
                        return reject(updateScheduleError);
                    }
                    resolve();
                });
            });

            allocatedStudents = allocatedStudents.concat(studentsToAllocate);
            allocatedTeachers = allocatedTeachers.concat(teachersToAllocate);
            secondaryBusDetails.push({ vehicleNo, driverName, studentCount: studentsToAllocate.length, teacherCount: teachersToAllocate.length });
        }

        // If there are still remaining students and teachers after all available buses have been used
        if (remainingStudents.length > 0 || remainingTeachers.length > 0) {
            return callback(null, { allocatedStudents, remainingStudents, allocatedTeachers, remainingTeachers, secondaryBusDetails, notEnoughBuses: true });
        }

        callback(null, { allocatedStudents, allocatedTeachers, secondaryBusDetails });
    } catch (error) {
        callback(error);
    }
};

module.exports = router;