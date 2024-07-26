const express = require('express');
const router = express.Router();

// Fetch Book and Member Details Endpoint
router.post('/library/get_details', (req, res) => {
    const { studentEnrollmentNo, bookEnrollmentNo } = req.body;

    const memberQuery = `SELECT member_name, member_class, member_contact, books_issued FROM library_member_details WHERE enrollment_number = ?`;
    const bookQuery = `SELECT book_name, author_name, book_publication, available_quantity FROM library_book_details WHERE book_number = ?`;

    req.connectionPool.query(memberQuery, [studentEnrollmentNo], (err, memberResult) => {
        if (err) {
            console.error('Error fetching member details:', err);
            return res.status(500).json({ error: 'Error fetching member details' });
        }

        if (memberResult.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const member = memberResult[0];
        let memberError = null;

        if (member.books_issued >= 3) {
            memberError = {
                error: 'Maximum books issued to this student',
                details: {
                    studentEnrollmentNo,
                    member_name: member.member_name,
                    member_class: member.member_class
                }
            };
        }

        req.connectionPool.query(bookQuery, [bookEnrollmentNo], (err, bookResult) => {
            if (err) {
                console.error('Error fetching book details:', err);
                return res.status(500).json({ error: 'Error fetching book details' });
            }

            if (bookResult.length === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }

            const book = bookResult[0];
            let bookError = null;

            if (book.available_quantity < 1) {
                bookError = {
                    error: 'Book currently unavailable!',
                    details: {
                        bookEnrollmentNo,
                        book_name: book.book_name,
                        author_name: book.author_name,
                        book_publication: book.book_publication
                    }
                };
            }

            if (memberError && bookError) {
                return res.status(400).json({
                    error: 'Multiple issues found',
                    memberError,
                    bookError
                });
            } else if (memberError) {
                return res.status(400).json(memberError);
            } else if (bookError) {
                return res.status(400).json(bookError);
            } else {
                res.status(200).json({
                    member: {
                        member_name: member.member_name,
                        member_class: member.member_class,
                        member_contact: member.member_contact
                    },
                    book: {
                        book_name: book.book_name,
                        author_name: book.author_name,
                        book_publication: book.book_publication
                    }
                });
            }
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

    const issueBookQuery = `INSERT INTO library_transactions 
                            (enrollment_number, member_name, member_class, member_contact, book_number, book_name, book_author, book_publication, issue_date, return_date) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const updateMemberQuery = `UPDATE library_member_details 
                               SET books_issued = books_issued + 1 
                               WHERE enrollment_number = ?`;

    const updateBookQuery = `UPDATE library_book_details 
                             SET available_quantity = available_quantity - 1 
                             WHERE book_number = ?`;

    const logTransactionQuery = `INSERT INTO library_transaction_log 
                                 (transaction_type, enrollment_number, book_number, transaction_date, status) 
                                 VALUES ('issue', ?, ?, ?, 'completed')`;

    // Insert the issue details
    req.connectionPool.query(issueBookQuery, [
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

        // Update the member's books_issued count
        req.connectionPool.query(updateMemberQuery, [enrollment_number], (err, memberResult) => {
            if (err) {
                console.error('Error updating member details:', err);
                return res.status(500).json({ error: 'Error updating member details' });
            }

            // Update the book's available_quantity
            req.connectionPool.query(updateBookQuery, [book_number], (err, bookResult) => {
                if (err) {
                    console.error('Error updating book details:', err);
                    return res.status(500).json({ error: 'Error updating book details' });
                }

                // Log the transaction
                req.connectionPool.query(logTransactionQuery, [enrollment_number, book_number, issue_date], (err, logResult) => {
                    if (err) {
                        console.error('Error logging transaction:', err);
                        return res.status(500).json({ error: 'Error logging transaction' });
                    }

                    res.status(201).json({ message: 'Book issued successfully', issueId: result.insertId });
                });
            });
        });
    });
});


module.exports = router;