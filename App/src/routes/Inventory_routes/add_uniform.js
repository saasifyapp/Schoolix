const express = require('express');
const router = express.Router();
const mysql = require('mysql');


const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Fetching book data endpoint
router.get('/inventory/uniform_vendor', (req, res) => {
    const sql = 'SELECT vendor_name FROM inventory_vendor_details WHERE vendorFor = "Uniform"';
    req.connectionPool.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching books:', err);
            res.status(500).json({ error: 'Error fetching books' });
        } else {
            res.status(200).json(result);
            
        }
    });
});

 
router.post('/inventory/purchase/add_uniforms', (req, res) => {
    const { uniform_item, size_of_item, purchase_price, selling_price, vendor, ordered_quantity } = req.body;

    const remaining_quantity = ordered_quantity;
    const returned_quantity = 0;
 
    // Check if the uniform_item and size_of_item already exists
    const checkSql = `SELECT * FROM inventory_uniform_details WHERE uniform_item = ? AND size_of_item = ?`;

    req.connectionPool.query(checkSql, [uniform_item, size_of_item], (err, result) => {
        if (err) {
            console.error('Error checking uniform item:', err);
            res.status(500).send('Error checking uniform item');
        } else {
            if (result.length > 0) {
                res.status(400).send('Uniform item with this size already exists');
            } else {
                const sql = `INSERT INTO inventory_uniform_details (uniform_item, size_of_item, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity,returned_quantity)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

                req.connectionPool.query(sql, [uniform_item, size_of_item, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity, returned_quantity], (err, result) => {
                    if (err) {
                        console.error('Error adding uniform item:', err);
                        res.status(500).send('Error adding uniform item');
                    } else {
                        console.log('Uniform item added successfully');
                        res.status(200).send('Uniform item added successfully');
                    }
                });
            }
        }
    });
});
// Endpoint to fetch all uniform items
router.get('/inventory/uniforms', (req, res) => {
    const sql = 'SELECT * FROM inventory_uniform_details';

    req.connectionPool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching uniform items:', err);
            res.status(500).json({ error: 'Error fetching uniform items' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to delete a uniform item
router.delete('/inventory/uniforms/:uniformItem/:sizeOfItem', (req, res) => {
    const { uniformItem, sizeOfItem } = req.params;
    const sql = 'DELETE FROM inventory_uniform_details WHERE uniform_item = ? AND size_of_item = ?';

    req.connectionPool.query(sql, [uniformItem, sizeOfItem], (err, result) => {
        if (err) {
            console.error('Error deleting uniform item:', err);
            res.status(500).json({ error: 'Error deleting uniform item' });
        } else {
            console.log('Uniform item deleted successfully');
            res.status(200).json({ message: 'Uniform item deleted successfully' });
        }
    });
});

// Endpoint to handle both GET and PUT requests for retrieving and updating quantity of a uniform item
router.route('/inventory/uniforms/:uniformItem/:sizeOfItem/quantity')
    .get((req, res) => {
        const { uniformItem, sizeOfItem } = req.params;
        const sql = 'SELECT ordered_quantity, remaining_quantity, returned_quantity FROM inventory_uniform_details WHERE uniform_item = ? AND size_of_item = ?';
        req.connectionPool.query(sql, [uniformItem, sizeOfItem], (err, result) => {
            if (err) {
                console.error('Error fetching quantity:', err);
                res.status(500).json({ error: 'Error fetching quantity' });
            } else {
                if (result.length === 0) {
                    res.status(404).json({ error: 'Uniform item not found' });
                } else {
                    const { ordered_quantity, remaining_quantity, returned_quantity } = result[0]; // fetch remaining_quantity from result
                    res.status(200).json({ ordered_quantity, remaining_quantity, returned_quantity });
                }
            }
        });
    })
    .put((req, res) => {
        const { uniformItem, sizeOfItem } = req.params;
        const totalOrder = req.body.total_order; // Get the total order from the request body
        const newRemainingQuantity = req.body.remaining_quantity; // Get the new remaining quantity from the request body
    
        const sql = 'UPDATE inventory_uniform_details SET ordered_quantity = ?, remaining_quantity = ? WHERE uniform_item = ? AND size_of_item = ?';
        req.connectionPool.query(sql, [totalOrder, newRemainingQuantity, uniformItem, sizeOfItem], (err, result) => { // Include newRemainingQuantity in the query
            if (err) {
                console.error('Error updating quantity:', err);
                res.status(500).json({ error: 'Error updating quantity' });
            } else {
                if (result.affectedRows === 0) {
                    res.status(404).json({ error: 'Uniform item not found' });
                } else {
                    res.status(200).json({ message: 'Quantity updated successfully' });
                }
            }
        });
    });

// Endpoint to handle PUT requests for updating returned and remaining quantities of a book
router.route('/inventory/return_uniform/:uniform_item/:size_of_item/quantity')
.put((req, res) => {
    const { uniform_item, size_of_item } = req.params;
    const returnedQuantity = req.body.returnedQuantity; // Get the returned quantity from the request body
    const remainingQuantity = req.body.remainingQuantity; // Get the new remaining quantity from the request body

    
    const sql = 'UPDATE inventory_uniform_details SET returned_quantity = ?, remaining_quantity = ? WHERE uniform_item = ? AND size_of_item = ?';
    req.connectionPool.query(sql, [ returnedQuantity, remainingQuantity, uniform_item, size_of_item], (err, result) => {
        if (err) {
            console.error('Error updating quantity:', err);
            res.status(500).json({ error: 'Error updating quantity' });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Book not found' });
            } else {
                res.status(200).json({ message: 'Quantity updated successfully' });
            }
        }
    });
});

/*

// Endpoint to fetch a single uniform item by name
router.get('/inventory/uniforms/:uniformItem', (req, res) => {
    const { uniformItem } = req.params;
    const sql = 'SELECT * FROM inventory_uniform_details WHERE uniform_item = ?';

    req.connectionPool.query(sql, [uniformItem], (err, result) => {
        if (err) {
            console.error('Error fetching uniform item:', err);
            res.status(500).json({ error: 'Error fetching uniform item' });
        } else if (result.length === 0) {
            res.status(404).json({ error: 'Uniform item not found' });
        } else {
            res.status(200).json(result[0]);
        }
    });
});

// Endpoint to update uniform item details
router.put('/inventory/uniforms/edit', (req, res) => {
    const { uniform_item, size_of_item, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity } = req.body;

    const sql = `UPDATE inventory_uniform_details 
                 SET size_of_item = ?, purchase_price = ?, selling_price = ?, vendor = ?, ordered_quantity = ?, remaining_quantity = ? 
                 WHERE uniform_item = ?`;

    req.connectionPool.query(sql, [size_of_item, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity, uniform_item], (err, result) => {
        if (err) {
            console.error('Error updating uniform item:', err);
            res.status(500).json({ error: 'Error updating uniform item' });
        } else {
            console.log('Uniform item updated successfully');
            res.status(200).json({ message: 'Uniform item updated successfully' });
        }
    });
});
*/
// Add a new endpoint to handle search queries (uniform)
router.get("/inventory/uniforms/search", (req, res) => {
    const searchQuery = req.query.search.trim(); // Get the search query from request URL query parameters

    // Construct the SQL query to filter based on the student name
    let query = `SELECT * FROM inventory_uniform_details WHERE uniform_item LIKE ?`;

    // Execute the SQL query
    req.connectionPool.query(query, [`%${searchQuery}%`], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });


});


// GET and PUT endpoint to fetch and update uniform details by sr_no
router.route('/inventory/uniforms/:sr_no')
    .get((req, res) => {
        const sr_no = req.params.sr_no;
        const sql = 'SELECT * FROM inventory_uniform_details WHERE sr_no = ?';

        req.connectionPool.query(sql, [sr_no], (err, result) => {
            if (err) {
                console.error('Error fetching uniform details:', err);
                return res.status(500).json({ error: 'Failed to fetch uniform details' });
            }
            if (result.length === 0) {
                return res.status(404).json({ error: 'Uniform not found' });
            }
            res.status(200).json(result[0]);
        });
    })
    .put((req, res) => {
        const sr_no = req.params.sr_no;
        const {
            uniform_item,
            size_of_item,
            purchase_price,
            selling_price,
        } = req.body;

        if (!uniform_item || !size_of_item || !purchase_price || !selling_price) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const sql = `
            UPDATE inventory_uniform_details 
            SET uniform_item = ?, size_of_item = ?, purchase_price = ?, selling_price = ?
            WHERE sr_no = ?;
        `;

        req.connectionPool.query(
            sql,
            [uniform_item, size_of_item, purchase_price, selling_price, sr_no],
            (err, result) => {
                if (err) {
                    console.error('Error updating uniform details:', err);
                    return res.status(500).json({ error: 'Failed to update uniform details' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Uniform not found' });
                }

                res.status(200).json({ message: 'Uniform details updated successfully' });
            }
        );
    });




module.exports = router;