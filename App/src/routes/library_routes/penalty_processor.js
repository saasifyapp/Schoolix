const express = require('express');
const router = express.Router();


const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed


// Use the connection manager middleware
router.use(connectionManager);


// Fetch Penalties Endpoint
router.post('/library/get_penalties', (req, res) => {
    // Get username from cookie
    const username = req.cookies.username; // Assuming you are using cookie-parser middleware

    if (!username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    // First, fetch the library settings
    const settingsQuery = `SELECT library_penalty FROM user_details WHERE LoginName = ?`;

    connection_auth.query(settingsQuery, [username], (err, settingsResult) => {
        if (err) {
            console.error('Error fetching settings:', err);
            return res.status(500).json({ error: 'Error fetching settings' });
        }

        if (settingsResult.length === 0) {
            return res.status(404).json({ error: 'Settings not found' });
        }

        const libraryPenalty = settingsResult[0].library_penalty;

        // Now, use the fetched library_penalty to calculate the penalties
        const getPenaltiesQuery = `
            SELECT 
                lt.id,
                lt.memberID, 
                lt.member_name,
                lt.member_contact, 
                lt.bookID, 
                lt.book_name, 
                lt.return_date, 
                DATEDIFF(CURDATE(), lt.return_date) * ? AS penalty_amount
            FROM 
                library_transactions lt
            WHERE 
                lt.return_date < CURDATE();
        `;

        req.connectionPool.query(getPenaltiesQuery, [libraryPenalty], (err, penaltyResult) => {
            if (err) {
                console.error('Error fetching penalties:', err);
                return res.status(500).json({ error: 'Error fetching penalties' });
            }

            return res.status(200).json({ penalties: penaltyResult });
        });
    });
});





const formatDateToIST = (date) => {
    const istDate = new Date(date);
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Pay Penalty Endpoint
router.post('/library/pay_penalty', (req, res) => {
    const { transactionID, penaltyAmount } = req.body;

    const getPenaltyQuery = `SELECT * FROM library_transactions WHERE id = ?`;
    const deletePenaltyQuery = `DELETE FROM library_transactions WHERE id = ?`;
    const updateMemberQuery = `UPDATE library_member_details SET books_issued = books_issued - 1 WHERE memberID = ?`;
    const updateBookQuery = `UPDATE library_book_details SET available_quantity = available_quantity + 1 WHERE bookID = ?`;
    const logPenaltyPaymentQuery = `INSERT INTO library_transaction_log (transaction_type, memberID, bookID, transaction_date, penalty_status, penalty_paid) VALUES ('return', ?, ?, ?, 'paid', ?)`;

    req.connectionPool.query(getPenaltyQuery, [transactionID], (err, penaltyResult) => {
        if (err) {
            console.error('Error fetching penalty details:', err);
            return res.status(500).json({ error: 'Error fetching penalty details' });
        }

        if (penaltyResult.length === 0) {
            console.error('Penalty record not found');
            return res.status(404).json({ error: 'Penalty record not found' });
        }

        const penalty = penaltyResult[0];
        
        req.connectionPool.query(deletePenaltyQuery, [transactionID], (err) => {
            if (err) {
                console.error('Error deleting penalty record:', err);
                return res.status(500).json({ error: 'Error deleting penalty record' });
            }

            req.connectionPool.query(updateMemberQuery, [penalty.memberID], (err) => {
                if (err) {
                    console.error('Error updating member details:', err);
                    return res.status(500).json({ error: 'Error updating member details' });
                }

                req.connectionPool.query(updateBookQuery, [penalty.bookID], (err) => {
                    if (err) {
                        console.error('Error updating book details:', err);
                        return res.status(500).json({ error: 'Error updating book details' });
                    }

                    const transactionDate = formatDateToIST(new Date());
                    req.connectionPool.query(logPenaltyPaymentQuery, [penalty.memberID, penalty.bookID, transactionDate, penaltyAmount], (err) => {
                        if (err) {
                            console.error('Error logging penalty payment:', err);
                            return res.status(500).json({ error: 'Error logging penalty payment' });
                        }

                        res.status(200).json({ message: 'Penalty paid successfully' });
                    });
                });
            });
        });
    });
});



// Fetch Book MRP Endpoint
router.post('/library/get_book_mrp', (req, res) => {
    const { bookID } = req.body;

    if (!bookID) {
        return res.status(400).json({ error: 'Missing book ID' });
    }

    const getBookMRPQuery = `
        SELECT sr_no, bookID, book_name, book_author, book_publication, book_price, ordered_quantity, description, available_quantity
        FROM library_book_details
        WHERE bookID = ?;
    `;

    req.connectionPool.query(getBookMRPQuery, [bookID], (err, bookResult) => {
        if (err) {
            console.error('Error fetching book details:', err);
            return res.status(500).json({ error: 'Error fetching book details' });
        }

        if (bookResult.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const bookMRP = bookResult[0].book_price;

        return res.status(200).json({ bookMRP });
    });
});


// Endpoint to mark book as lost and update transaction logs
router.post('/library/mark_lost', (req, res) => {
    const { transactionID, bookMRP } = req.body;

    const getPenaltyQuery = `SELECT * FROM library_transactions WHERE id = ?`;
    const deletePenaltyQuery = `DELETE FROM library_transactions WHERE id = ?`;
    const updateMemberQuery = `UPDATE library_member_details SET books_issued = books_issued - 1 WHERE memberID = ?`;
    const updateBookQuery = `UPDATE library_book_details SET ordered_quantity = ordered_quantity - 1 WHERE bookID = ?`;
    const logLostBookQuery = `
        INSERT INTO library_transaction_log (transaction_type, memberID, bookID, transaction_date, penalty_status, penalty_paid, book_lost) 
        VALUES ('lost', ?, ?, ?, 'paid', ?, 1)
    `;

    req.connectionPool.query(getPenaltyQuery, [transactionID], (err, penaltyResult) => {
        if (err) {
            console.error('Error fetching penalty details:', err);
            return res.status(500).json({ error: 'Error fetching penalty details' });
        }

        if (penaltyResult.length === 0) {
            console.error('Penalty record not found');
            return res.status(404).json({ error: 'Penalty record not found' });
        }

        const penalty = penaltyResult[0];
        
        req.connectionPool.query(deletePenaltyQuery, [transactionID], (err) => {
            if (err) {
                console.error('Error deleting penalty record:', err);
                return res.status(500).json({ error: 'Error deleting penalty record' });
            }

            req.connectionPool.query(updateMemberQuery, [penalty.memberID], (err) => {
                if (err) {
                    console.error('Error updating member details:', err);
                    return res.status(500).json({ error: 'Error updating member details' });
                }

                req.connectionPool.query(updateBookQuery, [penalty.bookID], (err) => {
                    if (err) {
                        console.error('Error updating book details:', err);
                        return res.status(500).json({ error: 'Error updating book details' });
                    }

                    const transactionDate = formatDateToIST(new Date()); // Define this function if not already defined

                    req.connectionPool.query(logLostBookQuery, [penalty.memberID, penalty.bookID, transactionDate, bookMRP], (err) => {
                        if (err) {
                            console.error('Error logging lost book markup:', err);
                            return res.status(500).json({ error: 'Error logging lost book markup' });
                        }

                        res.status(200).json({ success: true, message: 'The book has been marked as lost and penalty has been updated.' });
                    });
                });
            });
        });
    });
});

module.exports = router;