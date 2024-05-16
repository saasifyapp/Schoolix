const express = require('express');
const router = express.Router();


// Endpoint to handle form submission and insert data into the database
router.post('/inventory/purchase/add_books', (req, res) => {
    // Extract data from the request body
    const { title, class_of_title, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity } = req.body;
    console.log(req.body)
    // Insert data into the database
    const sql = 'INSERT INTO inventory_book_details (title, class_of_title, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [title, class_of_title, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity], (err, result) => {
        if (err) {
            console.error('Error adding books:', err);
            res.status(500).json({ error: 'Error adding books' });
        } else {
            console.log('Books added successfully');
            res.status(200).json({ message: 'Books added successfully' });
        }
    });
});

// Fetching book data endpoint
router.get('/inventory/books', (req, res) => {
    const sql = 'SELECT * FROM inventory_book_details';
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching books:', err);
            res.status(500).json({ error: 'Error fetching books' });
        } else {
            res.status(200).json(result);
        }
    });
});

// // Deleting book endpoint
 router.delete('/inventory/books/:title', (req, res) => {
     const title = req.params.title
     const sql = 'DELETE FROM inventory_book_details WHERE title = ?';
     connection.query(sql, [title], (err, result) => {
         if (err) {
             console.error('Error deleting book:', err);
             res.status(500).json({ error: 'Error deleting book' });
         } else {
             console.log('Book deleted successfully');
             res.status(200).json({ message: 'Book deleted successfully' });
         }
     });
 });

 // Update ordered quantity endpoint
router.put('/inventory/books/:title', (req, res) => {
    const title = req.params.title;
    const { orderedQuantity } = req.body;

    // Retrieve existing ordered quantity from the database
    const sqlSelect = 'SELECT ordered_quantity FROM inventory_book_details WHERE title = ?';
    connection.query(sqlSelect, [title], (err, rows) => {
        if (err) {
            console.error('Error retrieving existing ordered quantity:', err);
            return res.status(500).json({ error: 'Error retrieving existing ordered quantity' });
        }

        // Extract existing ordered quantity from the result
        const existingOrderedQuantity = rows[0].ordered_quantity;
        console.log(existingOrderedQuantity)

        // Calculate the new ordered quantity
        const newOrderedQuantity = existingOrderedQuantity + orderedQuantity;

        // Update the ordered quantity in the database
        const sqlUpdate = 'UPDATE inventory_book_details SET ordered_quantity = ? WHERE title = ?';
        connection.query(sqlUpdate, [newOrderedQuantity, title], (err, result) => {
            if (err) {
                console.error('Error updating ordered quantity:', err);
                res.status(500).json({ error: 'Error updating ordered quantity' });
            } else {
                console.log('Ordered quantity updated successfully');
                res.status(200).json({ message: 'Ordered quantity updated successfully' });
            }
        });
    });
});






module.exports = router;