const express = require('express');
const router = express.Router();

// Fetching book data endpoint
router.get('/inventory/books_vendor', (req, res) => {
    const sql = 'SELECT vendor_name FROM inventory_vendor_details WHERE vendorFor = "Books"';
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching books:', err);
            res.status(500).json({ error: 'Error fetching books' });
        } else {
            res.status(200).json(result);
            console.log(result)
            
        }
    });
});

router.post('/inventory/purchase/add_books', (req, res) => {
    // Extract data from the request body
    const { title, class_of_title, purchase_price, selling_price, vendor, ordered_quantity } = req.body;
    
    // Set ordered_quantity as remaining_quantity
    const remaining_quantity = ordered_quantity;

    const returned_quantity = 0;

    // Insert data into the database
    const sql = 'INSERT INTO inventory_book_details (title, class_of_title, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity, returned_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [title, class_of_title, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity, returned_quantity], (err, result) => {
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

 
// Endpoint to handle both GET and PUT requests for retrieving and updating ordered quantity of a book
router.route('/inventory/books/:title/quantity')
    .get((req, res) => {
        const title = req.params.title;
        const sql = 'SELECT ordered_quantity, remaining_quantity, class_of_title, returned_quantity FROM inventory_book_details WHERE title = ?';
        connection.query(sql, [title], (err, result) => {
            if (err) {
                console.error('Error fetching quantity:', err);
                res.status(500).json({ error: 'Error fetching quantity' });
            } else {
                if (result.length === 0) {
                    res.status(404).json({ error: 'Book not found' });
                } else {
                    const { ordered_quantity, remaining_quantity, class_of_title, returned_quantity } = result[0];
                    res.status(200).json({ ordered_quantity, remaining_quantity, class_of_title, returned_quantity });
                }
            }
        });
    })
    .put((req, res) => {
        const title = req.params.title;
        const newOrderedQuantity = req.body.total_order; // Get the new ordered quantity from the request body
        const newRemainingQuantity = req.body.remaining_quantity; // Get the new remaining quantity from the request body

        console.log(newOrderedQuantity, newRemainingQuantity )
        
        const sql = 'UPDATE inventory_book_details SET ordered_quantity = ?, remaining_quantity = ? WHERE title = ?';
        connection.query(sql, [newOrderedQuantity, newRemainingQuantity, title], (err, result) => {
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



// Endpoint to handle PUT requests for updating returned and remaining quantities of a book
router.route('/inventory/return_books/:title/quantity')
.put((req, res) => {
    const title = req.params.title;
    const returnedQuantity = req.body.returnedQuantity; // Get the returned quantity from the request body
    const remainingQuantity = req.body.remainingQuantity; // Get the new remaining quantity from the request body

    console.log(returnedQuantity, remainingQuantity )
    
    const sql = 'UPDATE inventory_book_details SET returned_quantity = ?, remaining_quantity = ? WHERE title = ?';
    connection.query(sql, [returnedQuantity, remainingQuantity, title], (err, result) => {
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

// Add a new endpoint to handle search queries (Books)
router.get("/inventory/books/search", (req, res) => {
    const searchQuery = req.query.search.trim(); // Get the search query from request URL query parameters

    // Construct the SQL query to filter based on the student name
    let query = `SELECT * FROM inventory_book_details WHERE title LIKE ?`;

    // Execute the SQL query
    connection.query(query, [`%${searchQuery}%`], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });


});

module.exports = router;