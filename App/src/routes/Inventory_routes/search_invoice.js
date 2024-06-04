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

    // Construct the SQL query to delete the student from the database
    const query = `DELETE FROM inventory_invoice_details WHERE invoiceNo = ? LIMIT 1`;

    // Execute the SQL query with the student's name as a parameter
    connection.query(query, [invoiceNo], (err, result) => {
        if (err) {
            console.error("Error deleting invocie:", err);
            res.status(500).send("Error deleting invoice");
            return;
        }
        if (result.affectedRows === 0) {
            // If no student was deleted (i.e., student not found), send a 404 response
            res.status(404).send("Invoice not found");
            return;
        }
        console.log("Student removed:", result);
        res.status(200).send("Invoice deleted successfully");
    });

});
  

module.exports = router;