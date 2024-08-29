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
        const sql = `
            UPDATE transport_driver_conductor_details
            SET name = ?, contact = ?, address = ?, driver_conductor_type = ?, vehicle_no = ?, vehicle_type = ?, vehicle_capacity = ?
            WHERE id = ?
        `;
        const params = [name, contact, address, driver_conductor_type, vehicle_no, vehicle_type, vehicle_capacity, id];

        await req.connectionPool.query(sql, params);
        res.status(200).json({ message: 'Details updated successfully' });
    } catch (error) {
        console.error('Error updating driver/conductor details:', error);
        res.status(500).json({ message: 'Failed to update details' });
    }
});


module.exports = router;