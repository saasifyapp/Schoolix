const express = require('express');
const router = express.Router();

// Fetching book data endpoint
router.get('/inventory/all_vendor', (req, res) => {
    const sql = 'SELECT vendor_name FROM inventory_vendor_details';
    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching books:', err);
            res.status(500).json({ error: 'Error fetching books' });
        } else {
            res.status(200).json(result);
            
        }
    });
});



// Get data for vendor summary
router.get('/inventory/vendors_summary', (req, res) => {
    const sql = 'SELECT vendor_name,vendorFor,net_payable,paid_till_now, balance  FROM inventory_vendor_details';

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching vendor summary:', err);
            res.status(500).send("Error fetching vendor summary");
        } else {
            res.status(200).json(result); // Send the result back to the client
        }
    });
});


// Get Data for vendor details
// Get Data for vendor details
router.get('/inventory/vendors_details', (req, res) => {
    const vendorName = req.query.vendor;

    const sql = `SELECT
    V.vendor_name,
        CASE 
        WHEN B.title IS NOT NULL THEN CONCAT(B.title, '_', B.class_of_title)
        WHEN U.uniform_item IS NOT NULL THEN CONCAT(U.uniform_item, '_', U.size_of_item)
    END AS item_ordered,
        COALESCE(B.purchase_price, U.purchase_price) AS purchase_price,
            COALESCE(B.ordered_quantity, U.ordered_quantity) AS ordered_quantity,
                COALESCE(B.returned_quantity, U.returned_quantity) AS returned_quantity,
                    COALESCE(B.remaining_quantity, U.remaining_quantity) AS no_of_items_in_stock,
                        COALESCE(B.purchase_price, U.purchase_price) * COALESCE(B.ordered_quantity, U.ordered_quantity) AS ordered_price,
                            COALESCE(B.purchase_price, U.purchase_price) * COALESCE(B.returned_quantity, U.returned_quantity) AS returned_price,
                                (COALESCE(B.purchase_price, U.purchase_price) * COALESCE(B.ordered_quantity, U.ordered_quantity)) - (COALESCE(B.purchase_price, U.purchase_price) * COALESCE(B.returned_quantity, U.returned_quantity)) AS net_payable
    FROM
    inventory_vendor_details V
LEFT JOIN
    inventory_book_details B ON V.vendor_name = B.vendor
LEFT JOIN
    inventory_uniform_details U ON V.vendor_name = U.vendor
    WHERE
    V.vendor_name = ?; `;

    connection.query(sql, [vendorName], (err, result) => {
        if (err) {
            console.error('Error fetching vendor details:', err);
            res.status(500).send("Error fetching vendor details");
        } else {
            res.status(200).json(result); // Send the result back to the client
        }
    });
});


// Get Data for profit loss 

router.get('/inventory/profit_loss', (req, res) => {
    const sqlBooks = 'SELECT SUM(purchase_price * (ordered_quantity - remaining_quantity - returned_quantity)) as total_purchase_price, SUM(selling_price * (ordered_quantity - remaining_quantity - returned_quantity)) as total_selling_price, SUM((selling_price - purchase_price) * (ordered_quantity - remaining_quantity - returned_quantity)) as total_profit FROM inventory_book_details';
    const sqlUniforms = 'SELECT SUM(purchase_price * (ordered_quantity - remaining_quantity - returned_quantity)) as total_purchase_price, SUM(selling_price * (ordered_quantity - remaining_quantity - returned_quantity)) as total_selling_price, SUM((selling_price - purchase_price) * (ordered_quantity - remaining_quantity - returned_quantity)) as total_profit FROM inventory_uniform_details';

    connection.query(sqlBooks, (err, resultBooks) => {
        if (err) {
            console.error('Error fetching books profit/loss:', err);
            res.status(500).send("Error fetching books profit/loss");
        } else {
            connection.query(sqlUniforms, (err, resultUniforms) => {
                if (err) {
                    console.error('Error fetching uniforms profit/loss:', err);
                    res.status(500).send("Error fetching uniforms profit/loss");
                } else {
                    const combinedResult = {
                        books: resultBooks[0],
                        uniforms: resultUniforms[0]
                    };
                    res.status(200).json(combinedResult); // Send the combined result back to the client
                }
            });
        }
    });
});



module.exports = router;