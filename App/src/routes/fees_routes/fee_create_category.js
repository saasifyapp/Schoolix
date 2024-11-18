const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

// POST Endpoint to create a new fee category
router.post('/createFeeCategory', (req, res) => {
    const { category_name, description } = req.body;

    if (!category_name) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    const checkQuery = 'SELECT COUNT(*) AS count FROM fee_categories WHERE category_name = ?';

    req.connectionPool.query(checkQuery, [category_name], (error, results) => {
        if (error) {
            console.error('Error querying fee_categories:', error);
            return res.status(500).json({ error: 'Error checking category name' });
        }

        const count = results[0].count;
        if (count > 0) {
            return res.status(400).json({ error: 'Category name already exists' });
        }

        const insertQuery = `
            INSERT INTO fee_categories (category_name, description)
            VALUES (?, ?)
        `;

        req.connectionPool.query(insertQuery, [category_name, description], (error, results) => {
            if (error) {
                console.error('Error inserting into fee_categories:', error);
                return res.status(500).json({ error: 'Error creating category' });
            }
            res.status(201).json({
                message: 'Category created successfully',
                categoryId: results.insertId
            });
        });
    });
});


// GET Endpoint to fetch fee categories
router.get('/getFeeCategories', (req, res) => {
    const query = 'SELECT category_id, category_name, description FROM fee_categories';

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching fee categories:', error);
            return res.status(500).json({ error: 'Error fetching fee categories' });
        }
        res.status(200).json(results);
    });
});

// DELETE Endpoint to delete a fee category with validation
router.delete('/deleteFeeCategory/:id', (req, res) => {
    const categoryId = req.params.id;

    // Query to check if the category exists in fee_structures
    const checkQuery = 'SELECT * FROM fee_structures WHERE category_id = ?';

    req.connectionPool.query(checkQuery, [categoryId], (error, checkResults) => {
        if (error) {
            console.error('Error checking fee category in fee_structures:', error);
            return res.status(500).json({ error: 'Error validating fee category' });
        }

        if (checkResults.length > 0) {
            return res.status(400).json({ error: 'Category cannot be deleted, it is used in fee structures' });
        }

        // Delete the fee category if validation passes
        const deleteQuery = 'DELETE FROM fee_categories WHERE category_id = ?';

        req.connectionPool.query(deleteQuery, [categoryId], (error, results) => {
            if (error) {
                console.error('Error deleting fee category:', error);
                return res.status(500).json({ error: 'Error deleting fee category' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.status(200).json({ message: 'Category deleted successfully' });
        });
    });
});

// PUT Endpoint to edit a fee category and update category name in fee_structures
router.put('/editFeeCategory/:categoryId', (req, res) => {
    const { categoryId } = req.params;
    const { category_name, description } = req.body;

    if (!category_name) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    // Begin transaction
    req.connectionPool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection from pool:', err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        // Start the transaction
        connection.beginTransaction(error => {
            if (error) {
                connection.release();
                console.error('Error starting transaction:', error);
                return res.status(500).json({ error: 'Error starting transaction' });
            }

            // First update: fee_categories table
            const updateFeeCategoriesQuery = `
                UPDATE fee_categories 
                SET category_name = ?, description = ?
                WHERE category_id = ?
            `;
            connection.query(updateFeeCategoriesQuery, [category_name, description, categoryId], (err, results) => {
                if (err || results.affectedRows === 0) {
                    connection.rollback(() => {
                        connection.release();
                        if (err) {
                            console.error('Error updating fee_categories:', err);
                            return res.status(500).json({ error: 'Error updating category in fee_categories' });
                        }
                        return res.status(404).json({ error: 'Category not found in fee_categories' });
                    });
                    return;
                }

                // Second update: fee_structures table
                const updateFeeStructuresQuery = `
                    UPDATE fee_structures 
                    SET category_name = ? 
                    WHERE category_id = ?
                `;
                connection.query(updateFeeStructuresQuery, [category_name, categoryId], (err) => {
                    if (err) {
                        connection.rollback(() => {
                            connection.release();
                            console.error('Error updating fee_structures:', err);
                            return res.status(500).json({ error: 'Error updating category in fee_structures' });
                        });
                        return;
                    }

                    // If the category is not found in fee_structures, this is not considered a failure
                    // Commit the transaction regardless
                    connection.commit(err => {
                        if (err) {
                            connection.rollback(() => {
                                connection.release();
                                console.error('Error committing transaction:', err);
                                return res.status(500).json({ error: 'Error committing transaction' });
                            });
                            return;
                        }

                        // Success: Updates completed
                        connection.release();
                        res.status(200).json({ message: 'Category updated successfully' });
                    });
                });
            });
        });
    });
});




module.exports = router;