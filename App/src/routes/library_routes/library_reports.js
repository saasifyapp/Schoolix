const express = require('express');
const router = express.Router();

// Fetch Report Data Endpoint
router.post('/library/get_report_data', (req, res) => {
    const { reportType } = req.body;
    let query = `
        SELECT 
            ltl.memberID,
            lmd.member_name,
            lmd.member_class,
            ltl.bookID,
            lbd.book_name,
            ltl.transaction_date,
            ltl.transaction_type,
            ltl.penalty_status,
            ltl.penalty_paid
        FROM 
            library_transaction_log ltl
        JOIN 
            library_member_details lmd ON ltl.memberID = lmd.memberID
        JOIN 
            library_book_details lbd ON ltl.bookID = lbd.bookID
    `;

    const queryParams = [];

    if (reportType) {
        if (reportType === 'issue') {
            query += ` WHERE ltl.transaction_type = 'issue'`;
        } else if (reportType === 'return') {
            query += ` WHERE ltl.transaction_type = 'return' AND ltl.penalty_status IS NULL`;
        } else if (reportType === 'penalty') {
            query += ` WHERE ltl.penalty_status IS NOT NULL`;
        }
    }

    req.connectionPool.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error fetching report data:', err);
            return res.status(500).json({ error: 'Error fetching report data' });
        }

        return res.status(200).json({ reports: results });
    });
});

module.exports = router;