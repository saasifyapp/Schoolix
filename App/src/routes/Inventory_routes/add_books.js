const express = require('express');
const router = express.Router();
const mysql = require('mysql');


// Define dbCredentials and connection outside the endpoint
let dbCredentials;
let connection;

// Middleware to set dbCredentials and create the connection pool if it doesn't exist
router.use((req, res, next) => {
    dbCredentials = req.session.dbCredentials;
        connection = mysql.createPool({
            host: dbCredentials.host,
            user: dbCredentials.user,
            password: dbCredentials.password,
            database: dbCredentials.database
        });
    
    next();
});

// Fetching book data endpoint
router.get('/inventory/books_vendor', (req, res) => {
    const sql = 'SELECT vendor_name FROM inventory_vendor_details WHERE vendorFor = "Books"';
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching books:', err);
            res.status(500).json({ error: 'Error fetching books' });
        } else {
            res.status(200).json(result);
            
        }
    });
});

router.post('/inventory/purchase/add_books', (req, res) => {

    
    const { title, class_of_title, purchase_price, selling_price, vendor, ordered_quantity } = req.body;

    const remaining_quantity = ordered_quantity;
    const returned_quantity = 0;

    // Check if title already exists
    const checkSql = 'SELECT * FROM inventory_book_details WHERE title = ?';
    connection.query(checkSql, [title], (err, result) => {
        if (err) {
            console.error('Error checking book:', err);
            res.status(500).send("Error checking book");
        } else {
            // If title already exists, return a message to the client
            if (result.length > 0) {
                res.status(400).send('Book title already exists');
            } else {
                // If title does not exist, proceed with insertion
                const sql = 'INSERT INTO inventory_book_details (title, class_of_title, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity, returned_quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                connection.query(sql, [title, class_of_title, purchase_price, selling_price, vendor, ordered_quantity, remaining_quantity, returned_quantity], (err, result) => {
                    if (err) {
                        console.error('Error adding books:', err);
                        res.status(500).send("Error adding books");
                    } else {
                        console.log('Books added successfully');
                        res.status(200).send('Books added successfully');
                    }
                });
            }
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

// Define the route to fetch and update book details
router.route('/inventory/books/:sr_no')
    .get((req, res) => {
        const sr_no = req.params.sr_no;
        const sql = 'SELECT title, class_of_title, purchase_price, selling_price FROM inventory_book_details WHERE sr_no = ?';

        connection.query(sql, [sr_no], (err, result) => {
            if (err) {
                console.error('Error fetching book details:', err);
                return res.status(500).json({ error: 'Failed to fetch book details' });
            }
            if (result.length === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }
            res.status(200).json(result[0]);
        });
    })
    .put((req, res) => {
        const sr_no = req.params.sr_no;
        const { newTitle, class_of_title, purchase_price, selling_price } = req.body;

        if (!newTitle || !class_of_title || !purchase_price || !selling_price) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const sql = `
            UPDATE inventory_book_details 
            SET title = ?, class_of_title = ?, purchase_price = ?, selling_price = ?
            WHERE sr_no = ?;
        `;

        connection.query(sql, [newTitle, class_of_title, purchase_price, selling_price, sr_no], (err, result) => {
            if (err) {
                console.error('Error updating book details:', err);
                return res.status(500).json({ error: 'Failed to update book details' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }

            res.status(200).json({ message: 'Book details updated successfully' });
        });
    });


module.exports = router;