const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

// GET Endpoint to retrieve all fee categories
router.get('/setFee_getCategoryName', (req, res) => {
    const selectQuery = 'SELECT category_id, category_name FROM fee_categories';

    req.connectionPool.query(selectQuery, (error, results) => {
        if (error) {
            console.error('Error retrieving fee categories:', error);
            return res.status(500).json({ error: 'Error retrieving fee categories' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'No categories found' });
        }
        res.status(200).json(results);
    });
});


// Route to get distinct grades (standards) from both tables
router.get('/setFee_getGrades', async (req, res) => {
    try {
        const primaryQuery = `SELECT DISTINCT Standard FROM primary_student_details ORDER BY Standard`;
        const prePrimaryQuery = `SELECT DISTINCT Standard FROM pre_primary_student_details ORDER BY Standard`;

        // Execute both queries
        const primaryPromise = new Promise((resolve, reject) => {
            req.connectionPool.query(primaryQuery, (error, results) => {
                if (error) {
                    console.error('Error querying MySQL for primary standards:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        const prePrimaryPromise = new Promise((resolve, reject) => {
            req.connectionPool.query(prePrimaryQuery, (error, results) => {
                if (error) {
                    console.error('Error querying MySQL for pre-primary standards:', error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        // Wait for both queries to complete
        const [primaryResults, prePrimaryResults] = await Promise.all([primaryPromise, prePrimaryPromise]);

        // Combine the results and get unique standards
        const combinedResults = [...primaryResults, ...prePrimaryResults];
        const uniqueStandards = [...new Set(combinedResults.map(result => result.Standard))];

        // Sort the unique standards
        uniqueStandards.sort((a, b) => {
            // Extract numerical values from the standards
            const numA = parseInt(a.match(/\d+/), 10);
            const numB = parseInt(b.match(/\d+/), 10);

            // Compare numerical values
            if (numA < numB) return -1;
            if (numA > numB) return 1;
            return 0;
        });

        // Log the fetched details
        // console.log('Fetched standards:', uniqueStandards);

        res.json(uniqueStandards);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// POST Endpoint to set fee amount
router.post('/setFeeAmount', (req, res) => {
    const { categoryId, categoryName, classGrade, amount } = req.body;

    if (!categoryId || !categoryName || !classGrade || !amount) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const insertQuery = `
        INSERT INTO fee_structures (category_id, category_name, class_grade, amount, route_id)
        VALUES (?, ?, ?, ?, NULL)
    `;

    const values = [categoryId, categoryName, classGrade, amount];

    req.connectionPool.query(insertQuery, values, (error, results) => {
        if (error) {
            console.error('Error inserting fee structure:', error);
            return res.status(500).json({ error: 'Error inserting fee structure' });
        }
        res.status(201).json({ message: 'Fee structure added successfully', structureId: results.insertId });
    });
});


module.exports = router;