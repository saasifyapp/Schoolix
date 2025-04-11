const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../middleware/connectionManager'); // Adjust the path to match the new location
const { connection_auth } = require('../../main_server'); // Adjust the path as needed

// Use the connection manager middleware
router.use(connectionManager);

// Helper function to wrap connection query in a promise
const runQuery = (connection, query, params) => {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

// GET endpoint to fetch main dashboard data
router.get('/main_dashboard_data', (req, res) => {
    const counts = {};
    const tableNames = ['pre_adm_registered_students', 'pre_adm_admitted_students', 'pre_adm_registered_teachers', 'pre_adm_admitted_teachers'];

    const promises = tableNames.map(tableName => {
        return runQuery(req.connectionPool, `SELECT COUNT(*) AS count FROM ${tableName}`, [])
            .then(results => {
                counts[tableName] = results[0].count;
            })
            .catch(error => {
                console.error(`Error querying MySQL for table ${tableName}:`, error);
                counts[tableName] = 0;
            });
    });

    Promise.all(promises)
        .then(() => res.json(counts))
        .catch(error => res.status(500).json({ error: 'Error fetching counts from MySQL' }));
});

// GET endpoint to fetch main dashboard library data
router.get('/main_dashboard_library_data', (req, res) => {
    const counts = {};
    const queries = {
        totalBooks: 'SELECT COUNT(*) AS count FROM library_book_details',
        memberCount: 'SELECT COUNT(*) AS count FROM library_member_details',
        booksIssued: 'SELECT COUNT(*) AS count FROM library_transactions',
        booksAvailable: 'SELECT SUM(available_quantity) AS count FROM library_book_details',
        outstandingBooks: 'SELECT COUNT(*) AS count FROM library_transactions WHERE return_date < CURDATE()',
        booksIssuedToday: 'SELECT COUNT(*) AS count FROM library_transaction_log WHERE transaction_date = CURDATE() AND transaction_type = "issue"',
        booksReturnedToday: 'SELECT COUNT(*) AS count FROM library_transaction_log WHERE transaction_date = CURDATE() AND transaction_type = "return"',
        penaltiesCollected: 'SELECT SUM(penalty_paid) AS count FROM library_transaction_log WHERE penalty_status = "paid"'
    };

    const promises = Object.keys(queries).map(key => {
        return runQuery(req.connectionPool, queries[key], [])
            .then(results => {
                counts[key] = results[0].count;
            })
            .catch(error => {
                console.error(`Error querying MySQL for ${key}:`, error);
                counts[key] = 0;
            });
    });

    Promise.all(promises)
        .then(() => res.json(counts))
        .catch(error => res.status(500).json({ error: 'Error fetching counts from MySQL' }));
});

// POST endpoint to check confirmation status
router.post('/check-confirmation-status', async (req, res) => {
    const { loginName } = req.body;

    if (!connection_auth) {
        console.error('Database connection is not available');
        return res.status(500).json({ error: 'Database connection is not available' });
    }

    const checkUserSql = `SELECT confirmed_at_school FROM user_details WHERE LoginName = ?`;

    try {
        const userResults = await runQuery(connection_auth, checkUserSql, [loginName]);

        if (userResults.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const confirmedAtSchool = userResults[0].confirmed_at_school;
        res.json({ confirmed_at_school: confirmedAtSchool });
    } catch (error) {
        console.error('Error checking confirmation status:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// POST endpoint to confirm user location
router.post('/confirm-location', async (req, res) => {
    const { loginName, latitude, longitude } = req.body;

    if (!connection_auth) {
        console.error('Database connection is not available');
        return res.status(500).json({ error: 'Database connection is not available' });
    }

    const updateSql = `UPDATE user_details SET fixed_latitude = ?, fixed_longitude = ?, confirmed_at_school = 1 WHERE LoginName = ?`;

    try {
        await runQuery(connection_auth, updateSql, [latitude, longitude, loginName]);
        res.json({ success: true, message: 'Location confirmed and saved.' });
    } catch (error) {
        console.error('Error in confirm-location:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

///////////////////////// ENDPOINT TO FETCH USER COUNTS (STUDENT,TEACHE, ADMINS )////////////////////)

// Route to fetch user counts for main dashboard
router.get('/fetch-user-counts-for-main-dashboard', async (req, res) => {
    try {
        // Define queries to get the count from both tables
        const primaryQuery = `SELECT COUNT(*) AS count FROM primary_student_details WHERE is_active = 1`;
        const prePrimaryQuery = `SELECT COUNT(*) AS count FROM pre_primary_student_details WHERE is_active = 1`;
        const teacherQuery = `SELECT COUNT(*) AS count FROM teacher_details WHERE category = 'teacher' AND is_active = 1`;
        const adminQuery = `SELECT COUNT(*) AS count FROM teacher_details WHERE category = 'admin' AND is_active = 1`;
        const supportStaffQuery = `SELECT COUNT(*) AS count FROM teacher_details WHERE category = 'support_staff' AND is_active = 1`;

        // Execute all queries concurrently
        const primaryPromise = new Promise((resolve, reject) => {
            req.connectionPool.query(primaryQuery, (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for primary student count:`, error);
                    reject(error);
                } else {
                    resolve(results[0].count);
                }
            });
        });

        const prePrimaryPromise = new Promise((resolve, reject) => {
            req.connectionPool.query(prePrimaryQuery, (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for pre-primary student count:`, error);
                    reject(error);
                } else {
                    resolve(results[0].count);
                }
            });
        });

        const teacherPromise = new Promise((resolve, reject) => {
            req.connectionPool.query(teacherQuery, (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for teacher count:`, error);
                    reject(error);
                } else {
                    resolve(results[0].count);
                }
            });
        });

        const adminPromise = new Promise((resolve, reject) => {
            req.connectionPool.query(adminQuery, (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for admin count:`, error);
                    reject(error);
                } else {
                    resolve(results[0].count);
                }
            });
        });

        const supportStaffPromise = new Promise((resolve, reject) => {
            req.connectionPool.query(supportStaffQuery, (error, results) => {
                if (error) {
                    console.error(`Error querying MySQL for support staff count:`, error);
                    reject(error);
                } else {
                    resolve(results[0].count);
                }
            });
        });

        // Wait for all queries to complete
        const [
            primaryCount,
            prePrimaryCount,
            teacherCount,
            adminCount,
            supportStaffCount
        ] = await Promise.all([
            primaryPromise,
            prePrimaryPromise,
            teacherPromise,
            adminPromise,
            supportStaffPromise
        ]);

        // Combine the counts
        const studentCount = primaryCount + prePrimaryCount;
        const employeeCount = teacherCount + adminCount + supportStaffCount;

        // Prepare the response
        const response = {
            Students: studentCount,
            Teachers: teacherCount,
            Admins: adminCount,
            SupportStaff: supportStaffCount,
            Employees: employeeCount
        };

        res.json(response);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////

// GET endpoint to get student counts
router.get('/student_counts', (req, res) => {
    const counts = {};
    const queries = {
        primary_totalStudents: 'SELECT COUNT(*) AS count FROM primary_student_details WHERE is_active = 1',
        primary_maleStudents: "SELECT COUNT(*) AS count FROM primary_student_details WHERE Gender = 'Male' AND is_active = 1",
        primary_femaleStudents: "SELECT COUNT(*) AS count FROM primary_student_details WHERE Gender = 'Female' AND is_active = 1",
        pre_primary_totalStudents: 'SELECT COUNT(*) AS count FROM pre_primary_student_details WHERE is_active = 1',
        pre_primary_maleStudents: "SELECT COUNT(*) AS count FROM pre_primary_student_details WHERE Gender = 'Male' AND is_active = 1",
        pre_primary_femaleStudents: "SELECT COUNT(*) AS count FROM pre_primary_student_details WHERE Gender = 'Female' AND is_active = 1"
    };

    const promises = Object.keys(queries).map(key => {
        return runQuery(req.connectionPool, queries[key], [])
            .then(results => {
                counts[key] = results[0].count;
            })
            .catch(error => {
                console.error(`Error querying MySQL for ${key}:`, error);
                counts[key] = 0;
            });
    });

    Promise.all(promises)
        .then(() => res.json(counts))
        .catch(error => res.status(500).json({ error: 'Error fetching counts from MySQL' }));
});


// Endpoint to automatically create tables if they do not exist
router.get('/create_tables', async (req, res) => {
    const tableQueries = [
        {
            query: `CREATE TABLE IF NOT EXISTS pre_adm_teacher_details (
                teacher_name VARCHAR(25) NOT NULL,
                mobile_no VARCHAR(10) NOT NULL,
                res_address VARCHAR(30) NOT NULL,
                dob VARCHAR(10) NOT NULL,
                qualification VARCHAR(30) NOT NULL,
                experience VARCHAR(30) NOT NULL,
        \`references\` VARCHAR(50) DEFAULT NULL,
                registration_date VARCHAR(10) DEFAULT NULL,
                admission_date VARCHAR(10) DEFAULT NULL,
                type ENUM('registered', 'admitted') DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS pre_adm_student_details (
                student_name VARCHAR(50) NOT NULL,
                mobile_no VARCHAR(10) NOT NULL,
                res_address VARCHAR(50) NOT NULL,
                dob VARCHAR(10) NOT NULL,
                standard VARCHAR(20) DEFAULT NULL,
        \`references\` VARCHAR(50) DEFAULT NULL,
                registration_date VARCHAR(10) DEFAULT NULL,
                admission_date VARCHAR(10) DEFAULT NULL,
                type ENUM('registered', 'admitted') DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {

            query: `CREATE TABLE IF NOT EXISTS inventory_book_details (
                sr_no INT(11) NOT NULL AUTO_INCREMENT,
                title VARCHAR(35) DEFAULT NULL,
                class_of_title VARCHAR(25) DEFAULT NULL,
                purchase_price DECIMAL(10,2) DEFAULT NULL,
                selling_price DECIMAL(10,2) DEFAULT NULL,
                vendor VARCHAR(30) DEFAULT NULL,
                ordered_quantity INT(11) DEFAULT NULL,
                remaining_quantity INT(11) DEFAULT NULL,
                returned_quantity INT(11) DEFAULT NULL,
                PRIMARY KEY (sr_no)
            ) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS inventory_invoice_details (
                invoiceNo INT(11) NOT NULL,
                billDate DATE DEFAULT NULL,
                buyerName VARCHAR(50) DEFAULT NULL,
                buyerPhone VARCHAR(10) DEFAULT NULL,
                class_of_buyer VARCHAR(15) DEFAULT NULL,
                total_payable DECIMAL(10,2) DEFAULT NULL,
                paid_amount DECIMAL(10,2) DEFAULT NULL,
                balance_amount DECIMAL(10,2) DEFAULT NULL,
                mode_of_payment VARCHAR(5) DEFAULT NULL,
                PRIMARY KEY (invoiceNo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS inventory_invoice_items (
                invoiceNo INT(11) DEFAULT NULL,
                item_name VARCHAR(30) DEFAULT NULL,
                quantity INT(11) DEFAULT NULL,
                class_size VARCHAR(25) DEFAULT NULL,
                type VARCHAR(10) DEFAULT NULL,
                KEY invoiceNo (invoiceNo),
                CONSTRAINT inventory_invoice_items_ibfk_1 FOREIGN KEY (invoiceNo) REFERENCES inventory_invoice_details (invoiceNo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS inventory_payment_history (
                history_id INT(11) NOT NULL AUTO_INCREMENT,
                invoiceNo INT(11) NOT NULL,
                paid_amount DECIMAL(10,2) DEFAULT NULL,
                mode_of_payment VARCHAR(5) DEFAULT NULL,
                updatedDate DATE DEFAULT NULL,
                PRIMARY KEY (history_id),
                KEY invoiceNo (invoiceNo),
                CONSTRAINT inventory_payment_history_ibfk_1 FOREIGN KEY (invoiceNo) REFERENCES inventory_invoice_details (invoiceNo)
            ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS inventory_uniform_details (
                sr_no INT(11) NOT NULL AUTO_INCREMENT,
                uniform_item VARCHAR(30) DEFAULT NULL,
                size_of_item VARCHAR(10) DEFAULT NULL,
                purchase_price DECIMAL(10,2) DEFAULT NULL,
                selling_price DECIMAL(10,2) DEFAULT NULL,
                vendor VARCHAR(30) DEFAULT NULL,
                ordered_quantity INT(11) DEFAULT NULL,
                remaining_quantity INT(11) DEFAULT NULL,
                returned_quantity INT(11) DEFAULT NULL,
                PRIMARY KEY (sr_no)
            ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS inventory_vendor_details (
                sr_no INT(11) NOT NULL AUTO_INCREMENT,
                vendor_name VARCHAR(30) DEFAULT NULL,
                net_payable DECIMAL(10,2) DEFAULT NULL,
                paid_till_now DECIMAL(10,2) DEFAULT NULL,
                balance DECIMAL(10,2) DEFAULT NULL,
                vendorFor VARCHAR(20) DEFAULT NULL,
                PRIMARY KEY (sr_no)
            ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS library_book_details (
                sr_no INT(10) NOT NULL AUTO_INCREMENT,
                bookID VARCHAR(15) NOT NULL,
                book_name VARCHAR(50) NOT NULL,
                book_author VARCHAR(50) NOT NULL,
                book_publication VARCHAR(50) NOT NULL,
                book_price DECIMAL(10,2) NOT NULL,
                ordered_quantity INT(10) NOT NULL,
                description VARCHAR(255) NOT NULL,
                available_quantity INT(10) DEFAULT NULL,
                PRIMARY KEY (sr_no),
                UNIQUE KEY book_number (bookID)
            ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS library_member_details (
                sr_no INT(11) NOT NULL AUTO_INCREMENT,
                memberID VARCHAR(15) NOT NULL,
                member_name VARCHAR(50) NOT NULL,
                member_contact VARCHAR(10) NOT NULL,
                member_class VARCHAR(15) NOT NULL,
                books_issued INT(10) NOT NULL,
                PRIMARY KEY (sr_no),
                UNIQUE KEY enrollment_number (memberID)
            ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS library_transactions (
                id INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
                memberID VARCHAR(15) DEFAULT NULL,
                member_name VARCHAR(50) DEFAULT NULL,
                member_class VARCHAR(15) DEFAULT NULL,
                member_contact VARCHAR(10) DEFAULT NULL,
                bookID VARCHAR(15) DEFAULT NULL,
                book_name VARCHAR(50) DEFAULT NULL,
                book_author VARCHAR(50) DEFAULT NULL,
                book_publication VARCHAR(50) DEFAULT NULL,
                issue_date DATE DEFAULT NULL,
                return_date DATE DEFAULT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS library_transaction_log (
                transaction_id INT(11) NOT NULL AUTO_INCREMENT,
                transaction_type ENUM('issue','return') NOT NULL,
                memberID VARCHAR(15) DEFAULT NULL,
                bookID VARCHAR(15) DEFAULT NULL,
                transaction_date DATE DEFAULT NULL,
                penalty_status VARCHAR(10) DEFAULT NULL,
                penalty_paid INT(11) DEFAULT NULL,
                PRIMARY KEY (transaction_id)
            ) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS pre_adm_admitted_students (
                student_name VARCHAR(25) NOT NULL,
                mobile_no VARCHAR(10) NOT NULL,
                res_address VARCHAR(25) NOT NULL,
                dob VARCHAR(10) NOT NULL,
                standard VARCHAR(8) DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS pre_adm_admitted_teachers (
                teacher_name VARCHAR(25) NOT NULL,
                mobile_no VARCHAR(10) NOT NULL,
                res_address VARCHAR(30) NOT NULL,
                dob VARCHAR(10) NOT NULL,
                qualification VARCHAR(30) NOT NULL,
                experience VARCHAR(30) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS pre_adm_registered_students (
                student_name VARCHAR(25) NOT NULL,
                mobile_no VARCHAR(10) NOT NULL,
                res_address VARCHAR(25) NOT NULL,
                dob VARCHAR(10) NOT NULL,
                standard VARCHAR(8) DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS pre_adm_registered_teachers (
                teacher_name VARCHAR(25) NOT NULL,
                mobile_no VARCHAR(10) NOT NULL,
                res_address VARCHAR(30) NOT NULL,
                dob VARCHAR(10) NOT NULL,
                qualification VARCHAR(30) NOT NULL,
                experience VARCHAR(30) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS teacher_details (
                id INT(5) NOT NULL AUTO_INCREMENT,
                name VARCHAR(50) DEFAULT NULL,
                first_name VARCHAR(50) DEFAULT NULL,
                last_name VARCHAR(50) DEFAULT NULL,
                designation VARCHAR(50) DEFAULT NULL,
                gender VARCHAR(10) DEFAULT NULL,
                date_of_birth DATE DEFAULT NULL,
                date_of_joining DATE DEFAULT NULL,
                mobile_no VARCHAR(10) DEFAULT NULL,
                address_city VARCHAR(25) DEFAULT NULL,
                teacher_uid_no VARCHAR(20) DEFAULT NULL,
                department VARCHAR(50) DEFAULT NULL,
                qualification VARCHAR(50) DEFAULT NULL,
                experience VARCHAR(50) DEFAULT NULL,
                subjects_taught TEXT DEFAULT NULL,
                salary VARCHAR(10) DEFAULT NULL,
                transport_needed INT(1) DEFAULT NULL,
                transport_tagged VARCHAR(15) DEFAULT NULL,
                transport_pickup_drop VARCHAR(25) DEFAULT NULL,
                address_details VARCHAR(255) DEFAULT NULL,
                classes_alloted TEXT DEFAULT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS transport_driver_conductor_details (
                id INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
                name VARCHAR(50) DEFAULT NULL,
                contact VARCHAR(10) DEFAULT NULL,
                address VARCHAR(50) DEFAULT NULL,
                driver_conductor_type ENUM('Driver','Conductor') DEFAULT NULL,
                vehicle_no VARCHAR(15) DEFAULT NULL,
                vehicle_type ENUM('Bus','Van','Car','Other') DEFAULT NULL,
                vehicle_capacity INT(10) DEFAULT NULL,
                latitude DECIMAL(10,8) DEFAULT NULL,
                longitude DECIMAL(11,8) DEFAULT NULL,
                location_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP(),
                uid VARCHAR(50) NOT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS transport_pick_drop_logs (
                id INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
                student_name VARCHAR(50) NOT NULL,
                pick_drop_location VARCHAR(50) NOT NULL,
                date_of_log DATE NOT NULL,
                type_of_log ENUM('not_picked','not_dropped') NOT NULL,
                vehicle_no VARCHAR(15) NOT NULL,
                driver_name VARCHAR(50) NOT NULL,
                shift VARCHAR(20) NOT NULL,
                standard VARCHAR(20) NOT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS transport_route_shift_details (
                route_shift_id INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
                route_shift_type ENUM('route','shift') DEFAULT NULL,
                route_shift_name VARCHAR(20) DEFAULT NULL,
                route_shift_detail TEXT DEFAULT NULL,
                PRIMARY KEY (route_shift_id)
            ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS transport_schedule_details (
                id INT(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
                vehicle_no VARCHAR(15) DEFAULT NULL,
                driver_name VARCHAR(50) DEFAULT NULL,
                conductor_name VARCHAR(50) DEFAULT NULL,
                route_name VARCHAR(20) DEFAULT NULL,
                route_stops TEXT DEFAULT NULL,
                shift_name VARCHAR(20) DEFAULT NULL,
                classes_alloted TEXT DEFAULT NULL,
                available_seats INT(11) DEFAULT NULL,
                students_tagged INT(11) DEFAULT NULL,
                vehicle_capacity INT(11) DEFAULT NULL,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS pre_primary_student_details (
                Student_id INT(3) DEFAULT NULL,
                Uid VARCHAR(1) DEFAULT NULL,
                Srno VARCHAR(3) DEFAULT NULL,
                Name VARCHAR(50) DEFAULT NULL,
                Section VARCHAR(20) DEFAULT NULL,
                Medium VARCHAR(1) DEFAULT NULL,
                Stream VARCHAR(1) DEFAULT NULL,
                Gender VARCHAR(15) DEFAULT NULL,
                Surname VARCHAR(20) DEFAULT NULL,
                Middlename VARCHAR(20) DEFAULT NULL,
                Firstname VARCHAR(20) DEFAULT NULL,
                Grno INT(4) DEFAULT NULL,
                Division VARCHAR(10) DEFAULT NULL,
                Standard VARCHAR(10) DEFAULT NULL,
                Roll_No INT(1) DEFAULT NULL,
                DOB VARCHAR(10) DEFAULT NULL,
                Age INT(1) DEFAULT NULL,
                POB VARCHAR(20) DEFAULT NULL,
                Mother_Tongue VARCHAR(20) DEFAULT NULL,
                Category VARCHAR(20) DEFAULT NULL,
                Caste VARCHAR(20) DEFAULT NULL,
                Last_School VARCHAR(34) DEFAULT NULL,
                Admission_Date VARCHAR(10) DEFAULT NULL,
                Address VARCHAR(16) DEFAULT NULL,
                Adhar_no VARCHAR(14) DEFAULT NULL,
                Bank_name VARCHAR(1) DEFAULT NULL,
                Account_no VARCHAR(1) DEFAULT NULL,
                Religion VARCHAR(20) DEFAULT NULL,
                Nationality VARCHAR(6) DEFAULT NULL,
                Domicile VARCHAR(11) DEFAULT NULL,
                Buss VARCHAR(30) DEFAULT NULL,
                Hostel_facility VARCHAR(1) DEFAULT NULL,
                Mobile_no VARCHAR(10) DEFAULT NULL,
                Father_name VARCHAR(20) DEFAULT NULL,
                F_qualification VARCHAR(20) DEFAULT NULL,
                f_off_address VARCHAR(20) DEFAULT NULL,
                f_occupation VARCHAR(20) DEFAULT NULL,
                f_per_address VARCHAR(1) DEFAULT NULL,
                f_mobile_no BIGINT(10) DEFAULT NULL,
                f_office_tel INT(1) DEFAULT NULL,
                Mother_name VARCHAR(20) DEFAULT NULL,
                M_Qualification VARCHAR(20) DEFAULT NULL,
                M_off_address VARCHAR(20) DEFAULT NULL,
                M_occupation VARCHAR(20) DEFAULT NULL,
                M_per_address VARCHAR(1) DEFAULT NULL,
                M_mobile_no BIGINT(10) DEFAULT NULL,
                M_office_tel INT(1) DEFAULT NULL,
                Fees_group VARCHAR(1) DEFAULT NULL,
                Admission_fees INT(1) DEFAULT NULL,
                Tution_fees INT(4) DEFAULT NULL,
                Computer_fees INT(1) DEFAULT NULL,
                Fines INT(1) DEFAULT NULL,
                Term_fees INT(1) DEFAULT NULL,
                Extra_cur INT(1) DEFAULT NULL,
                Others INT(1) DEFAULT NULL,
                Total_fees INT(4) DEFAULT NULL,
                Fees_cycle VARCHAR(1) DEFAULT NULL,
                Blood_Group VARCHAR(5) DEFAULT NULL,
                Last_per VARCHAR(1) DEFAULT NULL,
                Grade VARCHAR(1) DEFAULT NULL,
                Consession VARCHAR(1) DEFAULT NULL,
                Photo VARCHAR(1) DEFAULT NULL,
                Photo_Length VARCHAR(1) DEFAULT NULL,
                Medical_status VARCHAR(3) DEFAULT NULL,
                Medical_description VARCHAR(1) DEFAULT NULL,
                New_Addmission VARCHAR(1) DEFAULT NULL,
                Re_Add_Fees VARCHAR(1) DEFAULT NULL,
                Monthly_Fees VARCHAR(1) DEFAULT NULL,
                Prev_Yr_Monthly_Fees VARCHAR(1) DEFAULT NULL,
                Status VARCHAR(1) DEFAULT NULL,
                Alp_sankhya VARCHAR(1) DEFAULT NULL,
                MC_id VARCHAR(1) DEFAULT NULL,
                1st_Installment VARCHAR(1) DEFAULT NULL,
                2nd_Installment VARCHAR(1) DEFAULT NULL,
                3rd_Installment VARCHAR(1) DEFAULT NULL,
                Admission_Fee VARCHAR(1) DEFAULT NULL,
                Tuition_Fee_1 VARCHAR(1) DEFAULT NULL,
                Tuition_Fee_2 VARCHAR(1) DEFAULT NULL,
                Tuition_Fee_3 VARCHAR(1) DEFAULT NULL,
                Term_Fee_1 VARCHAR(1) DEFAULT NULL,
                Term_Fee_2 VARCHAR(1) DEFAULT NULL,
                Late_Fee VARCHAR(1) DEFAULT NULL,
                Term_Fee_3 VARCHAR(1) DEFAULT NULL,
                new_fees VARCHAR(1) DEFAULT NULL,
                Addmission_Fees VARCHAR(1) DEFAULT NULL,
                School_Fees VARCHAR(1) DEFAULT NULL,
                Misc_Fees VARCHAR(1) DEFAULT NULL,
                Coputer_Fees VARCHAR(1) DEFAULT NULL,
                Digital_Fees VARCHAR(1) DEFAULT NULL,
                Function_Fees VARCHAR(1) DEFAULT NULL,
                Dress_Fees VARCHAR(1) DEFAULT NULL,
                Books_Fees VARCHAR(1) DEFAULT NULL,
                Late_Fees VARCHAR(1) DEFAULT NULL,
                F106 VARCHAR(1) DEFAULT NULL,
                concession VARCHAR(1) DEFAULT NULL,
                Tution_Fees INT(4) DEFAULT NULL,
                admitted_class VARCHAR(8) DEFAULT NULL,
                Grand_father VARCHAR(14) DEFAULT NULL,
                Prospectus VARCHAR(1) DEFAULT NULL,
                Other_Receipt VARCHAR(1) DEFAULT NULL,
                Exam_Fees VARCHAR(1) DEFAULT NULL,
                Privious_Balance_Fees VARCHAR(1) DEFAULT NULL,
                Tution_Fees_By_Cheque VARCHAR(1) DEFAULT NULL,
                appid VARCHAR(20) DEFAULT NULL,
                Tution_Fee_Received_by_Cash VARCHAR(1) DEFAULT NULL,
                Tution_Fee VARCHAR(4) DEFAULT NULL,
                Gathering_Fees VARCHAR(1) DEFAULT NULL,
                Admission_Form VARCHAR(1) DEFAULT NULL,
                nationalid VARCHAR(1) DEFAULT NULL,
                transport_needed INT(11) DEFAULT NULL,
                transport_tagged VARCHAR(15) DEFAULT NULL,
                transport_pickup_drop VARCHAR(25) DEFAULT NULL,
                landmark VARCHAR(50) DEFAULT NULL,
                taluka VARCHAR(20) DEFAULT NULL,
                district VARCHAR(20) DEFAULT NULL,
                state VARCHAR(20) DEFAULT NULL,
                pin_code VARCHAR(10) DEFAULT NULL,
                guardian_name VARCHAR(50) DEFAULT NULL,
                guardian_contact VARCHAR(10) DEFAULT NULL,
                guardian_relation VARCHAR(50) DEFAULT NULL,
                guardian_address VARCHAR(255) DEFAULT NULL,
                guardian_landmark VARCHAR(50) DEFAULT NULL,
                guardian_pin_code VARCHAR(10) DEFAULT NULL,
                class_completed VARCHAR(20) DEFAULT NULL,
                percentage_last_school VARCHAR(5) DEFAULT NULL,
                consent_text TEXT DEFAULT NULL,
                Documents_Submitted TEXT DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS primary_student_details (
                student_id INT(3) DEFAULT NULL,
                Uid VARCHAR(21) DEFAULT NULL,
                Name VARCHAR(50) DEFAULT NULL,
                Section VARCHAR(20) DEFAULT NULL,
                Gender VARCHAR(15) DEFAULT NULL,
                Surname VARCHAR(20) DEFAULT NULL,
                Middlename VARCHAR(20) DEFAULT NULL,
                Firstname VARCHAR(10) DEFAULT NULL,
                Mothername VARCHAR(20) DEFAULT NULL,
                Grno INT(4) DEFAULT NULL,
                Division VARCHAR(17) DEFAULT NULL,
                Standard VARCHAR(10) DEFAULT NULL,
                DOB VARCHAR(10) DEFAULT NULL,
                Age INT(2) DEFAULT NULL,
                POB VARCHAR(20) DEFAULT NULL,
                Mother_Tongue VARCHAR(20) DEFAULT NULL,
                Category VARCHAR(20) DEFAULT NULL,
                Caste VARCHAR(20) DEFAULT NULL,
                Last_School VARCHAR(69) DEFAULT NULL,
                Admission_Date VARCHAR(10) DEFAULT NULL,
                Address VARCHAR(17) DEFAULT NULL,
                Adhar_no BIGINT(13) DEFAULT NULL,
                Religion VARCHAR(20) DEFAULT NULL,
                Nationality VARCHAR(6) DEFAULT NULL,
                Domicile VARCHAR(11) DEFAULT NULL,
                Buss VARCHAR(30) DEFAULT NULL,
                Father_name VARCHAR(20) DEFAULT NULL,
                F_qualification VARCHAR(20) DEFAULT NULL,
                f_off_address VARCHAR(20) DEFAULT NULL,
                f_occupation VARCHAR(20) DEFAULT NULL,
                f_per_address VARCHAR(20) DEFAULT NULL,
                f_mobile_no VARCHAR(10) DEFAULT NULL,
                f_office_tel VARCHAR(10) DEFAULT NULL,
                Mother_name VARCHAR(20) DEFAULT NULL,
                M_Qualification VARCHAR(20) DEFAULT NULL,
                M_off_address VARCHAR(20) DEFAULT NULL,
                M_occupation VARCHAR(20) DEFAULT NULL,
                M_per_address VARCHAR(20) DEFAULT NULL,
                M_mobile_no VARCHAR(10) DEFAULT NULL,
                M_office_tel VARCHAR(10) DEFAULT NULL,
                Fees_group VARCHAR(1) DEFAULT NULL,
                Admission_fees INT(1) DEFAULT NULL,
                Tution_fees INT(4) DEFAULT NULL,
                Computer_fees INT(1) DEFAULT NULL,
                Fines INT(1) DEFAULT NULL,
                Term_fees INT(1) DEFAULT NULL,
                Extra_cur INT(1) DEFAULT NULL,
                Others INT(1) DEFAULT NULL,
                Total_fees INT(4) DEFAULT NULL,
                Fees_cycle VARCHAR(6) DEFAULT NULL,
                Blood_Group VARCHAR(4) DEFAULT NULL,
                admitted_class VARCHAR(10) DEFAULT NULL,
                Grand_father VARCHAR(20) DEFAULT NULL,
                Tution_fees_recived_by_cash VARCHAR(4) DEFAULT NULL,
                Privious_year_balance_Fees VARCHAR(1) DEFAULT NULL,
                Provisional_Adjustment VARCHAR(1) DEFAULT NULL,
                Tution_Fees_Received_by_Cheque VARCHAR(1) DEFAULT NULL,
                Tution_fee_Received_by_Cheque VARCHAR(1) DEFAULT NULL,
                Tution_Fee INT(5) DEFAULT NULL,
                transport_needed INT(11) DEFAULT NULL,
                transport_tagged VARCHAR(15) DEFAULT NULL,
                transport_pickup_drop VARCHAR(25) DEFAULT NULL,
                landmark VARCHAR(50) DEFAULT NULL,
                taluka VARCHAR(20) DEFAULT NULL,
                district VARCHAR(20) DEFAULT NULL,
                state VARCHAR(20) DEFAULT NULL,
                pin_code VARCHAR(10) DEFAULT NULL,
                guardian_name VARCHAR(50) DEFAULT NULL,
                guardian_contact VARCHAR(10) DEFAULT NULL,
                guardian_relation VARCHAR(50) DEFAULT NULL,
                guardian_address VARCHAR(255) DEFAULT NULL,
                guardian_landmark VARCHAR(50) DEFAULT NULL,
                guardian_pin_code VARCHAR(10) DEFAULT NULL,
                class_completed VARCHAR(20) DEFAULT NULL,
                percentage_last_school VARCHAR(5) DEFAULT NULL,
                consent_text TEXT DEFAULT NULL,
                Documents_Submitted TEXT DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS fee_categories (
                category_id INT(11) NOT NULL AUTO_INCREMENT,
                category_name VARCHAR(50) NOT NULL,
                description TEXT DEFAULT NULL,
                PRIMARY KEY (category_id)
            ) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
        },
        {
            query: `CREATE TABLE IF NOT EXISTS fee_structures (
                structure_id INT(11) NOT NULL AUTO_INCREMENT,
                category_id INT(11) NOT NULL,
                category_name VARCHAR(50) NOT NULL,
                class_grade VARCHAR(50) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                route_id INT(11) DEFAULT NULL,
                PRIMARY KEY (structure_id),
                KEY category_id (category_id)
            ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
        }
    ];

    try {
        for (const tableQuery of tableQueries) {
            await runQuery(req.connectionPool, tableQuery.query, []);
        }
        res.json({ success: true, message: 'Tables created or already exist.' });
    } catch (error) {
        console.error('Error creating tables:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

module.exports = router;