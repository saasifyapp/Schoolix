const express = require('express');
const router = express.Router();


const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Fetch Penalties Endpoint
router.post('/library/get_penalties', (req, res) => {
    const getPenaltiesQuery = `
        SELECT 
            lt.id,
            lt.memberID, 
            lt.member_name,
            lt.member_contact, 
            lt.bookID, 
            lt.book_name, 
            lt.return_date, 
            DATEDIFF(CURDATE(), lt.return_date) * 10 AS penalty_amount
            
        FROM 
            library_transactions lt
        WHERE 
            lt.return_date < CURDATE();
    `;

    req.connectionPool.query(getPenaltiesQuery, (err, penaltyResult) => {
        if (err) {
            console.error('Error fetching penalties:', err);
            return res.status(500).json({ error: 'Error fetching penalties' });
        }

        return res.status(200).json({ penalties: penaltyResult });
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

module.exports = router;