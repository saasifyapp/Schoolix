const express = require('express');
const router = express.Router();


router.post('/inventory/purchase/add_vendor', (req, res) => {

    const { vendorName, amountPaid } = req.body;
    const netPayable = req.body.netPayable || 0;
    const balance = req.body.balance || 0;
    console.log(req.body)
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
            vendor,
            SUM(purchase_price * ordered_quantity) AS net_payable
        FROM 
            inventory_book_details
        GROUP BY 
            vendor;
    `;

    // Execute the SQL query to calculate net_payable and update vendor table
    connection.query(sqlQuery, (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            res.status(500).send("Error executing SQL query");
        } else {
            console.log('SQL Query Result:', result);

            // Update net_payable in vendor table
            result.forEach(row => {
                const updateSql = `UPDATE inventory_vendor_details SET net_payable = ${row.net_payable} WHERE vendor_name= '${row.vendor}'`;
                connection.query(updateSql, (err, updateResult) => {
                    if (err) {
                        console.error(`Error updating vendor ${row.vendor}:`, err);
                    } else {
                        console.log(`Net payable updated for vendor ${row.vendor}`);
                    }
                });
            });

            // Fetch vendor details after updating
            const fetchVendorsSql = 'SELECT * FROM inventory_vendor_details';
            connection.query(fetchVendorsSql, (err, vendorsResult) => {
                if (err) {
                    console.error('Error fetching vendors:', err);
                    res.status(500).send("Error fetching vendors");
                } else {
                    res.status(200).json(vendorsResult);
                }
            });
        }
    });
});


module.exports = router;