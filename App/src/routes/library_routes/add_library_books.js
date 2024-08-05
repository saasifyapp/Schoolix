const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Add Book Endpoint
router.post('/library/add_book', (req, res) => {
    const { bookID, book_name, book_author, book_publication, book_price, ordered_quantity, description } = req.body;

    const query = `INSERT INTO library_book_details 
                   (bookID, book_name, book_author, book_publication, book_price, ordered_quantity, description, available_quantity) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    req.connectionPool.query(query, [bookID, book_name, book_author, book_publication, book_price, ordered_quantity, description, ordered_quantity], (err, result) => {
        if (err) {
            console.error('Error adding book:', err);
            return res.status(500).json({ error: 'Error adding book' });
        }
        res.status(201).json({ message: 'Book added successfully', bookId: result.insertId });
    });
});


// Display All Books
router.get('/library/books', (req, res) => {
    const query = `SELECT * FROM library_book_details`;

    req.connectionPool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).json({ error: 'Error fetching books' });
        }
        res.status(200).json(results);
    });
});

// Delete Book Endpoint
router.delete('/library/book/:bookID', (req, res) => {
    const bookId = req.params.bookID;

    const query = `DELETE FROM library_book_details WHERE bookID = ?`;

    req.connectionPool.query(query, [bookId], (err, result) => {
        if (err) {
            console.error('Error deleting book:', err);
            return res.status(500).json({ error: 'Error deleting book' });
        }
        res.status(200).json({ message: 'Book deleted successfully' });
    });
});

// Retrieve Book Info Endpoint
router.get('/library/book/:bookID', (req, res) => {
    const bookId = req.params.bookID;

    const query = `SELECT * FROM library_book_details WHERE bookID = ?`;

    req.connectionPool.query(query, [bookId], (err, result) => {
        if (err) {
            console.error('Error retrieving book details:', err);
            return res.status(500).json({ error: 'Error retrieving book details' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.status(200).json(result[0]);
    });
});

// Update Book Endpoint
router.put('/library/book/:bookID', (req, res) => {
    const bookId = req.params.bookID;
    const {
        book_name,
        book_author,
        book_publication,
        book_price,
        ordered_quantity,
        new_ordered_quantity,
        description
    } = req.body;

    // Query to fetch the current available quantity
    const fetchAvailableQuantityQuery = `SELECT available_quantity FROM library_book_details WHERE bookID = ?`;

    // First, fetch the current available quantity
    req.connectionPool.query(fetchAvailableQuantityQuery, [bookId], (err, result) => {
        if (err) {
            console.error('Error fetching available quantity:', err);
            return res.status(500).json({ error: 'Error fetching available quantity' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const currentAvailableQuantity = result[0].available_quantity || 0;
        const newAvailableQuantity = currentAvailableQuantity + new_ordered_quantity;

        // Query to update the book details
        const updateBookQuery = `UPDATE library_book_details
                                 SET book_name = ?, book_author = ?, book_publication = ?, book_price = ?, ordered_quantity = ?, description = ?, available_quantity = ?
                                 WHERE bookID = ?`;

        const values = [book_name, book_author, book_publication, book_price, ordered_quantity, description, newAvailableQuantity, bookId];

        // Update the book details along with the new available quantity
        req.connectionPool.query(updateBookQuery, values, (err, result) => {
            if (err) {
                console.error('Error updating book:', err);
                return res.status(500).json({ error: 'Error updating book' });
            }
            res.status(200).json({ message: 'Book updated successfully' });
        });
    });
});

// Search Library Books Endpoint
router.get('/library/books/search', (req, res) => {
    const searchTerm = req.query.search;

    const query = `
        SELECT * FROM library_book_details
        WHERE bookID LIKE ? OR book_name LIKE ?
    `;

    const values = [`%${searchTerm}%`, `%${searchTerm}%`];

    req.connectionPool.query(query, values, (err, results) => {
        if (err) {
            console.error('Error searching books:', err);
            return res.status(500).json({ error: 'Error searching books' });
        }
        res.status(200).json(results);
    });
});


module.exports = router;
