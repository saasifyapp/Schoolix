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
    const tables = [
        { name: 'pre_adm_registered_students', query: `
            CREATE TABLE pre_adm_registered_students (
                student_name varchar(25) NOT NULL,
                mobile_no varchar(10) NOT NULL,
                res_address varchar(25) NOT NULL,
                dob varchar(10) NOT NULL,
                standard varchar(8) DEFAULT NULL
            )`
        },
        { name: 'pre_adm_admitted_students', query: `
            CREATE TABLE pre_adm_admitted_students (
                student_name varchar(25) NOT NULL,
                mobile_no varchar(10) NOT NULL,
                res_address varchar(25) NOT NULL,
                dob varchar(10) NOT NULL,
                standard varchar(8) DEFAULT NULL
            )`
        },
        { name: 'pre_adm_registered_teachers', query: `
            CREATE TABLE pre_adm_registered_teachers (
                teacher_name varchar(25) NOT NULL,
                mobile_no varchar(10) NOT NULL,
                res_address varchar(30) NOT NULL,
                dob varchar(10) NOT NULL,
                qualification varchar(30) NOT NULL,
                experience varchar(30) NOT NULL
            )`
        },
        { name: 'pre_adm_admitted_teachers', query: `
            CREATE TABLE pre_adm_admitted_teachers (
                teacher_name varchar(25) NOT NULL,
                mobile_no varchar(10) NOT NULL,
                res_address varchar(30) NOT NULL,
                dob varchar(10) NOT NULL,
                qualification varchar(30) NOT NULL,
                experience varchar(30) NOT NULL
            )`
        },
        { name: 'inventory_book_details', query: `
            CREATE TABLE inventory_book_details (
                title varchar(30) DEFAULT NULL,
                class_of_title varchar(10) DEFAULT NULL,
                purchase_price decimal(10,2) DEFAULT NULL,
                selling_price int(11) DEFAULT NULL,
                vendor varchar(30) DEFAULT NULL,
                ordered_quantity int(11) DEFAULT NULL,
                remaining_quantity int(11) DEFAULT NULL,
                returned_quantity int(11) DEFAULT NULL
            )`
        },
        { name: 'inventory_uniform_details', query: `
            CREATE TABLE inventory_uniform_details (
                uniform_item varchar(30) DEFAULT NULL,
                size_of_item varchar(10) DEFAULT NULL,
                purchase_price decimal(10,2) DEFAULT NULL,
                selling_price int(11) DEFAULT NULL,
                vendor varchar(30) DEFAULT NULL,
                ordered_quantity int(11) DEFAULT NULL,
                remaining_quantity int(11) DEFAULT NULL,
                returned_quantity int(11) DEFAULT NULL
            )`
        },
        { name: 'inventory_vendor_details', query: `
            CREATE TABLE inventory_vendor_details (
                vendor_name varchar(30) DEFAULT NULL,
                net_payable decimal(10,2) DEFAULT NULL,
                paid_till_now decimal(10,2) DEFAULT NULL,
                balance decimal(10,2) DEFAULT NULL,
                vendorFor varchar(20) DEFAULT NULL
            )`
        },
        { name: 'inventory_invoice_details', query: `
            CREATE TABLE inventory_invoice_details (
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
            )`
        },
        { name: 'inventory_invoice_items', query: `
            CREATE TABLE inventory_invoice_items (
                invoiceNo int(11) DEFAULT NULL,
                item_name varchar(30) DEFAULT NULL,
                quantity int(11) DEFAULT NULL,
                class_size varchar(15) DEFAULT NULL,
                type varchar(10) DEFAULT NULL,
                KEY invoiceNo (invoiceNo),
                CONSTRAINT inventory_invoice_items_ibfk_1 FOREIGN KEY (invoiceNo) REFERENCES inventory_invoice_details (invoiceNo)
            )`
        }
    ];

    const checkTableExists = (tableName) => {
        return new Promise((resolve, reject) => {
            connection.query(`SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = '${dbCredentials.database}' AND table_name = '${tableName}'`, (error, results) => {
                if (error) {
                    return reject(error);
                }
                const exists = results[0].count > 0;
                resolve(exists);
            });
        });
    };

    const createTableIfNotExists = (table) => {
        return checkTableExists(table.name)
            .then(exists => {
                if (!exists) {
                    return new Promise((resolve, reject) => {
                        connection.query(table.query, (error, result) => {
                            if (error) {
                                console.error(`Error creating table ${table.name}: `, error.stack);
                                return reject(error);
                            }
                            console.log(`Table ${table.name} created successfully`);
                            resolve();
                        });
                    });
                } else {
                    console.log(`Table ${table.name} already exists`);
                }
            });
    };

    const tableCreationPromises = tables.map(createTableIfNotExists);

    Promise.all(tableCreationPromises)
        .then(() => {
            const counts = {};
            const tableNames = ['pre_adm_registered_students', 'pre_adm_admitted_students', 'pre_adm_registered_teachers', 'pre_adm_admitted_teachers'];

            const countPromises = tableNames.map(tableName => {
                return new Promise((resolve, reject) => {
                    connection.query(`SELECT COUNT(*) AS count FROM ${tableName}`, (error, results) => {
                        if (error) {
                            console.error(`Error querying MySQL for table ${tableName}:`, error);
                            return reject(error);
                        }
                        counts[tableName] = results[0].count;
                        resolve();
                    });
                });
            });

            return Promise.all(countPromises)
                .then(() => res.json(counts))
                .catch(error => res.status(500).json({ error: 'Error fetching counts from MySQL' }));
        })
        .catch(error => res.status(500).json({ error: 'Error creating tables' }));
});

module.exports = router;
