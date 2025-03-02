
const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


router.get('/search_enrolled_students', (req, res) => {
    const studentType = req.query.type;

    let table;
    if (studentType === 'primary') {
        table = 'primary_student_details';
    } else if (studentType === 'pre_primary') {
        table = 'pre_primary_student_details';
    } else {
        return res.status(400).json({ error: 'Invalid student type provided' });
    }

    const sql = `SELECT * FROM ${table} WHERE is_active = 1`;

    //console.log('Executing query:', sql);

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        if (!Array.isArray(results)) {
            results = [];
        }
        //console.log('Query results:', results);
        res.status(200).json(results);
    });
});



// Endpoint to fetch columns from the specified table
router.get('/getTableColumns', (req, res) => {
    const tableName = req.query.type === 'primary' ? 'primary_student_details' : 'pre_primary_student_details';

    const sql = `SHOW COLUMNS FROM ${tableName}`;
    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed', details: error });
        }
        const columns = results.map(result => result.Field);
        res.status(200).json(columns);
    });
});



// Endpoint to fetch filtered data based on selected columns
router.post('/fetchFilteredData', (req, res) => {
    const { type, columns } = req.body;

    if (!Array.isArray(columns) || columns.length === 0) {
        return res.status(400).json({ error: 'No columns selected' });
    }

    const tableName = type === 'primary' ? 'primary_student_details' : 'pre_primary_student_details';
    const selectedColumns = columns.join(', ');  // Join columns for SQL query

    const sql = `SELECT ${selectedColumns} FROM ${tableName} WHERE is_active = 1`;
    
    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed', details: error });
        }
        res.status(200).json(results);
    });
});

module.exports = router;