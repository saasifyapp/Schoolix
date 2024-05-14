const express = require('express');
const router = express.Router();


router.post('/inventory/purchase/add_vendor', (req, res) => {
    const { vendorName, amountPaid } = req.body;
    const netPayable = req.body.netPayable || 0;
    const balance = req.body.balance || 0;

    const sql = 'INSERT INTO inventory_vendor_details (vendor_name, net_payable, paid_till_now, balance) VALUES (?, ?, ?, ?)';
    connection.query(sql, [vendorName, netPayable, amountPaid, balance], (err, result) => {
        if (err) {
            console.error('Error adding vendor:', err);
            res.status(500).send("Error adding vendor");
        } else {
            console.log('Vendor added successfully');
            res.status(200).send('Vendor added successfully');
        }
    });
});

// Fetching data endpoint
router.get('/inventory/vendors', (req, res) => {
    const sql = 'SELECT * FROM inventory_vendor_details';
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching vendors:', err);
            res.status(500).send("Error fetching vendors");
        } else {
            res.status(200).json(result);
        }
    });
});

// Deleting data endpoint
router.delete('/inventory/vendors/:vendorName', (req, res) => {
    const vendorName = req.params.vendorName;
    const sql = 'DELETE FROM inventory_vendor_details WHERE vendor_name = ?';
    
    connection.query(sql, [vendorName], (err, result) => {
        if (err) {
            console.error('Error deleting vendor:', err);
            res.status(500).send("Error deleting vendor");
        } else {
            console.log('Vendor deleted successfully');
            res.status(200).send("Vendor deleted successfully");
        }
    });
});






























module.exports = router;