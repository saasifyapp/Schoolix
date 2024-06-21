const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Define dbCredentials and connection outside the endpoint
let dbCredentials;
let connection;

// Middleware to set dbCredentials and create the connection pool if it doesn't exist
router.use((req, res, next) => {
    dbCredentials = req.session.dbCredentials;

    // Create or reuse connection pool based on dbCredentials
    if (!connection || connection.config.host !== dbCredentials.host) {
        // Create new connection pool if not already exists or different host
        connection = mysql.createPool({
            host: dbCredentials.host,
            user: dbCredentials.user,
            password: dbCredentials.password,
            database: dbCredentials.database
        });
    }

    next();
});

// Route to handle adding a new vendor
router.post('/inventory/purchase/add_vendor', (req, res) => {
    const { vendorName, amountPaid, vendorFor } = req.body;
    const netPayable = req.body.netPayable || 0;
    const balance = req.body.balance || 0;
    const vendorType = req.body.vendorFor;

    // Check if vendor name already exists
    const checkSql = 'SELECT * FROM inventory_vendor_details WHERE vendor_name = ?';
    connection.query(checkSql, [vendorName], (err, result) => {
        if (err) {
            console.error('Error checking vendor:', err);
            res.status(500).send("Error checking vendor");
        } else {
            // If vendor name already exists, return a message to the client
            if (result.length > 0) {
                res.status(400).send('Vendor name already exists');
            } else {
                // If vendor name does not exist, proceed with insertion
                const sql = 'INSERT INTO inventory_vendor_details (vendor_name, net_payable, paid_till_now, balance, vendorFor) VALUES (?, ?, ?, ?, ?)';
                connection.query(sql, [vendorName, netPayable, amountPaid, balance, vendorType], (err, result) => {
                    if (err) {
                        console.error('Error adding vendor:', err);
                        res.status(500).send("Error adding vendor");
                    } else {
                        console.log('Vendor added successfully');
                        res.status(200).send('Vendor added successfully');
                    }
                });
            }
        }
    });
});

// Route to delete a vendor
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

// Route to handle both GET and PUT requests for retrieving and updating Paid Amount of Vendor
router.route('/inventory/vendors/:vendorName/paid_till_now')
    .get((req, res) => {
        const vendorName = req.params.vendorName;
        const sql = 'SELECT vendor_name, paid_till_now, net_payable, balance FROM inventory_vendor_details WHERE vendor_name = ?';
        connection.query(sql, [vendorName], (err, result) => {
            if (err) {
                console.error('Error fetching quantity:', err);
                res.status(500).json({ error: 'Error fetching quantity' });
            } else {
                if (result.length === 0) {
                    res.status(404).json({ error: 'Vendor not found' });
                } else {
                    const { vendor_name, paid_till_now, net_payable, balance } = result[0];
                    res.status(200).json({ vendor_name, paid_till_now, net_payable, balance });
                }
            }
        });
    })
    .put((req, res) => {
        const vendorName = req.params.vendorName;
        const totalPaid = req.body.paid_till_now; // Get the new total paid amount from the request body

        const sql = 'UPDATE inventory_vendor_details SET paid_till_now = ? WHERE vendor_name = ?';
        connection.query(sql, [totalPaid, vendorName], (err, result) => {
            if (err) {
                console.error('Error updating vendor details:', err);
                res.status(500).json({ error: 'Error updating vendor details' });
            } else {
                if (result.affectedRows === 0) {
                    res.status(404).json({ error: 'Vendor not found' });
                } else {
                    res.status(200).json({ message: 'Vendor details updated successfully' });
                }
            }
        });
    });

