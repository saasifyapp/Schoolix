const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed


// Use the connection manager middleware
router.use(connectionManager);

// Endpoint to fetch student suggestions based on the search query
router.post('/fetch-student-suggestions', (req, res) => {
    const { query } = req.body;

    // Convert query to a suitable format for comparison
    const nameSearchQuery = `%${query}%`;
    const isNumericQuery = !isNaN(query);

    let sql;
    let values;

    if (isNumericQuery) {
        const grnoSearchQuery = parseInt(query, 10);
        sql = `
            SELECT 
                name, 
                Grno AS gr_no, 
                standard, 
                Division as division, 
                f_mobile_no, 
                transport_pickup_drop, 
                transport_tagged 
            FROM pre_primary_student_details 
            WHERE Grno = ? AND transport_needed = 1 AND is_active = 1
            UNION
            SELECT 
                name, 
                Grno AS gr_no, 
                Standard, 
                Division as division, 
                f_mobile_no, 
                transport_pickup_drop, 
                transport_tagged 
            FROM primary_student_details 
            WHERE Grno = ? AND transport_needed = 1 AND is_active = 1 ;
        `;
        values = [grnoSearchQuery, grnoSearchQuery];
    } else {
        sql = `
            SELECT 
                name, 
                Grno AS gr_no, 
                standard, 
                Division as division, 
                f_mobile_no, 
                transport_pickup_drop, 
                transport_tagged 
            FROM pre_primary_student_details 
            WHERE name LIKE ? AND transport_needed = 1 AND is_active = 1
            UNION
            SELECT 
                name, 
                Grno AS gr_no, 
                Standard, 
                Division AS division, 
                f_mobile_no, 
                transport_pickup_drop, 
                transport_tagged 
            FROM primary_student_details 
            WHERE name LIKE ? AND transport_needed = 1 AND is_active = 1;
        `;
        values = [nameSearchQuery, nameSearchQuery];
    }

    req.connectionPool.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error fetching student suggestions:', err);
            return res.status(500).json({ error: 'Failed to fetch student suggestions' });
        }
        res.json(results);
    });
});


// New endpoint for edit student overlay
router.post('/edit_getRunningVehicle', (req, res) => {
    let { classesAllotted, routeStops } = req.body;

    // Ensure inputs are strings and trim them
    if (typeof classesAllotted === 'string') {
        classesAllotted = classesAllotted.trim();
    }

    if (typeof routeStops === 'string') {
        routeStops = routeStops.trim();
    }

    // Check if classesAllotted or routeStops are empty and handle accordingly
    if (classesAllotted.length === 0 || routeStops.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid input data' });
    }

    const sql = `
        SELECT vehicle_no, driver_name, classes_alloted, route_stops
        FROM transport_schedule_details
        WHERE classes_alloted LIKE ? AND route_stops LIKE ?
        LIMIT 1000;
    `;

    const queryParams = [`%${classesAllotted}%`, `%${routeStops}%`];

    req.connectionPool.query(sql, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, error: 'Database query failed' });
        }

        if (results.length > 0) {
            res.status(200).json({ success: true, vehicles: results });
        } else {
            res.status(200).json({ success: false, vehicles: [] });
        }
    });
});


// Endpoint to get detailed vehicle info based on vehicle number, route, and class
router.get('/edit_getVehicleInfo', (req, res) => {
    const { vehicleNo, route, classAllotted } = req.query;

    if (!vehicleNo || !route || !classAllotted) {
        return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    const sql = `
        SELECT vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted, vehicle_capacity, available_seats, students_tagged
        FROM transport_schedule_details
        WHERE vehicle_no = ? AND route_stops LIKE ? AND classes_alloted LIKE ?
        LIMIT 1;
    `;

    const queryParams = [vehicleNo, `%${route}%`, `%${classAllotted}%`];

    req.connectionPool.query(sql, queryParams, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ success: false, error: 'Database query failed' });
        }

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(200).json([]);
        }
    });
});


