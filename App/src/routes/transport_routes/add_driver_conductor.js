const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

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

    // Insert data into the table
    const sql = `
        INSERT INTO transport_driver_conductor_details (name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, contact, address, type, vehicle_no, vehicle_type, vehicle_capacity];

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(200).json({ message: 'Driver/Conductor added successfully', id: results.insertId });
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

    const query = 'DELETE FROM transport_driver_conductor_details WHERE id = ?';
    req.connectionPool.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error deleting driver/conductor:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Driver/Conductor not found' });
        }

        res.status(200).json({ message: 'Driver/Conductor deleted successfully' });
    });
});

router.put('/editDriverConductor', async (req, res) => {
    const { id, name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity } = req.body;

    try {
        // Prepare SQL query parts
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

        // Construct the SQL query
        const sql = `
            UPDATE transport_driver_conductor_details
            SET ${updates.join(', ')}
            WHERE id = ?
        `;

        await req.connectionPool.query(sql, params);
        res.status(200).json({ message: 'Details updated successfully' });
    } catch (error) {
        console.error('Error updating driver/conductor details:', error);
        res.status(500).json({ message: 'Failed to update details' });
    }
});


module.exports = router;