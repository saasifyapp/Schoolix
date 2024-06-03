const express = require('express');
const router = express.Router();

// Get data for invoice display// Get data for invoice display
router.get('/inventory/invoices', (req, res) => {
    const query = `SELECT 
                    invoiceNo, 
                    billDate, 
                    buyerName, 
                    buyerPhone, 
                    class_of_buyer, 
                    total_payable, 
                    paid_amount, 
                    balance_amount, 
                    mode_of_payment 
                   FROM inventory_invoice_details`;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching invoice data: ' + err.stack);
            return res.status(500).json({ error: 'Error fetching invoice data' });
        }
        res.json(results);
    });
});


module.exports = router;