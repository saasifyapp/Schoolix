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

module.exports = router;