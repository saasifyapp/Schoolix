const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

// // Endpoint to fetch driver and conductor details for dynamic dropdown of Conductor-For
// router.get('/tag_getVehicleDetails', (req, res) => {
//     const query = req.query.q;

//     // SQL query to fetch driver details
//     const driverSql = `
//         SELECT 
//             name AS driver_name, 
//             vehicle_no, 
//             vehicle_type, 
//             vehicle_capacity, 
//             (SELECT name FROM transport_driver_conductor_details WHERE vehicle_no = tdc.vehicle_no AND driver_conductor_type = 'Conductor') AS conductor_name
//         FROM transport_driver_conductor_details tdc
//         WHERE driver_conductor_type = 'Driver' AND (name LIKE ? OR vehicle_no LIKE ?)
//     `;
//     const driverValues = [`%${query}%`, `%${query}%`];

//     req.connectionPool.query(driverSql, driverValues, (driverError, driverResults) => {
//         if (driverError) {
//             return res.status(500).json({ error: 'Database query failed' });
//         }

//         res.status(200).json(driverResults);
//     });
// });

// Endpoint to fetch driver and conductor details for dynamic dropdown of Conductor-For
router.get('/tag_getVehicleDetails', (req, res) => {
    // Read the query parameter from the request
    const query = req.query.q ? `%${req.query.q}%` : '%'; // Default to '%' if no query is provided

    // SQL query to fetch driver details with LEFT JOIN to get conductor details
    const driverSql = `
        SELECT DISTINCT
            tdc1.name AS driver_name,
            tdc1.vehicle_no,
            tdc1.vehicle_type,
            tdc1.vehicle_capacity,
            tdc2.name AS conductor_name
        FROM 
            transport_driver_conductor_details tdc1
        LEFT JOIN 
            transport_driver_conductor_details tdc2
        ON 
            tdc1.vehicle_no = tdc2.vehicle_no AND tdc2.driver_conductor_type = 'Conductor'
        WHERE 
            tdc1.driver_conductor_type = 'Driver'
            AND (tdc1.name LIKE ? OR tdc1.vehicle_no LIKE ? OR tdc2.name LIKE ?)
    `;
    const driverValues = [query, query, query];

    req.connectionPool.query(driverSql, driverValues, (driverError, driverResults) => {
        if (driverError) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        // Map to filter out any potential duplicates
        const uniqueDrivers = driverResults.reduce((acc, current) => {
            const duplicate = acc.find(item => item.vehicle_no === current.vehicle_no);
            if (!duplicate) {
                acc.push(current);
            }
            return acc;
        }, []);

        // Return unique driver results
        res.status(200).json(uniqueDrivers);
    });
});

// Endpoint to fetch all route details where route_shift_type is 'route'
router.get('/tag_getRouteDetails', (req, res) => {
    const sql = `
        SELECT route_shift_name, route_shift_detail
        FROM transport_route_shift_details
        WHERE route_shift_type = 'route'
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to fetch all shift details where route_shift_type is 'shift'
router.get('/tag_getShiftDetails', (req, res) => {
    const sql = `
        SELECT route_shift_name, route_shift_detail
        FROM transport_route_shift_details
        WHERE route_shift_type = 'shift'
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});


