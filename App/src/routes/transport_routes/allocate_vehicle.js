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


// New endpoint to tag students to the selected bus and update transport_schedule_details
router.post('/allocate_tagStudentsToBus', (req, res) => {
    const { vehicleNo, routeStops, shiftClasses, availableSeats, routeName, shiftName } = req.body;

    const stopsArray = routeStops.split(',').map(stop => stop.trim());
    const classesArray = shiftClasses.split(',').map(cls => cls.trim());

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

    req.connectionPool.query(sqlFetchStudents, [stopsArray, classesArray, stopsArray, classesArray], (fetchError, fetchResults) => {
        if (fetchError) {
            return res.status(500).json({ success: false, error: 'Database query failed for fetching students' });
        }

        const students = fetchResults.map(row => ({
            id: row.Student_id,
            name: row.Name,
            pickupDrop: row.transport_pickup_drop,
            standard: row.Standard,
            division: row.Division
        }));

        // Extract the route stops and class details from the students
        const routeStops = [...new Set(students.map(student => student.pickupDrop))];
        const classesAlloted = [...new Set(students.map(student => `${student.standard} ${student.division}`))];

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
        req.connectionPool.query(sqlUpdateStudentsPrePrimary, valuesUpdateStudents, (updateErrorPrePrimary, updateResultsPrePrimary) => {
            if (updateErrorPrePrimary) {
                return res.status(500).json({ success: false, error: 'Database update failed for pre_primary_student_details' });
            }

            req.connectionPool.query(sqlUpdateStudentsPrimary, valuesUpdateStudents, (updateErrorPrimary, updateResultsPrimary) => {
                if (updateErrorPrimary) {
                    return res.status(500).json({ success: false, error: 'Database update failed for primary_student_details' });
                }

                // Calculate the number of allocated students and update available seats
                const allocatedStudentCount = students.length;
                const updatedAvailableSeats = availableSeats - allocatedStudentCount;

                // SQL query to update the transport_schedule_details
                const sqlUpdateScheduleDetails = `
                    UPDATE transport_schedule_details
                    SET available_seats = ?,  students_tagged = COALESCE(students_tagged, 0) + ?
                    WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
                `;
                const valuesUpdateScheduleDetails = [updatedAvailableSeats, allocatedStudentCount, vehicleNo, routeName, shiftName];

                req.connectionPool.query(sqlUpdateScheduleDetails, valuesUpdateScheduleDetails, (updateScheduleError, updateScheduleResults) => {
                    if (updateScheduleError) {
                        console.error('Failed to update transport_schedule_details:', updateScheduleError);
                        return res.status(500).json({ success: false, error: 'Database update failed for transport_schedule_details' });
                    }

                    res.status(200).json({ success: true, allocatedStudents: students });
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
        WHERE transport_tagged = ? AND (${whereClause}) AND transport_needed = 1
    `;
    const sqlUpdateStudentsPrimary = `
        UPDATE primary_student_details
        SET transport_tagged = NULL
        WHERE transport_tagged = ? AND (${whereClause}) AND transport_needed = 1
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

                    res.status(200).json({ 
                        success: true,
                        vehicle_no: vehicleNo,
                        driver_name: driverName,
                        students_detagged: currentStudentsTagged
                    });
                });
            });
        });
    });
});


// OVERFLOW HANDLING //

// New endpoint to handle overflow students
router.post('/handle_overflow_students', (req, res) => {
    const { routeStops, shiftClasses, vehicleNo, availableSeats, routeName, shiftName } = req.body;

    const stopsArray = routeStops.split(',').map(stop => stop.trim());
    const classesArray = shiftClasses.split(',').map(cls => cls.trim());

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

    req.connectionPool.query(sqlFetchStudents, [stopsArray, classesArray, stopsArray, classesArray], (fetchError, fetchResults) => {
        if (fetchError) {
            return res.status(500).json({ success: false, error: 'Database query failed for fetching students' });
        }

        const students = fetchResults.map(row => ({
            id: row.Student_id,
            name: row.Name,
            pickupDrop: row.transport_pickup_drop,
            standard: row.Standard,
            division: row.Division
        }));

        // Allocate students to the primary bus
        allocatePrimaryBus(students, vehicleNo, availableSeats, routeName, shiftName, req.connectionPool, (allocateError, result) => {
            if (allocateError) {
                return res.status(500).json({ success: false, error: 'Failed to allocate students to the bus' });
            }

            const { unallocatedStudents, allocatedStudents } = result;

            if (unallocatedStudents.length > 0) {
                // Allocate remaining students to the secondary bus
                allocateSecondaryBus(unallocatedStudents, vehicleNo, routeName, shiftName, req.connectionPool, (secondaryAllocateError, secondaryResult) => {
                    if (secondaryAllocateError) {
                        return res.status(500).json({ success: false, error: 'Failed to allocate students to the secondary bus' });
                    }

                    res.status(200).json({ success: true, primaryBus: allocatedStudents, secondaryResult });
                });
            } else {
                res.status(200).json({ success: true, primaryBus: allocatedStudents, message: 'All students allocated to the primary bus' });
            }
        });
    });
});

