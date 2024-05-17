const express = require('express');
const router = express.Router();


router.post('/inventory/purchase/add_vendor', (req, res) => {
    
    const { vendorName, amountPaid, vendorFor } = req.body;


    const netPayable = req.body.netPayable || 0;
    const balance = req.body.balance || 0;
    const vendorType = req.body.vendorFor;

    const sql = 'INSERT INTO inventory_vendor_details (vendor_name ,net_payable, paid_till_now, balance, vendorFor) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [vendorName, netPayable, amountPaid, balance, vendorType], (err, result) => {
        if (err) {
            console.error('Error adding vendor:', err);
            res.status(500).send("Error adding vendor");
        } else {
            console.log('Vendor added successfully');
            res.status(200).send('Vendor added successfully');
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
 
// Calculate net_payable and update it to vendor table //

router.get('/inventory/vendors', (req, res) => {
    const sqlQuery = `
        SELECT 
            v.vendor_name,
            COALESCE(SUM(b.purchase_price * b.ordered_quantity), 0) + COALESCE(SUM(u.purchase_price * u.ordered_quantity), 0) AS net_payable,
            v.paid_till_now,
            COALESCE(SUM(b.purchase_price * b.ordered_quantity), 0) + COALESCE(SUM(u.purchase_price * u.ordered_quantity), 0) - v.paid_till_now AS balance
        FROM 
            inventory_vendor_details v
        LEFT JOIN
            inventory_book_details b
        ON
            v.vendor_name = b.vendor
        LEFT JOIN
            inventory_uniform_details u
        ON
            v.vendor_name = u.vendor
        GROUP BY 
            v.vendor_name;
    `;

    // Execute the SQL query to calculate net_payable and balance, and update vendor table
    connection.query(sqlQuery, (err, result) => {
        if (err) {
            res.status(500).send("Error executing SQL query");
        } else {
            // Update net_payable and balance in vendor table
            result.forEach(row => {
                const updateSql = `UPDATE inventory_vendor_details SET net_payable = ${row.net_payable}, balance = ${row.balance} WHERE vendor_name= '${row.vendor_name}'`;
                connection.query(updateSql, (err, updateResult) => {
                    if (err) {
                        // Do nothing
                    }
                });
            });

            // Fetch vendor details after updating
            const fetchVendorsSql = 'SELECT * FROM inventory_vendor_details';
            connection.query(fetchVendorsSql, (err, vendorsResult) => {
                if (err) {
                    res.status(500).send("Error fetching vendors");
                } else {
                    res.status(200).json(vendorsResult);
                }
            });
        }
    });
});

module.exports = router;