// Endpoint to update student transport tagged details in both tables and update vehicle details based on IDs, route_name, shift_name, route_stops, and classes_alloted
router.post('/updateStudentTransport', async (req, res) => {
    const { grNo, studentName, standard, division, vehicleTagged, routeStops, classesAllotted } = req.body;

    if (!grNo || !studentName || !standard || !division || !vehicleTagged || !routeStops || !classesAllotted) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const getOldVehicleQuery = `
        SELECT transport_tagged AS vehicle_no
        FROM (
            SELECT transport_tagged
            FROM primary_student_details
            WHERE Grno = ? AND Name = ? AND standard = ? AND Division = ? AND is_active = 1
            UNION
            SELECT transport_tagged
            FROM pre_primary_student_details
            WHERE Grno = ? AND Name = ? AND standard = ? AND Division = ? AND is_active = 1
        ) AS combined;
    `;
    const getOldVehicleParams = [grNo, studentName, standard, division, grNo, studentName, standard, division];

    try {
        // Retrieve the old vehicle tagged to the student
        const oldVehicleResults = await new Promise((resolve, reject) => {
            req.connectionPool.query(getOldVehicleQuery, getOldVehicleParams, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        const oldVehicleNo = oldVehicleResults.length > 0 ? oldVehicleResults[0].vehicle_no : null;

        if (oldVehicleNo) {
            // If there is an old vehicle, perform the necessary updates for both old and new vehicles
            const getVehicleDetailsQuery = `
                SELECT id, vehicle_no, route_name, shift_name, route_stops, classes_alloted, available_seats, students_tagged
                FROM transport_schedule_details
                WHERE vehicle_no IN (?, ?) AND route_stops LIKE ? AND classes_alloted LIKE ?;
            `;

            const vehicleDetailsResults = await new Promise((resolve, reject) => {
                req.connectionPool.query(getVehicleDetailsQuery, [oldVehicleNo, vehicleTagged, `%${routeStops}%`, `%${classesAllotted}%`], (error, results) => {
                    if (error) reject(error);
                    else resolve(results);
                });
            });

            let oldVehicle = null;
            let newVehicle = null;

            vehicleDetailsResults.forEach(vehicle => {
                if (vehicle.vehicle_no === oldVehicleNo) {
                    oldVehicle = vehicle;
                } else if (vehicle.vehicle_no === vehicleTagged) {
                    newVehicle = vehicle;
                }
            });

            // Handle the students_tagged logic: 0 as NULL and NULL as 0 for maths
            if (oldVehicle && newVehicle) {
                const updateSeatsQuery = `
                    UPDATE transport_schedule_details
                    SET available_seats = CASE
                        WHEN id = ? THEN available_seats + 1
                        WHEN id = ? THEN available_seats - 1
                    END,
                    students_tagged = CASE
                        WHEN id = ? THEN
                            CASE
                                WHEN students_tagged - 1 = 0 THEN NULL
                                ELSE students_tagged - 1
                            END
                        WHEN id = ? THEN COALESCE(students_tagged, 0) + 1
                    END
                    WHERE id IN (?, ?);
                `;

                const updateSeatsParams = [
                    oldVehicle.id,
                    newVehicle.id,
                    oldVehicle.id,
                    newVehicle.id,
                    oldVehicle.id,
                    newVehicle.id
                ];

                await new Promise((resolve, reject) => {
                    req.connectionPool.query(updateSeatsQuery, updateSeatsParams, (error, results) => {
                        if (error) reject(error);
                        else resolve(results);
                    });
                });
            }
        } else {
            // If there is no old vehicle, just update the new vehicle's seats and students tagged
            const getNewVehicleDetailsQuery = `
                SELECT id, available_seats, students_tagged
                FROM transport_schedule_details
                WHERE vehicle_no = ? AND route_stops LIKE ? AND classes_alloted LIKE ?;
            `;

            const newVehicleResults = await new Promise((resolve, reject) => {
                req.connectionPool.query(getNewVehicleDetailsQuery, [vehicleTagged, `%${routeStops}%`, `%${classesAllotted}%`], (error, results) => {
                    if (error) reject(error);
                    else resolve(results);
                });
            });

            if (newVehicleResults.length > 0) {
                const newVehicle = newVehicleResults[0];

                const updateNewVehicleQuery = `
                    UPDATE transport_schedule_details
                    SET available_seats = available_seats - 1,
                    students_tagged = COALESCE(students_tagged, 0) + 1
                    WHERE id = ?;
                `;
                const updateNewVehicleParams = [newVehicle.id];

                await new Promise((resolve, reject) => {
                    req.connectionPool.query(updateNewVehicleQuery, updateNewVehicleParams, (error, results) => {
                        if (error) reject(error);
                        else resolve(results);
                    });
                });
            }
        }

        // Update transport_tagged field for the student in primary and pre-primary tables
        const queryPrimary = `
            UPDATE primary_student_details
            SET transport_tagged = ?
            WHERE Grno = ? AND Name = ? AND standard = ? AND Division = ? AND is_active = 1
        `;
        const queryPrePrimary = `
            UPDATE pre_primary_student_details
            SET transport_tagged = ?
            WHERE Grno = ? AND Name = ? AND standard = ? AND Division = ? AND is_active = 1
        `;
        const queryParams = [vehicleTagged, grNo, studentName, standard, division];

        await new Promise((resolve, reject) => {
            req.connectionPool.query(queryPrimary, queryParams, (errorPrimary, resultsPrimary) => {
                if (errorPrimary) reject(errorPrimary);
                else resolve(resultsPrimary);
            });
        });

        await new Promise((resolve, reject) => {
            req.connectionPool.query(queryPrePrimary, queryParams, (errorPrePrimary, resultsPrePrimary) => {
                if (errorPrePrimary) reject(errorPrePrimary);
                else resolve(resultsPrePrimary);
            });
        });

        res.status(200).json({ success: true, message: 'Transport tagged updated successfully' });

    } catch (error) {
        console.error('Error updating transport tagged:', error);
        res.status(500).json({ success: false, error: 'An error occurred while updating transport tagged' });
    }
});


module.exports = router;