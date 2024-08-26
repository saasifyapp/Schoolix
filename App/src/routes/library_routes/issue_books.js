const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed


// Use the connection manager middleware
router.use(connectionManager);


// Fetch Book and Member Details Endpoint
router.post('/library/get_details', (req, res) => {
    const { studentEnrollmentNo, bookEnrollmentNo } = req.body;

    const memberQuery = `SELECT member_name, member_class, member_contact, books_issued FROM library_member_details WHERE memberID = ?`;
    const bookQuery = `SELECT book_name, book_author, book_publication, available_quantity FROM library_book_details WHERE bookID = ?`;
    const transactionQuery = `SELECT * FROM library_transactions WHERE memberID = ? AND bookID = ?`;

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
                        book_author: book.book_author,
                        book_publication: book.book_publication
                    }
                };
            }

            // Check if the member already has this book issued
            req.connectionPool.query(transactionQuery, [studentEnrollmentNo, bookEnrollmentNo], (err, transactionResult) => {
                if (err) {
                    console.error('Error fetching transaction details:', err);
                    return res.status(500).json({ error: 'Error fetching transaction details' });
                }

                if (transactionResult.length > 0) {
                    return res.status(400).json({
                        error: 'Book already issued to this member',
                        details: {
                            studentEnrollmentNo,
                            member_name: member.member_name,
                            member_class: member.member_class,
                            bookEnrollmentNo,
                            book_name: book.book_name,
                            book_author: book.book_author
                        }
                    });
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
                            memberID: studentEnrollmentNo,
                            member_name: member.member_name,
                            member_class: member.member_class,
                            member_contact: member.member_contact,
                            books_issued: member.books_issued
                        },
                        book: {
                            bookID: bookEnrollmentNo,
                            book_name: book.book_name,
                            book_author: book.book_author,
                            book_publication: book.book_publication,
                            available_quantity: book.available_quantity
                        }
                    });
                }
            });
        });
    });
});


// Issue Book Endpoint
router.post('/library/issue_book', (req, res) => {
    const {
        memberID,
        member_name,
        member_class,
        member_contact,
        bookID,
        book_name,
        book_author,
        book_publication,
        issue_date,
        return_date
    } = req.body;

    const issueBookQuery = `INSERT INTO library_transactions 
                            (memberID, member_name, member_class, member_contact, bookID, book_name, book_author, book_publication, issue_date, return_date) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const updateMemberQuery = `UPDATE library_member_details 
                               SET books_issued = books_issued + 1 
                               WHERE memberID = ?`;

    const updateBookQuery = `UPDATE library_book_details 
                             SET available_quantity = available_quantity - 1 
                             WHERE bookID = ?`;

    const logTransactionQuery = `INSERT INTO library_transaction_log 
                                 (transaction_type, memberID, bookID, transaction_date) 
                                 VALUES ('issue', ?, ?, ?)`;

    // Insert the issue details
    req.connectionPool.query(issueBookQuery, [
        memberID,
        member_name,
        member_class,
        member_contact,
        bookID,
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
        req.connectionPool.query(updateMemberQuery, [memberID], (err, memberResult) => {
            if (err) {
                console.error('Error updating member details:', err);
                return res.status(500).json({ error: 'Error updating member details' });
            }

            // Update the book's available_quantity
            req.connectionPool.query(updateBookQuery, [bookID], (err, bookResult) => {
                if (err) {
                    console.error('Error updating book details:', err);
                    return res.status(500).json({ error: 'Error updating book details' });
                }

                // Log the transaction
                req.connectionPool.query(logTransactionQuery, [memberID, bookID, issue_date], (err, logResult) => {
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

// Endpoint to fetch library settings
router.get('/settings', (req, res) => {
    // Get username from cookie
    const username = req.cookies.username; // Assuming you are using cookie-parser middleware

    if (!username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const query = `SELECT library_interval, library_penalty FROM user_details WHERE LoginName = ?`;

    // Use connection_auth to query the master database (to get details from Demo Database >> User_details)
    connection_auth.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching settings:', err);
            return res.status(500).json({ error: 'Error fetching settings' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Settings not found' });
        }

        res.json(results[0]);
    });
});

// Assuming you have already set up Express and a connection pool
router.post('/update-settings', (req, res) => {
    const { username, bookReturnInterval, penaltyInterval } = req.body;

    // Explicitly check for undefined or null values
    if (username === undefined || username === null ||
        bookReturnInterval === undefined || bookReturnInterval === null ||
        penaltyInterval === undefined || penaltyInterval === null) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `UPDATE user_details SET 
                   library_interval = ?, 
                   library_penalty = ? 
                   WHERE LoginName = ?`;

    // Use connection_auth to query the master database
    connection_auth.query(query, [bookReturnInterval, penaltyInterval, username], (err, result) => {
        if (err) {
            console.error('Error updating settings:', err);
            return res.status(500).json({ error: 'Error updating settings' });
        }
        res.status(200).json({ message: 'Settings updated successfully' });
    });
});


module.exports = router;