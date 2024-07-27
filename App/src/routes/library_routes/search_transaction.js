const express = require('express');
const router = express.Router();

// Search Transactions Endpoint
router.post('/library/search_transactions', (req, res) => {
    const { searchInput } = req.body;

    const issueQuery = `SELECT transaction_id, memberID, bookID, transaction_date, status FROM library_transaction_log WHERE transaction_type = 'issue' AND (memberID LIKE ? OR bookID LIKE ?)`;
    const returnQuery = `SELECT transaction_id, memberID, bookID, transaction_date, status FROM library_transaction_log WHERE transaction_type = 'return' AND (memberID LIKE ? OR bookID LIKE ?)`;

    const searchPattern = `%${searchInput}%`;

    req.connectionPool.query(issueQuery, [searchPattern, searchPattern], (err, issueResult) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching issue transactions' });
        }

        req.connectionPool.query(returnQuery, [searchPattern, searchPattern], (err, returnResult) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching return transactions' });
            }

            return res.status(200).json({
                issueTransactions: issueResult,
                returnTransactions: returnResult
            });
        });
    });
});

// Delete Transaction Endpoint
router.post('/library/delete_transaction', (req, res) => {
    const { transactionId, transactionType } = req.body;

    const getTransactionQuery = `SELECT * FROM library_transaction_log WHERE transaction_id = ?`;
    const deleteFromLogQuery = `DELETE FROM library_transaction_log WHERE transaction_id = ?`;
    const deleteFromTransactionsQuery = `DELETE FROM library_transactions WHERE memberID = ? AND bookID = ? AND issue_date = ?`;
    const updateMemberQuery = `UPDATE library_member_details SET books_issued = books_issued + ? WHERE memberID = ?`;
    const updateBookQuery = `UPDATE library_book_details SET available_quantity = available_quantity + ? WHERE bookID = ?`;
    const getMemberDetailsQuery = `SELECT * FROM library_member_details WHERE memberID = ?`;
    const getBookDetailsQuery = `SELECT * FROM library_book_details WHERE bookID = ?`;
    const addToTransactionsQuery = `INSERT INTO library_transactions (memberID, member_name, member_class, member_contact, bookID, book_name, book_author, book_publication, issue_date, return_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const getReturnTransactionQuery = `SELECT * FROM library_transaction_log WHERE transaction_type = 'return' AND memberID = ? AND bookID = ?`;

    req.connectionPool.query(getTransactionQuery, [transactionId], (err, transactionResult) => {
        if (err) {
            console.error('Error fetching transaction:', err);
            return res.status(500).json({ error: 'Error fetching transaction' });
        }

        if (transactionResult.length === 0) {
            console.error('Transaction not found');
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const transaction = transactionResult[0];
        const enrollmentNumber = transaction.memberID;
        const bookNumber = transaction.bookID;
        const issueDate = transaction.transaction_date;
        const revertValue = transactionType === 'issue' ? -1 : 1;

        if (transactionType === 'issue') {
            // Check if there is a corresponding return transaction
            req.connectionPool.query(getReturnTransactionQuery, [enrollmentNumber, bookNumber], (err, returnResult) => {
                if (err) {
                    console.error('Error fetching return transaction:', err);
                    return res.status(500).json({ error: 'Error fetching return transaction' });
                }

                if (returnResult.length > 0) {
                    // Prevent deletion of issue transaction if return transaction exists
                    return res.status(400).json({ error: 'Cannot delete issue transaction. Please delete the corresponding return transaction first.' });
                }

                // Proceed with deletion of issue transaction
                deleteTransaction(req, res, transactionId, transactionType, enrollmentNumber, bookNumber, revertValue, issueDate, transaction);
            });
        } else {
            // Proceed with deletion of return transaction
            deleteTransaction(req, res, transactionId, transactionType, enrollmentNumber, bookNumber, revertValue, issueDate, transaction);
        }
    });
});

function deleteTransaction(req, res, transactionId, transactionType, enrollmentNumber, bookNumber, revertValue, issueDate, transaction) {
    const deleteFromLogQuery = `DELETE FROM library_transaction_log WHERE transaction_id = ?`;
    const deleteFromTransactionsQuery = `DELETE FROM library_transactions WHERE memberID = ? AND bookID = ? AND issue_date = ?`;
    const updateMemberQuery = `UPDATE library_member_details SET books_issued = books_issued + ? WHERE memberID = ?`;
    const updateBookQuery = `UPDATE library_book_details SET available_quantity = available_quantity + ? WHERE bookID = ?`;
    const getMemberDetailsQuery = `SELECT * FROM library_member_details WHERE memberID = ?`;
    const getBookDetailsQuery = `SELECT * FROM library_book_details WHERE bookID = ?`;
    const addToTransactionsQuery = `INSERT INTO library_transactions (memberID, member_name, member_class, member_contact, bookID, book_name, book_author, book_publication, issue_date, return_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    req.connectionPool.query(deleteFromLogQuery, [transactionId], (err) => {
        if (err) {
            console.error('Error deleting transaction from log:', err);
            return res.status(500).json({ error: 'Error deleting transaction from log' });
        }

        req.connectionPool.query(updateMemberQuery, [revertValue, enrollmentNumber], (err) => {
            if (err) {
                console.error('Error updating member details:', err);
                return res.status(500).json({ error: 'Error updating member details' });
            }

            req.connectionPool.query(updateBookQuery, [-revertValue, bookNumber], (err) => {
                if (err) {
                    console.error('Error updating book details:', err);
                    return res.status(500).json({ error: 'Error updating book details' });
                }

                if (transactionType === 'return') {
                    req.connectionPool.query(getMemberDetailsQuery, [enrollmentNumber], (err, memberResult) => {
                        if (err) {
                            console.error('Error fetching member details:', err);
                            return res.status(500).json({ error: 'Error fetching member details' });
                        }

                        if (memberResult.length === 0) {
                            console.error('Member not found');
                            return res.status(404).json({ error: 'Member not found' });
                        }

                        const member = memberResult[0];

                        req.connectionPool.query(getBookDetailsQuery, [bookNumber], (err, bookResult) => {
                            if (err) {
                                console.error('Error fetching book details:', err);
                                return res.status(500).json({ error: 'Error fetching book details' });
                            }

                            if (bookResult.length === 0) {
                                console.error('Book not found');
                                return res.status(404).json({ error: 'Book not found' });
                            }

                            const book = bookResult[0];
                            const issueDate = new Date(transaction.transaction_date);
                            const returnDate = new Date(issueDate);
                            returnDate.setDate(returnDate.getDate() + 5); 

                            req.connectionPool.query(addToTransactionsQuery, [
                                enrollmentNumber,
                                member.member_name,
                                member.member_class,
                                member.member_contact,
                                bookNumber,
                                book.book_name,
                                book.book_author,
                                book.book_publication,
                                issueDate,
                                returnDate
                            ], (err) => {
                                if (err) {
                                    console.error('Error adding transaction to transactions:', err);
                                    return res.status(500).json({ error: 'Error adding transaction to transactions' });
                                }

                                res.status(200).json({ message: 'Transaction reverted successfully' });
                            });
                        });
                    });
                } else {
                    req.connectionPool.query(deleteFromTransactionsQuery, [enrollmentNumber, bookNumber, issueDate], (err) => {
                        if (err) {
                            console.error('Error deleting transaction from transactions:', err);
                            return res.status(500).json({ error: 'Error deleting transaction from transactions' });
                        }

                        res.status(200).json({ message: 'Transaction reverted successfully' });
                    });
                }
            });
        });
    });
}

module.exports = router;