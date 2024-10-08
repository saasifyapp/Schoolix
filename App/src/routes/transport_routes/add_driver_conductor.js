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

    // Generate username and password
    const username = name.replace(/\s+/g, '').toLowerCase(); // Remove spaces and convert to lowercase
    const password = `school@${username}`;
    const userType = type.toLowerCase() === 'driver' ? 'driver' : 'conductor'; // Determine user type based on the type from client

    // First, insert data into the transport_driver_conductor_details table
    const sqlDriverConductor = `
        INSERT INTO transport_driver_conductor_details (name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const valuesDriverConductor = [name, contact, address, type, vehicle_no, vehicle_type, vehicle_capacity];

    req.connectionPool.query(sqlDriverConductor, valuesDriverConductor, (error, resultsDriverConductor) => {
        if (error) {
            return res.status(500).json({ error: 'Database insertion failed for driver/conductor details' });
        }

        // Now, insert data into the android_app_users table
        const sqlUser = `
            INSERT INTO android_app_users (username, password, school_name, type)
            VALUES (?, ?, ?, ?)
        `;
        const valuesUser = [username, password, schoolName, userType];

        connection_auth.query(sqlUser, valuesUser, (error, resultsUser) => {
            if (error) {
                return res.status(500).json({ error: 'Database insertion failed for user details' });
            }

            res.status(200).json({ 
                message: 'Driver/Conductor added successfully', 
                driverConductorId: resultsDriverConductor.insertId,
                userId: resultsUser.insertId
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

    // First, fetch the driver/conductor details to get the name
    const fetchQuery = 'SELECT name FROM transport_driver_conductor_details WHERE id = ?';
    req.connectionPool.query(fetchQuery, [id], (fetchError, fetchResults) => {
        if (fetchError) {
            console.error('Error fetching driver/conductor details:', fetchError);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (fetchResults.length === 0) {
            return res.status(404).json({ error: 'Driver/Conductor not found' });
        }

        const name = fetchResults[0].name;
        const username = name.replace(/\s+/g, '').toLowerCase(); // Generate the username

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

            // Delete from android_app_users table
            const deleteUserQuery = 'DELETE FROM android_app_users WHERE username = ?';
            connection_auth.query(deleteUserQuery, [username], (deleteUserError, deleteUserResults) => {
                if (deleteUserError) {
                    console.error('Error deleting user:', deleteUserError);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                res.status(200).json({ message: 'Driver/Conductor and associated user deleted successfully' });
            });
        });
    });
});

router.put('/editDriverConductor', async (req, res) => {
    const { id, name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity, new_seats } = req.body;

    try {
        // Prepare SQL query parts for the driver/conductor details table
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (contact !== undefined) {
            updates.push('contact = ?');
            params.push(contact);
        }
        if (address !== undefined) {
            updates.push('address = ?');
            params.push(address);
        }
        if (driver_conductor_type !== undefined) {
            updates.push('driver_conductor_type = ?');
            params.push(driver_conductor_type);
        }
        if (vehicle_no !== undefined) {
            updates.push('vehicle_no = ?');
            params.push(vehicle_no);
        } 
        if (vehicle_type !== undefined) {
            updates.push('vehicle_type = ?');
            params.push(vehicle_type);
        }
        if (vehicle_capacity !== undefined) {
            updates.push('vehicle_capacity = ?');
            params.push(vehicle_capacity);
        }

        // Add the ID as the last parameter
        params.push(id);

        // Construct the SQL query for the driver/conductor details table
        const sqlDriverConductor = `
            UPDATE transport_driver_conductor_details
            SET ${updates.join(', ')}
            WHERE id = ?
        `;

        // Execute the update query for the driver/conductor details table
        await req.connectionPool.query(sqlDriverConductor, params);

        // Now handle the update for the transport_schedule_details table
        if (vehicle_no) {
            // Retrieve existing values of available_seats and vehicle_capacity
            req.connectionPool.query(`
                SELECT available_seats, vehicle_capacity
                FROM transport_schedule_details
                WHERE vehicle_no = ?
            `, [vehicle_no], async (error, results) => {
                if (error) {
                    throw error;
                }

                if (results.length > 0) {
                    const { available_seats, vehicle_capacity: existing_vehicle_capacity } = results[0];

                    // Calculate new values
                    const new_available_seats = available_seats + new_seats;
                    const new_vehicle_capacity = existing_vehicle_capacity + new_seats;

                    // Update the transport_schedule_details table
                    const sqlScheduleDetails = `
                        UPDATE transport_schedule_details
                        SET available_seats = ?, vehicle_capacity = ?
                        WHERE vehicle_no = ?
                    `;

                    await req.connectionPool.query(sqlScheduleDetails, [new_available_seats, new_vehicle_capacity, vehicle_no]);
                }

                res.status(200).json({ message: 'Details updated successfully' });
            });
        } else {
            res.status(200).json({ message: 'Details updated successfully' });
        }
    } catch (error) {
        console.error('Error updating driver/conductor details:', error);
        res.status(500).json({ message: 'Failed to update details' });
    }
});

module.exports = router;