const allocatePrimaryBus = (students, vehicleNo, availableSeats, routeName, shiftName, connectionPool, callback) => {
    // Select the number of students equal to the available seats
    const studentsToAllocate = students.slice(0, availableSeats);
    const unallocatedStudents = students.slice(availableSeats);

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

            // Calculate the number of allocated students
            const allocatedStudentCount = studentsToAllocate.length;

            // SQL query to update the transport_schedule_details
            const sqlUpdateScheduleDetails = `
                UPDATE transport_schedule_details
                SET available_seats = available_seats - ?, students_tagged = COALESCE(students_tagged, 0) + ?
                WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
            `;
            const valuesUpdateScheduleDetails = [allocatedStudentCount, allocatedStudentCount, vehicleNo, routeName, shiftName];

            connectionPool.query(sqlUpdateScheduleDetails, valuesUpdateScheduleDetails, (updateScheduleError, updateScheduleResults) => {
                if (updateScheduleError) {
                    console.error('Failed to update transport_schedule_details:', updateScheduleError);
                    return callback(updateScheduleError);
                }

                callback(null, { allocatedStudents: studentsToAllocate, unallocatedStudents });
            });
        });
    });
};

const allocateSecondaryBus = async (unallocatedStudents, primaryVehicleNo, routeName, shiftName, connectionPool, callback) => {
    try {
        // Get distinct transport_pickup_drop and count of unallocated students
        const distinctPickupDrop = [...new Set(unallocatedStudents.map(student => student.pickupDrop))];
        const unallocatedStudentCount = unallocatedStudents.length;

        // Generate the SQL WHERE clause for route stops
        const whereClause = distinctPickupDrop.map(stop => `route_stops LIKE ?`).join(' OR ');
        const values = distinctPickupDrop.map(stop => `%${stop}%`);

        // SQL query to get list of vehicles that stop at the unallocated students' addresses and exclude the primary bus
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

        // Allocate students to secondary buses
        let remainingStudents = unallocatedStudents;
        let allocatedStudents = [];
        let secondaryBusDetails = [];

        for (const vehicle of vehicles) {
            if (remainingStudents.length === 0) break;

            const { vehicleNo, routeName, availableSeats, driverName } = vehicle;
            const studentsToAllocate = remainingStudents.slice(0, availableSeats);
            remainingStudents = remainingStudents.slice(availableSeats);

            // SQL query to update transport_tagged for specific students in pre_primary_student_details and primary_student_details
            const studentIds = studentsToAllocate.map(student => student.id);
            const sqlUpdateStudentsPrePrimary = `
                UPDATE pre_primary_student_details
                SET transport_tagged = ?
                WHERE Student_id IN (${studentIds.join(',')}) AND transport_needed = 1
            `;
            const sqlUpdateStudentsPrimary = `
                UPDATE primary_student_details
                SET transport_tagged = ?
                WHERE Student_id IN (${studentIds.join(',')}) AND transport_needed = 1
            `;

            await new Promise((resolve, reject) => {
                connectionPool.query(sqlUpdateStudentsPrePrimary, [vehicleNo], (updateErrorPrePrimary) => {
                    if (updateErrorPrePrimary) {
                        return reject(updateErrorPrePrimary);
                    }
                    connectionPool.query(sqlUpdateStudentsPrimary, [vehicleNo], (updateErrorPrimary) => {
                        if (updateErrorPrimary) {
                            return reject(updateErrorPrimary);
                        }
                        resolve();
                    });
                });
            });

            // Update the transport_schedule_details table
            const sqlUpdateScheduleDetails = `
                UPDATE transport_schedule_details
                SET available_seats = available_seats - ?, students_tagged = COALESCE(students_tagged, 0) + ?
                WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
            `;
            await new Promise((resolve, reject) => {
                connectionPool.query(sqlUpdateScheduleDetails, [studentsToAllocate.length, studentsToAllocate.length, vehicleNo, routeName, shiftName], (updateScheduleError) => {
                    if (updateScheduleError) {
                        return reject(updateScheduleError);
                    }
                    resolve();
                });
            });

            allocatedStudents = allocatedStudents.concat(studentsToAllocate);
            secondaryBusDetails.push({ vehicleNo, driverName, studentCount: studentsToAllocate.length });
        }

        // If there are still remaining students after all available buses have been used
        if (remainingStudents.length > 0) {
           // console.error('Not enough buses to allocate all students');
            return callback(null, { allocatedStudents, remainingStudents, secondaryBusDetails, notEnoughBuses: true });
        }

        callback(null, { allocatedStudents, secondaryBusDetails });
    } catch (error) {
        callback(error);
    }
};

module.exports = router;