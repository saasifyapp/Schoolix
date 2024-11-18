const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed


// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to fetch driver details for dynamic dropdown of Conductor-For
router.get('/getDriverDetails', (req, res) => {
    const query = req.query.q;

    const sql = `
        SELECT name, vehicle_no 
        FROM transport_driver_conductor_details 
        WHERE driver_conductor_type = 'driver' AND (name LIKE ? OR vehicle_no LIKE ?)
    `;
    const values = [`%${query}%`, `%${query}%`];

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to validate driver/conductor details before adding or updating
router.post('/validateDriverConductorDetails', (req, res) => {
    const { id, name, type, vehicle_no } = req.body;

    // SQL query to check if the name already exists for a different entry
    const sqlValidateName = id ? `
        SELECT id
        FROM transport_driver_conductor_details
        WHERE name = ? AND id != ?
    ` : `
        SELECT id
        FROM transport_driver_conductor_details
        WHERE name = ?
    `;
    const valuesValidateName = id ? [name, id] : [name];

    // SQL query to check if the vehicle number already exists for a different driver
    const sqlValidateVehicleNo = type === 'driver' ? (id ? `
        SELECT id
        FROM transport_driver_conductor_details
        WHERE vehicle_no = ? AND id != ?
    ` : `
        SELECT id
        FROM transport_driver_conductor_details
        WHERE vehicle_no = ?
    `) : null;
    const valuesValidateVehicleNo = type === 'driver' ? (id ? [vehicle_no, id] : [vehicle_no]) : null;

    // SQL query to check if the vehicle number exists for the entered name when type is conductor
    const sqlValidateConductorVehicle = type === 'conductor' ? `
        SELECT id
        FROM transport_driver_conductor_details
        WHERE name = ? AND vehicle_no = ?
    ` : null;
    const valuesValidateConductorVehicle = type === 'conductor' ? [name, vehicle_no] : null;

    // SQL query to check if the vehicle already has a conductor assigned
    const sqlValidateExistingConductor = type === 'conductor' ? (id ? `
        SELECT id
        FROM transport_driver_conductor_details
        WHERE vehicle_no = ? AND driver_conductor_type = 'conductor' AND id != ?
    ` : `
        SELECT id
        FROM transport_driver_conductor_details
        WHERE vehicle_no = ? AND driver_conductor_type = 'conductor'
    `) : null;
    const valuesValidateExistingConductor = type === 'conductor' ? (id ? [vehicle_no, id] : [vehicle_no]) : null;

    // Perform validations
    req.connectionPool.query(sqlValidateName, valuesValidateName, (validateErrorName, validateResultsName) => {
        if (validateErrorName) {
            console.error('Database validation failed:', validateErrorName);
            return res.status(500).json({ isValid: false, message: 'Database validation failed' });
        }

        if (validateResultsName.length > 0) {
            return res.status(400).json({
                isValid: false,
                message: `A driver/conductor with the name '<strong>${name}</strong>' already exists.`
            });
        }

        if (sqlValidateVehicleNo) {
            req.connectionPool.query(sqlValidateVehicleNo, valuesValidateVehicleNo, (validateErrorVehicleNo, validateResultsVehicleNo) => {
                if (validateErrorVehicleNo) {
                    console.error('Database validation failed:', validateErrorVehicleNo);
                    return res.status(500).json({ isValid: false, message: 'Database validation failed' });
                }

                if (validateResultsVehicleNo.length > 0) {
                    return res.status(400).json({
                        isValid: false,
                        message: `A driver with the vehicle number '<strong>${vehicle_no}</strong>' already exists.`
                    });
                }

                if (sqlValidateExistingConductor) {
                    req.connectionPool.query(sqlValidateExistingConductor, valuesValidateExistingConductor, (validateErrorExistingConductor, validateResultsExistingConductor) => {
                        if (validateErrorExistingConductor) {
                            console.error('Database validation failed:', validateErrorExistingConductor);
                            return res.status(500).json({ isValid: false, message: 'Database validation failed' });
                        }

                        if (validateResultsExistingConductor.length > 0) {
                            return res.status(400).json({
                                isValid: false,
                                message: `The vehicle number '<strong>${vehicle_no}</strong>' already has a conductor assigned.`
                            });
                        }

                        if (sqlValidateConductorVehicle) {
                            req.connectionPool.query(sqlValidateConductorVehicle, valuesValidateConductorVehicle, (validateErrorConductorVehicle, validateResultsConductorVehicle) => {
                                if (validateErrorConductorVehicle) {
                                    console.error('Database validation failed:', validateErrorConductorVehicle);
                                    return res.status(500).json({ isValid: false, message: 'Database validation failed' });
                                }

                                if (validateResultsConductorVehicle.length > 0) {
                                    return res.status(400).json({
                                        isValid: false,
                                        message: `The vehicle number '<strong>${vehicle_no}</strong>' is already assigned to the conductor '<strong>${name}</strong>'.`
                                    });
                                }

                                res.status(200).json({ isValid: true });
                            });
                        } else {
                            res.status(200).json({ isValid: true });
                        }
                    });
                } else if (sqlValidateConductorVehicle) {
                    req.connectionPool.query(sqlValidateConductorVehicle, valuesValidateConductorVehicle, (validateErrorConductorVehicle, validateResultsConductorVehicle) => {
                        if (validateErrorConductorVehicle) {
                            console.error('Database validation failed:', validateErrorConductorVehicle);
                            return res.status(500).json({ isValid: false, message: 'Database validation failed' });
                        }

                        if (validateResultsConductorVehicle.length > 0) {
                            return res.status(400).json({
                                isValid: false,
                                message: `The vehicle number '<strong>${vehicle_no}</strong>' is already assigned to the conductor '<strong>${name}</strong>'.`
                            });
                        }

                        res.status(200).json({ isValid: true });
                    });
                } else {
                    res.status(200).json({ isValid: true });
                }
            });
        } else if (sqlValidateExistingConductor) {
            req.connectionPool.query(sqlValidateExistingConductor, valuesValidateExistingConductor, (validateErrorExistingConductor, validateResultsExistingConductor) => {
                if (validateErrorExistingConductor) {
                    console.error('Database validation failed:', validateErrorExistingConductor);
                    return res.status(500).json({ isValid: false, message: 'Database validation failed' });
                }

                if (validateResultsExistingConductor.length > 0) {
                    return res.status(400).json({
                        isValid: false,
                        message: `The vehicle number '<strong>${vehicle_no}</strong>' already has a conductor assigned.`
                    });
                }

                if (sqlValidateConductorVehicle) {
                    req.connectionPool.query(sqlValidateConductorVehicle, valuesValidateConductorVehicle, (validateErrorConductorVehicle, validateResultsConductorVehicle) => {
                        if (validateErrorConductorVehicle) {
                            console.error('Database validation failed:', validateErrorConductorVehicle);
                            return res.status(500).json({ isValid: false, message: 'Database validation failed' });
                        }

                        if (validateResultsConductorVehicle.length > 0) {
                            return res.status(400).json({
                                isValid: false,
                                message: `The vehicle number '<strong>${vehicle_no}</strong>' is already assigned to the conductor '<strong>${name}</strong>'.`
                            });
                        }

                        res.status(200).json({ isValid: true });
                    });
                } else {
                    res.status(200).json({ isValid: true });
                }
            });
        } else if (sqlValidateConductorVehicle) {
            req.connectionPool.query(sqlValidateConductorVehicle, valuesValidateConductorVehicle, (validateErrorConductorVehicle, validateResultsConductorVehicle) => {
                if (validateErrorConductorVehicle) {
                    console.error('Database validation failed:', validateErrorConductorVehicle);
                    return res.status(500).json({ isValid: false, message: 'Database validation failed' });
                }

                if (validateResultsConductorVehicle.length > 0) {
                    return res.status(400).json({
                        isValid: false,
                        message: `The vehicle number '<strong>${vehicle_no}</strong>' is already assigned to the conductor '<strong>${name}</strong>'.`
                    });
                }

                res.status(200).json({ isValid: true });
            });
        } else {
            res.status(200).json({ isValid: true });
        }
    });
});



// Function to get initials from school name
function getInitials(schoolName) {
    return schoolName
        .split(' ')
        .map(word => word[0].toLowerCase())
        .join('');
}

// Endpoint to handle driverConductor form submission
router.post('/addDriverConductor', (req, res) => {
    const { name, contact, address, type, vehicle_no, vehicle_type, vehicle_capacity } = req.body;

    // Validate required fields
    if (!name || !contact || !address || !type) {
        return res.status(400).json({ error: 'Name, contact, address, and type are required fields' });
    }

    // Retrieve school name from cookie
    const schoolName = req.cookies.schoolName;
    if (!schoolName) {
        return res.status(400).json({ error: 'School name is required' });
    }

    // Format school name to lowercase and replace spaces with underscores
    const formattedSchoolName = schoolName.replace(/\s+/g, '_').toLowerCase();

    // Format school name to initials
    const schoolInitials = getInitials(schoolName);

    // Generate username and password
    const username = name.replace(/\s+/g, '').toLowerCase(); // Remove spaces and convert to lowercase
    const password = `${schoolInitials}@${username}`;
    const userType = type.toLowerCase() === 'driver' ? 'driver' : 'conductor'; // Determine user type based on the type from client

    // Start a transaction
    req.connectionPool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        connection.beginTransaction(error => {
            if (error) {
                return res.status(500).json({ error: 'Transaction initiation failed' });
            }

            // First, insert data into the transport_driver_conductor_details table without uid
            const sqlDriverConductor = `
                INSERT INTO transport_driver_conductor_details (name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const valuesDriverConductor = [name, contact, address, type, vehicle_no, vehicle_type, vehicle_capacity];

            connection.query(sqlDriverConductor, valuesDriverConductor, (error, resultsDriverConductor) => {
                if (error) {
                    return connection.rollback(() => {
                        res.status(500).json({ error: 'Database insertion failed for driver/conductor details' });
                    });
                }

                // Generate the uid
                const uid = `${formattedSchoolName}_${userType}_${resultsDriverConductor.insertId}`;

                // Update the transport_driver_conductor_details table with the uid
                const sqlUpdateDriverConductor = `
                    UPDATE transport_driver_conductor_details
                    SET uid = ?
                    WHERE id = ?
                `;
                const valuesUpdateDriverConductor = [uid, resultsDriverConductor.insertId];

                connection.query(sqlUpdateDriverConductor, valuesUpdateDriverConductor, (error) => {
                    if (error) {
                        return connection.rollback(() => {
                            res.status(500).json({ error: 'Database update failed for driver/conductor uid' });
                        });
                    }

                    // Now, insert data into the android_app_users table using connection_auth
                    const sqlUser = `
                      INSERT INTO android_app_users (username, password, school_name, type, name, uid)
                      VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    const valuesUser = [username, password, schoolName, userType, name, uid];

                    connection_auth.query(sqlUser, valuesUser, (error, resultsUser) => {
                        if (error) {
                            return connection.rollback(() => {
                                res.status(500).json({ error: 'Database insertion failed for user details' });
                            });
                        }


                        // Commit the transaction
                        connection.commit(error => {
                            if (error) {
                                return connection.rollback(() => {
                                    res.status(500).json({ error: 'Transaction commit failed' });
                                });
                            }

                            res.status(200).json({
                                message: 'Driver/Conductor added successfully',
                                driverConductorId: resultsDriverConductor.insertId,
                                userId: resultsUser.insertId
                            });
                        });
                    });
                });
            });
        });
    });
});

