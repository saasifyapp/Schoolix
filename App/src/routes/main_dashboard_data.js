const express = require('express');
const router = express.Router();
const mysql = require('mysql');


// Define dbCredentials and connection outside the endpoint
let dbCredentials;
let connection;

// Middleware to set dbCredentials and connection
router.use((req, res, next) => {
    dbCredentials = req.session.dbCredentials;
    connection = mysql.createPool({
        host: dbCredentials.host,
        user: dbCredentials.user,
        password: dbCredentials.password,
        database: dbCredentials.database
    });
    next();
});

router.get('/main_dashboard_data', (req, res) => {


    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS pre_adm_registered_students (
        student_name varchar(25) NOT NULL,
        mobile_no varchar(10) NOT NULL,
        res_address varchar(25) NOT NULL,
        dob varchar(10) NOT NULL,
        standard varchar(8) DEFAULT NULL
    )
`;
    connection.query(createTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
    });

    const createTableQuery2 = `
    CREATE TABLE IF NOT EXISTS pre_adm_admitted_students (
        student_name varchar(25) NOT NULL,
        mobile_no varchar(10) NOT NULL,
        res_address varchar(25) NOT NULL,
        dob varchar(10) NOT NULL,
        standard varchar(8) DEFAULT NULL
    )
`;
    connection.query(createTableQuery2, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
    });

    const createTableQuery3 = `
CREATE TABLE IF NOT EXISTS pre_adm_registered_teachers (
    teacher_name varchar(25) NOT NULL,
    mobile_no varchar(10) NOT NULL,
    res_address varchar(30) NOT NULL,
    dob varchar(10) NOT NULL,
    qualification varchar(30) NOT NULL,
    experience varchar(30) NOT NULL
    
)
`;
    connection.query(createTableQuery3, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
    });

    const createTableQuery4 = `
CREATE TABLE IF NOT EXISTS pre_adm_admitted_teachers (
    teacher_name varchar(25) NOT NULL,
    mobile_no varchar(10) NOT NULL,
    res_address varchar(30) NOT NULL,
    dob varchar(10) NOT NULL,
    qualification varchar(30) NOT NULL,
    experience varchar(30) NOT NULL

)
`;

    connection.query(createTableQuery4, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
    });

    const createTableQuery5 = `
CREATE TABLE IF NOT EXISTS inventory_book_details (
    title varchar(30) DEFAULT NULL,
    class_of_title varchar(10) DEFAULT NULL,
    purchase_price decimal(10,2) DEFAULT NULL,
    selling_price int(11) DEFAULT NULL,
    vendor varchar(30) DEFAULT NULL,
    ordered_quantity int(11) DEFAULT NULL,
    remaining_quantity int(11) DEFAULT NULL,
    returned_quantity int(11) DEFAULT NULL
)
`;

    connection.query(createTableQuery5, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
        //console.log('Table inventory_book_details created successfully');
    });

    const createTableQuery6 = `
CREATE TABLE IF NOT EXISTS inventory_uniform_details (
    uniform_item varchar(30) DEFAULT NULL,
    size_of_item varchar(10) DEFAULT NULL,
    purchase_price decimal(10,2) DEFAULT NULL,
    selling_price int(11) DEFAULT NULL,
    vendor varchar(30) DEFAULT NULL,
    ordered_quantity int(11) DEFAULT NULL,
    remaining_quantity int(11) DEFAULT NULL,
    returned_quantity int(11) DEFAULT NULL
)
`;

    connection.query(createTableQuery6, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
        // console.log('Table inventory_uniform_details created successfully');
    });

    const createTableQuery7 = `
CREATE TABLE IF NOT EXISTS inventory_vendor_details (
    vendor_name varchar(30) DEFAULT NULL,
    net_payable decimal(10,2) DEFAULT NULL,
    paid_till_now decimal(10,2) DEFAULT NULL,
    balance decimal(10,2) DEFAULT NULL,
    vendorFor varchar(20) DEFAULT NULL
)
`;

    connection.query(createTableQuery7, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
        //console.log('Table inventory_vendor_details created successfully');
    });

    const createTableQuery8 = `
CREATE TABLE IF NOT EXISTS inventory_invoice_details (
    invoiceNo int(11) NOT NULL,
    billDate date DEFAULT NULL,
    buyerName varchar(50) DEFAULT NULL,
    buyerPhone varchar(10) DEFAULT NULL,
    class_of_buyer varchar(15) DEFAULT NULL,
    total_payable int(11) DEFAULT NULL,
    paid_amount int(11) DEFAULT NULL,
    balance_amount int(11) DEFAULT NULL,
    mode_of_payment varchar(5) DEFAULT NULL,
    PRIMARY KEY (invoiceNo)
)
`;

    connection.query(createTableQuery8, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
        //console.log('Table inventory_invoice_details created successfully');
    });

    const createTableQuery9 = `
CREATE TABLE IF NOT EXISTS inventory_invoice_items (
    invoiceNo int(11) DEFAULT NULL,
    item_name varchar(30) DEFAULT NULL,
    quantity int(11) DEFAULT NULL,
    class_size varchar(15) DEFAULT NULL,
    type varchar(10) DEFAULT NULL,
    KEY invoiceNo (invoiceNo),
    CONSTRAINT inventory_invoice_items_ibfk_1 FOREIGN KEY (invoiceNo) REFERENCES inventory_invoice_details (invoiceNo)
)
`;

    connection.query(createTableQuery9, (err, result) => {
        if (err) {
            console.error('Error creating table: ' + err.stack);
            return;
        }
        //console.log('Table inventory_invoice_items created successfully');
    });




    // Define an object to store counts for each table
    const counts = {};

    // Array of table names
    const tableNames = ['pre_adm_registered_students', 'pre_adm_admitted_students', 'pre_adm_registered_teachers', 'pre_adm_admitted_teachers']; // Adjust table names as per your database schema

    // Fetch counts for each table
    const promises = tableNames.map(tableName => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT COUNT(*) AS count FROM ${tableName}`, (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for table ${tableName}:`, error);
                    reject(error);
                } else {
                    if (results && results.length > 0 && results[0].count !== undefined) {
                        // Extract the count value using the alias 'count'
                        const count = results[0].count;
                        // Store the count in the counts object
                        counts[tableName] = count;
                        resolve();
                    } else {
                        console.error(`No count found for table ${tableName}`);
                        counts[tableName] = 0; // Assuming count is 0 if not found
                        resolve();
                    }
                }
            });
        });
    });

    // Once all counts are fetched, send them as a response
    Promise.all(promises)
        .then(() => {
            res.json(counts);
        })
        .catch(error => {
            res.status(500).json({ error: 'Error fetching counts from MySQL' });
        });
});

module.exports = router;