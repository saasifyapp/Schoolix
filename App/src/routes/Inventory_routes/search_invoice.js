const express = require('express');
const router = express.Router();

// Get data for invoice display
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

// Get data for search invoice 
router.get('/inventory/searchinvoices', (req, res) => {
    const searchQuery = req.query.search?.trim(); // Get optional search term

    let query = `SELECT * FROM inventory_invoice_details WHERE 1 = 1`;

    if (req.query.invoiceNo) {
        // Search by invoice number
        const escapedQuery = connection.escape(req.query.invoiceNo + '%');
        query += ` AND invoiceNo LIKE ${escapedQuery}`;
    } else if (searchQuery) {
        // Search by buyer name (if invoiceNo is not present)
        const escapedQuery = connection.escape('%' + searchQuery + '%');
        query += ` AND (invoiceNo LIKE ${escapedQuery} OR buyerName LIKE ${escapedQuery})`;
    }

    // Execute the SQL query with parameters
    connection.query(query, (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });
});

router.delete("/inventory/deleteInvoice", (req, res) => {

    const invoiceNo = req.query.name;

    // SQL queries to delete related items first, then the invoice
    const deleteItemsQuery = `DELETE FROM inventory_invoice_items WHERE invoiceNo = ?`;
    const deleteInvoiceQuery = `DELETE FROM inventory_invoice_details WHERE invoiceNo = ? LIMIT 1`;


    // Delete related items
    connection.query(deleteItemsQuery, [invoiceNo], (err, result) => {
        if (err) {
            console.error("Error deleting invoice items:", err);
            res.status(500).send("Error deleting invoice items");
            return;
        }

        // Delete the invoice
        connection.query(deleteInvoiceQuery, [invoiceNo], (err, result) => {
            if (err) {

                console.error("Error deleting invoice:", err);
                res.status(500).send("Error deleting invoice");

            }

            if (result.affectedRows === 0) {
                res.status(404).send("Invoice not found");
            }
            res.status(200).send("Invoice deleted successfully");

        });
    });
});

// Update paid amount for an invoice
router.put('/inventory/updatePaidAmount', (req, res) => {
    const { invoiceNo, paidAmount, balanceAmount } = req.body;

    const query = `
        UPDATE inventory_invoice_details 
        SET paid_amount = ?, balance_amount = ? 
        WHERE invoiceNo = ?
    `;

    connection.query(query, [paidAmount, balanceAmount, invoiceNo], (err, result) => {
        if (err) {
            console.error('Error updating invoice:', err);
            return res.status(500).send('Error updating invoice');
        }
        res.status(200).send('Invoice updated successfully');
    });
});


module.exports = router;