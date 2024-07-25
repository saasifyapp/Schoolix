const express = require('express');
const router = express.Router();

// Add Book Endpoint
router.post('/library/add_book', (req, res) => {
    const { book_name, author_name, book_publication, book_purchase_date, book_price, book_quantity, book_number } = req.body;

    const query = `INSERT INTO Library_book_details 
                   (book_name, author_name, book_publication, book_purchase_date, book_price, book_quantity, book_number) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    req.connectionPool.query(query, [book_name, author_name, book_publication, book_purchase_date, book_price, book_quantity, book_number], (err, result) => {
        if (err) {
            console.error('Error adding book:', err);
            return res.status(500).json({ error: 'Error adding book' });
        }
        res.status(201).json({ message: 'Book added successfully', bookId: result.insertId });
    });
});

// Display All Books
router.get('/library/books', (req, res) => {
    const query = `SELECT * FROM Library_book_details`;

    req.connectionPool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).json({ error: 'Error fetching books' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;