// Endpoint to validate details before populating transport schedule
router.post('/tag_validateDetails', (req, res) => {
    const { vehicle_no, route_name, shift_name, driver_name } = req.body;

    // SQL query to check if the vehicle is already tagged to the same route and shift
    const sqlValidateSameRoute = `
        SELECT id
        FROM transport_schedule_details
        WHERE vehicle_no = ? AND route_name = ? AND shift_name = ?
    `;
    const valuesValidateSameRoute = [vehicle_no, route_name, shift_name];

    // SQL query to check if the vehicle is tagged to a different route in the same shift
    const sqlValidateDifferentRoute = `
        SELECT id, route_name
        FROM transport_schedule_details
        WHERE vehicle_no = ? AND shift_name = ? AND route_name != ?
    `;
    const valuesValidateDifferentRoute = [vehicle_no, shift_name, route_name];

    // Perform validation for the same route and shift
    req.connectionPool.query(sqlValidateSameRoute, valuesValidateSameRoute, (validateErrorSameRoute, validateResultsSameRoute) => {
        if (validateErrorSameRoute) {
            console.error('Database validation failed:', validateErrorSameRoute);
            return res.status(500).json({ isValid: false, message: 'Database validation failed' });
        }

        if (validateResultsSameRoute.length > 0) {
            return res.status(400).json({
                isValid: false,
                message: `The vehicle '<strong>${vehicle_no} | ${driver_name}</strong>' is already tagged on Route: '<strong>${route_name}</strong>' in '<strong>${shift_name}</strong>' shift`
            });
        }

        // Perform validation for different routes in the same shift
        req.connectionPool.query(sqlValidateDifferentRoute, valuesValidateDifferentRoute, (validateErrorDifferentRoute, validateResultsDifferentRoute) => {
            if (validateErrorDifferentRoute) {
                console.error('Database validation failed:', validateErrorDifferentRoute);
                return res.status(500).json({ isValid: false, message: 'Database validation failed' });
            }

            if (validateResultsDifferentRoute.length > 0) {
                const existingRouteName = validateResultsDifferentRoute[0].route_name;
                return res.status(400).json({
                    isValid: false,
                    message: `The vehicle '<strong>${vehicle_no} | ${driver_name}</strong>' is already tagged on a different Route: '<strong>${existingRouteName}</strong>' in '<strong>${shift_name}</strong>' shift`
                });
            }

            res.status(200).json({ isValid: true });
        });
    });
});

// Endpoint to populate transport schedule details
router.post('/tag_populateTransportSchedule', (req, res) => {
    const { vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted, vehicle_capacity } = req.body;

    const sqlInsert = `
        INSERT INTO transport_schedule_details (vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted,available_seats, vehicle_capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valuesInsert = [vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted, vehicle_capacity, vehicle_capacity];

    req.connectionPool.query(sqlInsert, valuesInsert, (insertError, insertResults) => {
        if (insertError) {
            console.error('Database insertion failed:', insertError);
            return res.status(500).json({ success: false, error: 'Database insertion failed' });
        }

        res.status(200).json({ success: true });
    });
});


// Endpoint to display route and shift allocation data
router.get('/tag_display_route_shift_allocation_data', (req, res) => {
    const sql = `
        SELECT id, vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted
        FROM transport_schedule_details
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// Endpoint to delete a transport schedule record
router.delete('/delete_transport_schedule/:id', (req, res) => {
    const { id } = req.params;

    // First, check if students_tagged is NULL for the given id
    const checkSql = `
        SELECT vehicle_no, students_tagged, driver_name, route_name, shift_name
        FROM transport_schedule_details
        WHERE id = ?
    `;

    req.connectionPool.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
            console.error('Database query failed:', checkError);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (checkResults.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        const { vehicle_no, students_tagged, driver_name, route_name, shift_name } = checkResults[0];

        if (students_tagged !== null && students_tagged !== 0) {
            return res.status(400).json({
                error: 'Cannot delete record with students tagged',
                vehicle_no: vehicle_no,
                students_tagged: students_tagged,
                driver_name: driver_name,
                route_name: route_name,
                shift_name: shift_name
            });
        }

        // Proceed with deletion if students_tagged is NULL
        const deleteSql = `
            DELETE FROM transport_schedule_details
            WHERE id = ?
        `;

        req.connectionPool.query(deleteSql, [id], (deleteError, deleteResults) => {
            if (deleteError) {
                console.error('Database query failed:', deleteError);
                return res.status(500).json({ error: 'Database query failed' });
            }

            if (deleteResults.affectedRows === 0) {
                return res.status(404).json({ error: 'Record not found' });
            }

            res.status(200).json({
                success: true,
                vehicle_no: vehicle_no,
                route_name: route_name,
                shift_name: shift_name,
                driver_name: driver_name

            });
        });
    });
});


module.exports = router;