// Route to calculate net_payable and update it to vendor table
router.get('/inventory/vendors', (req, res) => {
    const sqlQuery = `
        SELECT 
            v.vendor_name,
            COALESCE(SUM(b.purchase_price * b.ordered_quantity) - SUM(b.purchase_price * b.returned_quantity), 0) + COALESCE(SUM(u.purchase_price * u.ordered_quantity) - SUM(u.purchase_price * u.returned_quantity), 0) AS net_payable,
            v.paid_till_now,
            COALESCE(SUM(b.purchase_price * b.ordered_quantity) - SUM(b.purchase_price * b.returned_quantity), 0) + COALESCE(SUM(u.purchase_price * u.ordered_quantity) - SUM(u.purchase_price * u.returned_quantity), 0) - v.paid_till_now AS balance
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

// Route to search vendors by name
router.get("/inventory/vendors/search", (req, res) => {
    const searchQuery = req.query.search.trim(); // Get the search query from request URL query parameters

    // Construct the SQL query to filter based on the vendor name
    let query = `SELECT * FROM inventory_vendor_details WHERE vendor_name LIKE ?`;

    // Execute the SQL query
    connection.query(query, [`%${searchQuery}%`], (err, rows) => {
        if (err) {
            console.error("Error fetching data: " + err.stack);
            res.status(500).json({ error: "Error fetching data" });
            return;
        }
        res.json(rows);
    });
});

// Route to handle retrieving and updating vendor details by sr_no
router.route('/inventory/vendors/:sr_no')
    .get((req, res) => {
        const sr_no = req.params.sr_no;
        const sql = 'SELECT vendor_name, vendorFor FROM inventory_vendor_details WHERE sr_no = ?';
        connection.query(sql, [sr_no], (err, result) => {
            if (err) {
                console.error('Error fetching vendor details:', err);
                return res.status(500).json({ error: 'Failed to fetch vendor details' });
            }
            if (result.length === 0) {
                return res.status(404).json({ error: 'Vendor not found' });
            }
            res.status(200).json(result[0]);
        });
    })
    .put((req, res) => {
        const sr_no = req.params.sr_no;
        const { vendor_name, vendorFor } = req.body;

        if (!vendor_name || !vendorFor) {
            return res.status(400).json({ error: 'Vendor name and type are required' });
        }

        // First, fetch the old vendor name to use it in the dependent table updates
        const fetchOldVendorNameSql = 'SELECT vendor_name FROM inventory_vendor_details WHERE sr_no = ?';
        connection.query(fetchOldVendorNameSql, [sr_no], (err, result) => {
            if (err) {
                console.error('Error fetching old vendor name:', err);
                return res.status(500).json({ error: 'Failed to fetch old vendor name' });
            }
            if (result.length === 0) {
                return res.status(404).json({ error: 'Vendor not found' });
            }

            const oldVendorName = result[0].vendor_name;

            // Update the vendor details
            const updateVendorSql = `
                UPDATE inventory_vendor_details 
                SET vendor_name = ?, vendorFor = ?
                WHERE sr_no = ?;
            `;
            connection.query(updateVendorSql, [vendor_name, vendorFor, sr_no], (err, result) => {
                if (err) {
                    console.error('Error updating vendor details:', err);
                    return res.status(500).json({ error: 'Failed to update vendor details' });
                }

                // Depending on the vendorFor value, update the corresponding table
                let updateDependentTableSql = '';
                if (vendorFor === 'Books') {
                    updateDependentTableSql = `
                        UPDATE inventory_book_details
                        SET vendor = ?
                        WHERE vendor = ?;
                    `;
                } else if (vendorFor === 'Uniform') {
                    updateDependentTableSql = `
                        UPDATE inventory_uniform_details
                        SET vendor = ?
                        WHERE vendor = ?;
                    `;
                }

                if (updateDependentTableSql) {
                    connection.query(updateDependentTableSql, [vendor_name, oldVendorName], (err, result) => {
                        if (err) {
                            console.error('Error updating dependent table:', err);
                            return res.status(500).json({ error: 'Failed to update dependent table' });
                        }

                        res.status(200).json({ message: 'Vendor details updated successfully' });
                    });
                } else {
                    // If vendorFor is not 'book' or 'uniform', just send a success response for the vendor update
                    res.status(200).json({ message: 'Vendor details updated successfully' });
                }
            });
        });
    });

module.exports = router;
