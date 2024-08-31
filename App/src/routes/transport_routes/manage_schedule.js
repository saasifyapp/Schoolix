const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to fetch driver and conductor details for dynamic dropdown of Conductor-For
router.get('/getVehicleDetails', (req, res) => {
    const query = req.query.q;

    // SQL query to fetch driver details
    const driverSql = `
        SELECT name, vehicle_no, vehicle_type, vehicle_capacity 
        FROM transport_driver_conductor_details 
        WHERE driver_conductor_type = 'driver' AND (name LIKE ? OR vehicle_no LIKE ?)
    `;
    const driverValues = [`%${query}%`, `%${query}%`];

    req.connectionPool.query(driverSql, driverValues, (driverError, driverResults) => {
        if (driverError) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (driverResults.length > 0) {
            const vehicleNos = driverResults.map(driver => driver.vehicle_no);

            // SQL query to fetch conductor details for the selected vehicle numbers
            const conductorSql = `
                SELECT name, vehicle_no 
                FROM transport_driver_conductor_details 
                WHERE driver_conductor_type = 'conductor' AND vehicle_no IN (?)
            `;

            req.connectionPool.query(conductorSql, [vehicleNos], (conductorError, conductorResults) => {
                if (conductorError) {
                    return res.status(500).json({ error: 'Database query failed' });
                }

                const combinedResults = driverResults.map(driver => {
                    const conductor = conductorResults.find(c => c.vehicle_no === driver.vehicle_no);
                    return {
                        ...driver,
                        conductor_name: conductor ? conductor.name : 'N/A'
                    };
                });

                res.status(200).json(combinedResults);
            });
        } else {
            res.status(200).json(driverResults);
        }
    });
});

// Endpoint to fetch all route details where route_shift_type is 'route'
router.get('/getRouteDetails', (req, res) => {
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
router.get('/getShiftDetails', (req, res) => {
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



// Endpoint to get the count of students based on transport conditions
router.get('/getStudentCountforTransport', (req, res) => {
    const { stops, classesAlloted } = req.query;

    // Log the stops and classesAlloted strings to the console
   // console.log('Stops String:', stops);
   // console.log('Classes Alloted String:', classesAlloted);

    const stopsArray = stops.split(',').map(stop => stop.trim().replace(/'/g, ''));
    const classesAllotedArray = classesAlloted.split(',').map(cls => cls.trim().replace(/'/g, ''));

    // Split classesAlloted into Standard and Division
    const standardDivisionPairs = classesAllotedArray.map(cls => {
        const [standard, division] = cls.split(' ');
        return { standard, division };
    });

    // Log the arrays to the console
   // console.log('Stops Array:', stopsArray);
   // console.log('Standard-Division Pairs:', standardDivisionPairs);

    const sql = `
        SELECT COUNT(*) AS studentCount
        FROM (
            SELECT transport_pickup_drop, Standard, Division
            FROM pre_primary_student_details
            WHERE transport_needed = 1
            UNION ALL
            SELECT transport_pickup_drop, Standard, Division
            FROM primary_student_details
            WHERE transport_needed = 1
        ) AS combined
        WHERE combined.transport_pickup_drop IN (?) AND (combined.Standard, combined.Division) IN (?)
    `;

    const standardDivisionArray = standardDivisionPairs.map(pair => [pair.standard, pair.division]);

    req.connectionPool.query(sql, [stopsArray, standardDivisionArray], (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        
        // Log the results to the console
        //console.log('Student Count:', results[0].studentCount);
        
        res.status(200).json(results[0]);
    });
});




// Endpoint to populate transport schedule details
router.post('/populateTransportSchedule', (req, res) => {
    const { vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted } = req.body;

    const sql = `
        INSERT INTO transport_schedule_details (vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [vehicle_no, driver_name, conductor_name, route_name, route_stops, shift_name, classes_alloted];

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, error: 'Database insertion failed' });
        }

        res.status(200).json({ success: true });
    });
});


module.exports = router;