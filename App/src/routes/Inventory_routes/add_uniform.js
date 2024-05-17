const express = require('express');
const router = express.Router();

 
// Endpoint to handle adding uniform items
router.post('/inventory/purchase/add_uniforms', (req, res) => {
    const { uniform_item, size_of_item, purchase_price, selling_price, vendor, ordered_quantity } = req.body;

    const remaining_quantity = ordered_quantity;

    const sql = `INSERT INTO inventory_uniform_details (uniform_item, size_of_item, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    connection.query(sql, [uniform_item, size_of_item, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity], (err, result) => {
        if (err) {
            console.error('Error adding uniform item:', err);
            res.status(500).json({ error: 'Error adding uniform item' });
        } else {
            console.log('Uniform item added successfully');
            res.status(200).json({ message: 'Uniform item added successfully' });
        }
    });
});

// Endpoint to fetch all uniform items
router.get('/inventory/uniforms', (req, res) => {
    const sql = 'SELECT * FROM inventory_uniform_details';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching uniform items:', err);
            res.status(500).json({ error: 'Error fetching uniform items' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to delete a uniform item
 router.delete('/inventory/uniforms/:uniformItem', (req, res) => {
    const { uniformItem } = req.params;
    const sql = 'DELETE FROM inventory_uniform_details WHERE uniform_item = ?';

    connection.query(sql, [uniformItem], (err, result) => {
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
router.route('/inventory/uniforms/:uniformItem/quantity')
    .get((req, res) => {
        const uniformItem = req.params.uniformItem;
        const sql = 'SELECT ordered_quantity, remaining_quantity FROM inventory_uniform_details WHERE uniform_item = ?';
        connection.query(sql, [uniformItem], (err, result) => {
            if (err) {
                console.error('Error fetching quantity:', err);
                res.status(500).json({ error: 'Error fetching quantity' });
            } else {
                if (result.length === 0) {
                    res.status(404).json({ error: 'Uniform item not found' });
                } else {
                    const { ordered_quantity, remaining_quantity } = result[0]; // fetch remaining_quantity from result
                    res.status(200).json({ ordered_quantity, remaining_quantity });
                    console.log(result)
                }
            }
        });
    })
    .put((req, res) => {
        const uniformItem = req.params.uniformItem;
        const totalOrder = req.body.total_order; // Get the total order from the request body
        const newRemainingQuantity = req.body.remaining_quantity; // Get the new remaining quantity from the request body
    
        const sql = 'UPDATE inventory_uniform_details SET ordered_quantity = ?, remaining_quantity = ? WHERE uniform_item = ?';
        connection.query(sql, [totalOrder, newRemainingQuantity, uniformItem], (err, result) => { // Include newRemainingQuantity in the query
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


/*

// Endpoint to fetch a single uniform item by name
router.get('/inventory/uniforms/:uniformItem', (req, res) => {
    const { uniformItem } = req.params;
    const sql = 'SELECT * FROM inventory_uniform_details WHERE uniform_item = ?';

    connection.query(sql, [uniformItem], (err, result) => {
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

    connection.query(sql, [size_of_item, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity, uniform_item], (err, result) => {
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



module.exports = router;