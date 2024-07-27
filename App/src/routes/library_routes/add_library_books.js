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

module.exports = router;
