const express = require('express');
const router = express.Router();

// Fetch Book and Member Details Endpoint
router.post('/library/get_details', (req, res) => {
    const { studentEnrollmentNo, bookEnrollmentNo } = req.body;

    const memberQuery = `SELECT member_name, member_class, member_contact FROM library_member_details WHERE enrollment_number = ?`;
    const bookQuery = `SELECT book_name, author_name, book_publication FROM library_book_details WHERE book_number = ?`;

    req.connectionPool.query(memberQuery, [studentEnrollmentNo], (err, memberResult) => {
        if (err) {
            console.error('Error fetching member details:', err);
            return res.status(500).json({ error: 'Error fetching member details' });
        }

        req.connectionPool.query(bookQuery, [bookEnrollmentNo], (err, bookResult) => {
            if (err) {
                console.error('Error fetching book details:', err);
                return res.status(500).json({ error: 'Error fetching book details' });
            }

            if (memberResult.length === 0 || bookResult.length === 0) {
                return res.status(404).json({ error: 'Member or Book not found' });
            }

            res.status(200).json({
                member: memberResult[0],
                book: bookResult[0]
            });
        });
    });
});


// Issue Book Endpoint
router.post('/library/issue_book', (req, res) => {
    const {
        enrollment_number,
        member_name,
        member_class,
        member_contact,
        book_number,
        book_name,
        book_author,
        book_publication,
        issue_date,
        return_date
    } = req.body;

    const query = `INSERT INTO library_issue_details 
                   (enrollment_number, member_name, member_class, member_contact, book_number, book_name, book_author, book_publication, issue_date, return_date) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    req.connectionPool.query(query, [
        enrollment_number,
        member_name,
        member_class,
        member_contact,
        book_number,
        book_name,
        book_author,
        book_publication,
        issue_date,
        return_date
    ], (err, result) => {
        if (err) {
            console.error('Error issuing book:', err);
            return res.status(500).json({ error: 'Error issuing book' });
        }
        res.status(201).json({ message: 'Book issued successfully', issueId: result.insertId });
    });
});


module.exports = router;