const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// New endpoint to get distinct addresses for route assignment
router.get('/distinctAddresses', (req, res) => {
    const sql = `
        SELECT DISTINCT transport_pickup_drop
        FROM (
            SELECT transport_pickup_drop FROM pre_primary_student_details WHERE transport_pickup_drop IS NOT NULL
            UNION
            SELECT transport_pickup_drop FROM primary_student_details WHERE transport_pickup_drop IS NOT NULL
        ) AS combined_addresses;
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});
// Endpoint to add a new route
router.post('/addRoute', (req, res) => {
    const { routeName, citiesAddress } = req.body;

    // Validate required fields
    if (!routeName || !citiesAddress) {
        return res.status(400).json({ error: 'Route Name and Cities/Address are required fields' });
    }

    // Insert data into the table
    const sql = `
        INSERT INTO transport_route_shift_details (route_shift_type, route_shift_name, route_shift_detail)
        VALUES ('route', ?, ?)
    `;
    const values = [routeName, citiesAddress];

    req.connectionPool.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database insertion failed' });
        }
        res.status(200).json({ message: 'Route added successfully', id: results.insertId });
    });
});



// Endpoint to fetch all route details where route_shift_type is 'route'
router.get('/displayRoutes', (req, res) => {
    const sql = `
        SELECT route_shift_id, route_shift_name, route_shift_detail
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

router.delete('/deleteRoute/:route_shift_id', async (req, res) => {
    const { route_shift_id } = req.params;

    try {
        const [result] = await req.connectionPool.query('DELETE FROM transport_route_shift_details WHERE route_shift_id = ?', [route_shift_id]);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Route deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Route not found' });
        }
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({ success: false, message: 'Error deleting route' });
    }
});

// Route to handle updating the transport route shift details
router.post('/updateRoute', (req, res) => {
    const { routeShiftId, routeName, routeCities, routeType } = req.body;
    
    if (!routeShiftId || !routeName || !routeCities || !routeType) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `
        UPDATE transport_route_shift_details
        SET route_shift_name = ?, 
            route_shift_detail = ?, 
            route_shift_type = ?
        WHERE route_shift_id = ?`;

        req.connectionPool.query(
        query, 
        [routeName, routeCities, routeType, routeShiftId], 
        (error, results) => {
            if (error) {
                console.error('Error updating route shift details:', error);
                return res.status(500).json({ error: 'Database update failed' });
            }
            res.status(200).json({ message: 'Route updated successfully' });
        }
    );
});


module.exports = router;