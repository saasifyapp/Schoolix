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
        const primaryQuery = `SELECT DISTINCT Standard FROM primary_student_details WHERE is_active = 1 ORDER BY Standard`;
        const prePrimaryQuery = `SELECT DISTINCT Standard FROM pre_primary_student_details WHERE is_active = 1 ORDER BY Standard`;

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

        // Add the extra entry 'GENERAL'
        if (!uniqueStandards.includes('GENERAL')) {
            uniqueStandards.push('GENERAL');
        }

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

    // Query to check if a fee structure with the same category name and grade already exists
    const checkQuery = `
        SELECT * FROM fee_structures 
        WHERE category_id = ? AND category_name = ? AND class_grade = ? AND class_grade != 'GENERAL'
    `;

    const checkValues = [categoryId, categoryName, classGrade];

    req.connectionPool.query(checkQuery, checkValues, (error, results) => {
        if (error) {
            console.error('Error checking fee structure:', error);
            return res.status(500).json({ error: 'Error checking fee structure' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: `Fee structure for selected category and grade already exists` });
        }

        // Insert query if no existing fee structure is found
        const insertQuery = `
            INSERT INTO fee_structures (category_id, category_name, class_grade, amount, route_id)
            VALUES (?, ?, ?, ?, NULL)
        `;
        
        const insertValues = [categoryId, categoryName, classGrade, amount];

        req.connectionPool.query(insertQuery, insertValues, (error, results) => {
            if (error) {
                console.error('Error inserting fee structure:', error);
                return res.status(500).json({ error: 'Error inserting fee structure' });
            }
            res.status(201).json({ message: 'Fee structure added successfully', structureId: results.insertId });
        });
    });
});


// GET Endpoint to load the fee structures
router.get('/getFeeStructures', (req, res) => {
    const query = `SELECT structure_id, category_name, class_grade, amount FROM fee_structures`;

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching fee structures:', error);
            return res.status(500).json({ error: 'Error fetching fee structures' });
        }
        res.status(200).json(results);
    });
});

// DELETE Endpoint to delete a fee structure
router.delete('/deleteFeeStructure/:structureId', (req, res) => {
    const { structureId } = req.params;

    const deleteQuery = `DELETE FROM fee_structures WHERE structure_id = ?`;

    req.connectionPool.query(deleteQuery, [structureId], (error, results) => {
        if (error) {
            console.error('Error deleting fee structure:', error);
            return res.status(500).json({ error: 'Error deleting fee structure' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Fee structure not found' });
        }

        res.status(200).json({ message: 'Fee structure deleted successfully' });
    });
});

// In your backend route
router.put('/updateFeeAmount', (req, res) => {
    const { structure_id, amount } = req.body;

    if (!structure_id || !amount) {
        return res.status(400).json({ message: 'Error: structure_id and amount are required' });
    }

    const query = `UPDATE fee_structures SET amount = ? WHERE structure_id = ?`;

    req.connectionPool.query(query, [amount, structure_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error: Unable to update the fee amount' });
        }

        if (result.affectedRows > 0) {
            res.json({ message: 'Fee amount updated successfully' });
        } else {
            res.status(404).json({ message: 'Error: Fee structure not found' });
        }
    });
});



module.exports = router;