// Endpoint to fetch all driver and conductor details
router.get('/displayDriverConductors', (req, res) => {
    const sql = 'SELECT * FROM transport_driver_conductor_details';
    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to delete a driver/conductor by ID
router.delete('/deleteDriverConductor/:id', (req, res) => {
    const id = req.params.id;

    // First, fetch the driver/conductor details to get the name and uid
    const fetchQuery = 'SELECT name, uid FROM transport_driver_conductor_details WHERE id = ?';
    req.connectionPool.query(fetchQuery, [id], (fetchError, fetchResults) => {
        if (fetchError) {
            console.error('Error fetching driver/conductor details:', fetchError);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (fetchResults.length === 0) {
            return res.status(404).json({ error: 'Driver/Conductor not found' });
        }

        const name = fetchResults[0].name;
        const uid = fetchResults[0].uid;

        // Check if the driver or vehicle is tagged in the transport_schedule_details table
        const checkScheduleQuery = 'SELECT * FROM transport_schedule_details WHERE driver_name = ? OR conductor_name = ? LIMIT 1';
        req.connectionPool.query(checkScheduleQuery, [name, name], (checkScheduleError, checkScheduleResults) => {
            if (checkScheduleError) {
                console.error('Error checking schedule details:', checkScheduleError);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (checkScheduleResults.length > 0) {
                return res.status(400).json({
                    error: 'Driver/Conductor is tagged to a route and shift. Please untag before deleting.',
                    vehicle_no: checkScheduleResults[0].vehicle_no,
                    driver_name: checkScheduleResults[0].driver_name,
                    route_name: checkScheduleResults[0].route_name,
                    shift_name: checkScheduleResults[0].shift_name,
                    students_tagged: checkScheduleResults[0].students_tagged
                });
            }

            // Delete from transport_driver_conductor_details table
            const deleteDriverConductorQuery = 'DELETE FROM transport_driver_conductor_details WHERE id = ?';
            req.connectionPool.query(deleteDriverConductorQuery, [id], (deleteDriverConductorError, deleteDriverConductorResults) => {
                if (deleteDriverConductorError) {
                    console.error('Error deleting driver/conductor:', deleteDriverConductorError);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                if (deleteDriverConductorResults.affectedRows === 0) {
                    return res.status(404).json({ error: 'Driver/Conductor not found' });
                }

                // Delete from android_app_users table using uid
                const deleteUserQuery = 'DELETE FROM android_app_users WHERE uid = ?';
                connection_auth.query(deleteUserQuery, [uid], (deleteUserError, deleteUserResults) => {
                    if (deleteUserError) {
                        console.error('Error deleting user:', deleteUserError);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    res.status(200).json({ message: 'Driver/Conductor and associated user deleted successfully', name: name });
                });
            });
        });
    });
});

// /// Combined Update API
// router.put('/updateAllDetails', async (req, res) => {
//     const { id, name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity, new_seats, dr_id } = req.body;

//     try {
//         // 1. Update Android App Users Table
//         const username = name;
//         username.replace(/\s+/g, '').toLowerCase(); // Remove spaces and convert to lowercase
//         const password = `school@${username}`;

//         const sqlAndroidAppUsers = `
//             UPDATE android_app_users
//             SET username = ?, password = ?, name = ?
//             WHERE dr_id = ?
//         `;
//         await req.connectionPool.query(sqlAndroidAppUsers, [username, password, name, dr_id]);

//         // 2. Update Driver/Conductor Details Table
//         const updates = [];
//         const params = [];

//         if (name) {
//             updates.push('name = ?');
//             params.push(name);
//         }
//         if (contact) {
//             updates.push('contact = ?');
//             params.push(contact);
//         }
//         if (address) {
//             updates.push('address = ?');
//             params.push(address);
//         }
//         if (driver_conductor_type) {
//             updates.push('driver_conductor_type = ?');
//             params.push(driver_conductor_type);
//         }
//         if (vehicle_no) {
//             updates.push('vehicle_no = ?');
//             params.push(vehicle_no);
//         }
//         if (vehicle_type) {
//             updates.push('vehicle_type = ?');
//             params.push(vehicle_type);
//         }
//         if (vehicle_capacity) {
//             updates.push('vehicle_capacity = ?');
//             params.push(vehicle_capacity);
//         }

//         params.push(id);

//         const sqlDriverConductor = `
//             UPDATE transport_driver_conductor_details
//             SET ${updates.join(', ')}
//             WHERE id = ?
//         `;
//         await req.connectionPool.query(sqlDriverConductor, params);

//         // 3. Update Transport Schedule Details Table
//         if (vehicle_no) {
//             // Get the driver's name to update in schedule details
//             const driverName = name; // Use the updated name directly

//             const sqlScheduleDetails = `
//                 UPDATE transport_schedule_details
//                 SET driver_name = ?
//                 WHERE vehicle_no = ?
//             `;
//             await req.connectionPool.query(sqlScheduleDetails, [driverName, vehicle_no]);

//             // Update available seats and vehicle capacity if applicable
//             const results = await req.connectionPool.query(`
//                 SELECT available_seats, vehicle_capacity
//                 FROM transport_schedule_details
//                 WHERE vehicle_no = ?
//             `, [vehicle_no]);

//             if (results.length > 0) {
//                 const { available_seats, vehicle_capacity: existing_vehicle_capacity } = results[0];

//                 const new_available_seats = available_seats + new_seats;
//                 const new_vehicle_capacity = existing_vehicle_capacity + new_seats;

//                 const sqlUpdateCapacity = `
//                     UPDATE transport_schedule_details
//                     SET available_seats = ?, vehicle_capacity = ?
//                     WHERE vehicle_no = ?
//                 `;
//                 await req.connectionPool.query(sqlUpdateCapacity, [new_available_seats, new_vehicle_capacity, vehicle_no]);
//             }
//         }

//         res.status(200).json({ message: 'All details updated successfully' });
//     } catch (error) {
//         console.error('Error updating details:', error);
//         res.status(500).json({ message: 'Failed to update details' });
//     }
// });

router.put('/updateAllDetails', (req, res) => {
    const { id, name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity, new_seats } = req.body;

    // Retrieve school name from cookie
    const schoolName = req.cookies.schoolName;
    if (!schoolName) {
        return res.status(400).json({ error: 'School name is required' });
    }

    // Format school name to initials
    const schoolInitials = getInitials(schoolName);

    req.connectionPool.getConnection((err, conn) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ message: 'Failed to get database connection' });
        }

        // Declare all SQL queries
        const username = name.replace(/\s+/g, '').toLowerCase();
        const password = `${schoolInitials}@${username}`;

        const sqlSelectUid = `
            SELECT uid
            FROM transport_driver_conductor_details
            WHERE id = ?
        `;
        const sqlUpdateAndroidAppUsers = `
            UPDATE android_app_users
            SET username = ?, password = ?, name = ?
            WHERE uid = ?
        `;
        const sqlUpdateDriverConductor = `
            UPDATE transport_driver_conductor_details
            SET name = ?, contact = ?, address = ?, driver_conductor_type = ?, vehicle_no = ?, vehicle_type = ?, vehicle_capacity = ?
            WHERE id = ?
        `;
        const sqlUpdateDriverName = `
            UPDATE transport_schedule_details
            SET driver_name = ?
            WHERE vehicle_no = ?
        `;
        const sqlSelectCapacity = `
            SELECT shift_name, available_seats, vehicle_capacity
            FROM transport_schedule_details
            WHERE vehicle_no = ?
        `;
        const sqlUpdateCapacity = `
            UPDATE transport_schedule_details
            SET available_seats = ?, vehicle_capacity = ?
            WHERE vehicle_no = ? AND shift_name = ?
        `;

        // Execute the SELECT query to get the uid
        conn.query(sqlSelectUid, [id], (err, results) => {
            if (err) {
                conn.release();
                console.error('Error selecting from transport_driver_conductor_details table:', err);
                return res.status(500).json({ message: 'Failed to select from transport_driver_conductor_details table' });
            }
            if (results.length === 0) {
                conn.release();
                console.error('No rows found in transport_driver_conductor_details table for id:', id);
                return res.status(404).json({ message: 'No rows found in transport_driver_conductor_details table for id' });
            }

            const uid = results[0].uid;

            // Execute SQL queries one by one without transaction
            connection_auth.query(sqlUpdateAndroidAppUsers, [username, password, name, uid], (err, androidAppResult) => {
                if (err) {
                    conn.release();
                    console.error('Error updating android_app_users table:', err);
                    return res.status(500).json({ message: 'Failed to update android_app_users table' });
                }
                if (androidAppResult.affectedRows === 0) {
                    conn.release();
                    console.error('No rows affected in android_app_users table:', { username, password, name, uid });
                    return res.status(404).json({ message: 'No rows affected in android_app_users table' });
                }

                conn.query(sqlUpdateDriverConductor, [name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity, id], (err, driverConductorResult) => {
                    if (err) {
                        conn.release();
                        console.error('Error updating transport_driver_conductor_details table:', err);
                        return res.status(500).json({ message: 'Failed to update transport_driver_conductor_details table' });
                    }
                    if (driverConductorResult.affectedRows === 0) {
                        conn.release();
                        console.error('No rows affected in transport_driver_conductor_details table:', { name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity, id });
                        return res.status(404).json({ message: 'No rows affected in transport_driver_conductor_details table' });
                    }

                    if (vehicle_no) {
                        conn.query(sqlUpdateDriverName, [name, vehicle_no], (err, driverNameResult) => {
                            if (err) {
                                conn.release();
                                console.error('Error updating transport_schedule_details table:', err);
                                return res.status(500).json({ message: 'Failed to update transport_schedule_details table' });
                            }

                            conn.query(sqlSelectCapacity, [vehicle_no], (err, results) => {
                                if (err) {
                                    conn.release();
                                    console.error('Error selecting from transport_schedule_details table:', err);
                                    return res.status(500).json({ message: 'Failed to select from transport_schedule_details table' });
                                }

                                if (results.length === 0) {
                                    // If no rows found in transport_schedule_details table, skip the capacity update
                                    conn.release();
                                    return res.status(200).json({ message: 'All details updated successfully, but no schedule details found to update capacity.' });
                                }

                                // Loop through each record and update the capacity and available seats
                                let updateCount = 0;
                                results.forEach(record => {
                                    const { shift_name, available_seats, vehicle_capacity: existing_vehicle_capacity } = record;
                                    const new_available_seats = available_seats + new_seats;
                                    const new_vehicle_capacity = existing_vehicle_capacity + new_seats;

                                    conn.query(sqlUpdateCapacity, [new_available_seats, new_vehicle_capacity, vehicle_no, shift_name], (err, updateCapacityResult) => {
                                        if (err) {
                                            console.error('Error updating transport_schedule_details table:', err);
                                            return res.status(500).json({ message: 'Failed to update transport_schedule_details table' });
                                        }
                                        if (updateCapacityResult.affectedRows === 0) {
                                            console.error('No rows affected in transport_schedule_details table for capacity update:', { new_available_seats, new_vehicle_capacity, vehicle_no, shift_name });
                                            return res.status(404).json({ message: 'No rows affected in transport_schedule_details table for capacity update' });
                                        }

                                        updateCount++;
                                        if (updateCount === results.length) {
                                            conn.release();
                                            res.status(200).json({ message: 'All details updated successfully' });
                                        }
                                    });
                                });
                            });
                        });
                    } else {
                        conn.release();
                        res.status(200).json({ message: 'All details updated successfully' });
                    }
                });
            });
        });
    });
});

module.exports = router;