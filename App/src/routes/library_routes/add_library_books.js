const express = require('express');
const router = express.Router();

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
        description
    } = req.body;

    const query = `UPDATE library_book_details
                   SET book_name = ?, book_author = ?, book_publication = ?, book_price = ?, ordered_quantity = ?, description = ?
                   WHERE bookID = ?`;

    const values = [book_name, book_author, book_publication, book_price, ordered_quantity, description, bookId];

    req.connectionPool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating book:', err);
            return res.status(500).json({ error: 'Error updating book' });
        }
        res.status(200).json({ message: 'Book updated successfully' });
    });
});


module.exports = router;
