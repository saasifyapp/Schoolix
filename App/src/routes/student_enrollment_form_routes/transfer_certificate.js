const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed

// Use the connection manager middleware
router.use(connectionManager);

// Endpoint to fetch student details for Transfer Certificate
router.get("/fetch-student-for-TC", (req, res) => {
    const { grno, name, section } = req.query;

    // Validate input parameters
    if (!section || (!grno && !name)) {
        return res.status(400).json({ error: "Invalid search parameters" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query
    let query = `SELECT * FROM ${tableName} WHERE is_active = 1 AND `;
    let queryParams = [];

    if (grno) {
        query += "Grno = ?";
        queryParams.push(grno);
    } else if (name) {
        query += "Name LIKE ?";
        queryParams.push(`%${name}%`);
    }

    // Execute the query
    req.connectionPool.query(query, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error", details: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No student found" });
        }

        // Return the results without checking for inactive student (since the WHERE clause already filters this)
        res.json(results);
    });
});

// Endpoint to fetch and increment max tc_no from transfer_certificates table
router.get('/fetch-new-tc-no', (req, res) => {
    // Construct the SQL query to get the max tc_no
    const sql = `SELECT MAX(tc_no) AS max_tc_no FROM transfer_certificates`;

    // Execute the SQL query
    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        // Extract the max tc_no from the results and consider it as 0 if null
        let maxTcNo = results[0].max_tc_no !== null ? results[0].max_tc_no : 0;

        // Increment the max tc_no by 1
        const newTcNo = maxTcNo + 1;

        // Return the new tc_no to the client
        res.status(200).json({ new_tc_no: newTcNo });
    });
});


// Endpoint to fetch school details with filtering by loginName and schoolName
router.get('/fetch-tc-school-details', (req, res) => {
    const { loginName, schoolName } = req.query;

    // Construct the SQL query to get required school details
    const sql = `
        SELECT 
            LoginName,
            schoolName,
            contact_no,
            email_address,
            udise_no,
            board_index_no 
        FROM user_details
        WHERE LoginName = ? AND schoolName = ?
    `;

    // Execute the SQL query
    connection_auth.query(sql, [loginName, schoolName], (error, results) => {
        if (error) {
            console.error('Database query failed', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        // Log the result for debugging purposes
       // console.log('Fetch School Details Result:', results);

        // Return the results to the client
        res.status(200).json(results[0] || {}); // Return the first result or an empty object if no results found
    });
});

// New endpoint to deactivate student
router.post('/deactivate-student', (req, res) => {
    const { section, grno } = req.body;

    if (!section || !grno) {
        return res.status(400).json({ error: "Invalid section or grno" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query to update is_active to 0
    const query = `UPDATE ${tableName} SET is_active = 0 WHERE Grno = ?`;
    req.connectionPool.query(query, [grno], (error, results) => {
        if (error) {
            console.error('Database query failed', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

       // console.log('Deactivate Student Result:', results);
        res.status(200).json({ message: 'Student deactivated successfully' });
    });
});



// New endpoint to delete Android user
router.post('/delete-android-user', (req, res) => {
    const { section, grno } = req.body;

    if (!section || !grno) {
        return res.status(400).json({ error: "Invalid section or grno" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query to fetch app_uid
    const fetchUidQuery = `SELECT app_uid FROM ${tableName} WHERE Grno = ?`;
    req.connectionPool.query(fetchUidQuery, [grno], (error, results) => {
        if (error) {
            console.error('Database query failed', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'App UID not found for the given Gr No' });
        }

        const appUid = results[0].app_uid;

        // Construct the SQL query to delete the entry in android_app_users
        const deleteQuery = `DELETE FROM android_app_users WHERE uid = ?`;
        connection_auth.query(deleteQuery, [appUid], (deleteError, deleteResults) => {
            if (deleteError) {
                console.error('Database query failed', deleteError);
                return res.status(500).json({ error: 'Database query failed', details: deleteError });
            }

            console.log('Delete Android User Result:', deleteResults);
            res.status(200).json({ message: 'Android user deleted successfully' });
        });
    });
});



// New endpoint to delete Transport Allotted
router.post('/delete-transport-alloted', (req, res) => {
    const { section, grno } = req.body;

    if (!section || !grno) {
        return res.status(400).json({ error: "Invalid section or grno" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query to fetch transport details
    const fetchTransportDetailsQuery = `SELECT transport_needed, transport_tagged, transport_pickup_drop FROM ${tableName} WHERE Grno = ?`;
    connection_auth.query(fetchTransportDetailsQuery, [grno], (error, results) => {
        if (error) {
            console.error('Database query failed', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Transport details not found for the given Gr No' });
        }

        const { transport_needed, transport_tagged, transport_pickup_drop } = results[0];
        const concatenatedClass = `${section}`;

        if (transport_needed) {
            // Fetch vehicle ID from transport_schedule_details
            const getVehicleId = (vehicle_no, transportPickupDrop, callback) => {
                if (!vehicle_no) return callback(null, null);

                const getIdQuery = `
                    SELECT id FROM transport_schedule_details
                    WHERE vehicle_no = ? AND classes_alloted LIKE ? AND route_stops LIKE ?
                `;
                const params = [vehicle_no, `%${concatenatedClass}%`, `%${transportPickupDrop}%`];
                connection_auth.query(getIdQuery, params, (getIdError, results) => {
                    if (getIdError) return callback(getIdError);
                    callback(null, results.length > 0 ? results[0].id : null);
                });
            };

            // Update seats in transport_schedule_details
            const updateSeats = (vehicleId, callback) => {
                if (!vehicleId) return callback(null);

                const updateSeatsQuery = `
                    UPDATE transport_schedule_details 
                    SET available_seats = available_seats + 1, 
                        students_tagged = 
                            CASE 
                                WHEN students_tagged > 0 THEN students_tagged - 1 
                                ELSE 0 
                            END
                    WHERE id = ?
                `;
                connection_auth.query(updateSeatsQuery, [vehicleId], (updateError) => {
                    if (updateError) return callback(updateError);
                    callback(null);
                });
            };

            // Perform the operations sequentially
            getVehicleId(transport_tagged, transport_pickup_drop, (getIdError, vehicleId) => {
                if (getIdError) {
                    console.error('Database query failed', getIdError);
                    return res.status(500).json({ error: 'Database query failed', details: getIdError });
                }

                if (!vehicleId) {
                    return res.status(404).json({ error: 'Transport schedule not found' });
                }

                updateSeats(vehicleId, (updateSeatsError) => {
                    if (updateSeatsError) {
                        console.error('Database query failed', updateSeatsError);
                        return res.status(500).json({ error: 'Database query failed', details: updateSeatsError });
                    }

                    console.log('Transport allotment deleted successfully');
                    res.status(200).json({ message: 'Transport allotment deleted successfully' });
                });
            });

        } else {
            res.status(200).json({ message: 'No transport allotment found' });
        }
    });
});

module.exports = router;