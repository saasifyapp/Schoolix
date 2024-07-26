const express = require('express');
const router = express.Router();

// Search Transactions Endpoint
router.post('/library/search_transactions', (req, res) => {
    const { searchInput } = req.body;

    const issueQuery = `SELECT transaction_id, enrollment_number, book_number, transaction_date, status FROM library_transaction_log WHERE transaction_type = 'issue' AND (enrollment_number = ? OR book_number = ?)`;
    const returnQuery = `SELECT transaction_id, enrollment_number, book_number, transaction_date, status FROM library_transaction_log WHERE transaction_type = 'return' AND (enrollment_number = ? OR book_number = ?)`;

    req.connectionPool.query(issueQuery, [searchInput, searchInput], (err, issueResult) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching issue transactions' });
        }

        req.connectionPool.query(returnQuery, [searchInput, searchInput], (err, returnResult) => {
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

module.exports = router;