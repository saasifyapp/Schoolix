const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express();
const cors = require('cors'); // Import the cors middleware
const refreshTokens = []; // Define the refreshTokens array


 
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Allow requests from any origin
app.use(cors({
    origin: true, // Allow requests from any origin
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));



// Import path for device detection middleware
const deviceDetection = require('./src/middleware/deviceDetection'); 
  
// Use the device detection middleware
app.use(deviceDetection);

const logoutManager = require('./src/middleware/logoutManager');



// Configure dotenv to load the .env file from the  src directory
dotenv.config({ path: path.join(__dirname, 'src', '.env') });
// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, 'public')));


// Set up Express to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Define the connection_auth pool
const connection_auth = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    //idleTimeoutMillis: 30000 // 30 seconds
});

// Export connection_auth
module.exports = { connection_auth };

// Session configuration
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    checkExpirationInterval: 900000, // How frequently expired sessions will be cleared; 15 minutes.
    expiration: 7200000, // The maximum age of a valid session; 120 minutes (2 hours).
    createDatabaseTable: true, // Whether or not to create the sessions database table, if one does not already exist.
    connectionLimit: 20, // The maximum number of connections to create at once.
    endConnectionOnClose: true // Whether or not to end the database connection when the store is closed.
});

app.use(session({
    key: 'session_cookie',
    secret: 'your_secret_key', // Replace with your secret key
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
}));

const JWT_SECRET = 'this_is_my_secret_key_which_is_highly_confidential';

// Route to serve index.html for login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login', 'index.html'));
});

/*
const createSchoolTables = (connection) => {
    return new Promise((resolve, reject) => {
        const createTableQueries = [
            `CREATE TABLE IF NOT EXISTS pre_adm_registered_students (
                student_name varchar(25) NOT NULL,
                mobile_no varchar(10) NOT NULL,
                res_address varchar(25) NOT NULL,
                dob varchar(10) NOT NULL,
                standard varchar(8) DEFAULT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS pre_adm_admitted_students (
                student_name varchar(25) NOT NULL,
                mobile_no varchar(10) NOT NULL,
                res_address varchar(25) NOT NULL,
                dob varchar(10) NOT NULL,
                standard varchar(8) DEFAULT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS pre_adm_registered_teachers (
                teacher_name varchar(25) NOT NULL,
                mobile_no varchar(10) NOT NULL,
                res_address varchar(30) NOT NULL,
                dob varchar(10) NOT NULL,
                qualification varchar(30) NOT NULL,
                experience varchar(30) NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS pre_adm_admitted_teachers (
                teacher_name varchar(25) NOT NULL,
                mobile_no varchar(10) NOT NULL,
                res_address varchar(30) NOT NULL,
                dob varchar(10) NOT NULL,
                qualification varchar(30) NOT NULL,
                experience varchar(30) NOT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS inventory_book_details (
                sr_no int(11) NOT NULL AUTO_INCREMENT,
                title varchar(30) DEFAULT NULL,
                class_of_title varchar(25) DEFAULT NULL,
                purchase_price decimal(10,2) DEFAULT NULL,
                selling_price int(11) DEFAULT NULL,
                vendor varchar(30) DEFAULT NULL,
                ordered_quantity int(11) DEFAULT NULL,
                remaining_quantity int(11) DEFAULT NULL,
                returned_quantity int(11) DEFAULT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS inventory_uniform_details (
                sr_no int(11) NOT NULL AUTO_INCREMENT,
                uniform_item varchar(30) DEFAULT NULL,
                size_of_item varchar(10) DEFAULT NULL,
                purchase_price decimal(10,2) DEFAULT NULL,
                selling_price int(11) DEFAULT NULL,
                vendor varchar(30) DEFAULT NULL,
                ordered_quantity int(11) DEFAULT NULL,
                remaining_quantity int(11) DEFAULT NULL,
                returned_quantity int(11) DEFAULT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS inventory_vendor_details (
                sr_no int(11) NOT NULL AUTO_INCREMENT,
                vendor_name varchar(30) DEFAULT NULL,
                net_payable decimal(10,2) DEFAULT NULL,
                paid_till_now decimal(10,2) DEFAULT NULL,
                balance decimal(10,2) DEFAULT NULL,
                vendorFor varchar(20) DEFAULT NULL
            )`,
            `CREATE TABLE IF NOT EXISTS inventory_invoice_details (
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
            )`,
            `CREATE TABLE IF NOT EXISTS inventory_invoice_items (
                invoiceNo int(11) DEFAULT NULL,
                item_name varchar(30) DEFAULT NULL,
                quantity int(11) DEFAULT NULL,
                class_size varchar(15) DEFAULT NULL,
                type varchar(10) DEFAULT NULL,
                KEY invoiceNo (invoiceNo),
                CONSTRAINT inventory_invoice_items_ibfk_1 FOREIGN KEY (invoiceNo) REFERENCES inventory_invoice_details (invoiceNo)
            )`
        ];

        Promise.all(createTableQueries.map(query => {
            return new Promise((resolve, reject) => {
                connection.query(query, (err, result) => {
                    if (err) {
                        console.error('Error creating table:', err.stack);
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        }))
        .then(() => resolve())
        .catch(err => reject(err));
    });
};*/


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for user: ${username}`);

    const query = 'SELECT * FROM user_details WHERE loginName = ? AND loginPassword = ?';

    connection_auth.query(query, [username, password], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            console.log('Invalid username or password.');
            return res.status(401).send('Invalid username or password.');
        }

        const user = results[0];
        req.session.user = {
            username: user.LoginName,
            schoolName: user.schoolName
        };
        req.session.isSchool = true;
        req.session.dbCredentials = {
            host: user.serverName,
            user: user.databaseUser,
            password: user.databasePassword,
            database: user.databaseName
        };

         // Generate JWT token
         const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '2h' });
         res.cookie('jwt', token, { httpOnly: false, maxAge: 7200000  });

        // Set cookies
        res.cookie('username', username, { httpOnly: false, maxAge: 7200000  });
        res.cookie('schoolName', user.schoolName, { httpOnly: false, maxAge: 1000 * 60 * 60 * 2 });
        //res.cookie('jwt', 'your_generated_token', { httpOnly: false, maxAge: 1000 * 60 * 60 * 2 });

        

        console.log('User logged in and session created:', req.session.user);
        res.redirect('/dashboard');
        // Create tables if it's a school login
        /*if (req.session.isSchool) {
            const connection = mysql.createPool(req.session.dbCredentials);
            createSchoolTables(connection)
                .then(() => {
                    res.redirect('/dashboard');
                })
                .catch(err => {
                    console.error('Error creating tables:', err);
                    res.status(500).send('Error creating tables');
                });
        } else {
            res.redirect('/dashboard');
        }*/
    });
});

//Login endpoint for admin
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for admin user: ${username}`);

    const query = 'SELECT * FROM admin_details WHERE username = ? AND password = ?';

    connection_auth.query(query, [username, password], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            console.log('Invalid username or password.');
            return res.status(401).send('Invalid username or password.');
        }

        const admin = results[0];
        req.session.user = {
            username: admin.username
        };
        req.session.isSchool = false;
        req.session.dbCredentials = {
            host: admin.serverName,
            user: admin.databaseUser,
            password: admin.databasePassword,
            database: admin.databaseName
        };

        const token = jwt.sign({ userId: admin.userId }, JWT_SECRET, { expiresIn: '2h' });
        res.cookie('jwt', token, { httpOnly: true, maxAge: 7200000 });

        console.log('Admin user logged in and session created:', req.session.user);
        res.status(200).json({ message: 'Admin login successful', isAdmin: true });
    });
});



// Android APP login endpoint ////
app.post('/android-login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Android login attempt for user: ${username}`);

    const query = 'SELECT * FROM android_app_users WHERE username = ? AND password = ?';

    connection_auth.query(query, [username, password], (error, results) => {
        if (error) {
            console.error('Error querying database:', error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            console.log('Invalid username or password.');
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const user = results[0];
        const schoolName = user.school_name;

        const dbQuery = 'SELECT * FROM user_details WHERE schoolName = ?';

        connection_auth.query(dbQuery, [schoolName], (dbError, dbResults) => {
            if (dbError) {
                console.error('Error querying database:', dbError);
                return res.status(500).json({ message: 'Unauthorized Login. Please contact the school admin.' });
            }

            if (dbResults.length === 0) {
                console.log('No database details found for the school.');
                return res.status(404).json({ message: 'No database details found for the school. Please contact the admin.' });
            }

            const dbDetails = dbResults[0];

            // Generate JWT token with 6-hour lifespan
            const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '6h' });
            const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET);
            refreshTokens.push(refreshToken);

            res.json({
                accessToken,
                refreshToken,
                type: user.type, // Include user type in response
                name: user.name, // Include the original name in response
                dbCredentials: {
                    host: dbDetails.serverName,
                    user: dbDetails.databaseUser,
                    password: dbDetails.databasePassword,
                    database: dbDetails.databaseName
                }
            });
        });
    });
});

// Refresh token endpoint
app.post('/refresh-token', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.sendStatus(401);
    }
    if (!refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        const accessToken = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '6h' });
        res.json({ accessToken });
    });
});

///// ROUTES FOR ANDROID APP /////

const app_transportRoutes = require('./src/routes/android_app_routes/transport_routes/transport_getStudents');
app.use('/', app_transportRoutes);




// Function to Authenticate //

function authenticateToken(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
}


app.get('/get-variable', (req, res) => {
    res.json({ token });
});

app.use(authenticateToken);


app.post('/clear-cookies', (req, res) => {
    // Clear the cookies by setting their expiration to a past date
    res.clearCookie('jwt');
    res.clearCookie('schoolName');
    res.sendStatus(200); // Send a success response
    console.log("deleted by Tab")
});


// Route to handle logout
app.get('/logout', logoutManager);

app.get('/dashboard', authenticateToken, (req, res) => {
    // Serve the main_dashboard.html file
    res.sendFile(path.join(__dirname, 'public', 'Main_Dashboard', 'main_dashboard.html'));
});

app.get('/adminpanel', authenticateToken, (req, res) => {
    // Serve the main_dashboard.html file
    res.sendFile(path.join(__dirname, 'public', 'Login', 'admin.html'));
});



// Route to serve dashboard after login
app.get('/pre_adm_dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Pre_Admission_Console', 'pre_adm_dashboard.html'));
});
// Route to serve the Age Calculator HTML file
app.get('/pre_adm/age-calculator', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Pre_Admission_Console', 'age_calculator.html'));
});
// Route to serve the Student Details HTML file
app.get('/pre_adm/register-student', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Pre_Admission_Console', 'register_student.html'));
});
// Route to serve the Search Student HTML file
app.get('/pre_adm/search-student', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Pre_Admission_Console', 'search_student.html'));
});
// Route to serve the Register Teacher HTML file
app.get('/pre_adm/register-teacher', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Pre_Admission_Console', 'register_teacher.html'));
});
//Route to serve the Search Teacher HTML file
app.get('/pre_adm/search-teacher', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Pre_Admission_Console', 'search_teacher.html'));
});
// Serve HTML form
app.get('/pre_adm/admitted_student', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Pre_Admission_Console', 'admitted_student.html'));
});
//Serve HTML form
app.get('/pre_adm/admitted_teacher', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Pre_Admission_Console', 'admitted_teacher.html'));
});
//Serve HTML form
app.get('/inventory/purchase', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inventory', 'Inventory_purchase.html'));
});
//Serve HTML form
app.get('/inventory/billing', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inventory', 'Inventory_billingConsole.html'));
});

app.get('/inventory/generateInvoice', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inventory', 'Inventory_generateInvoice.html'));
});

//Serve HTML form
app.get('/inventory/reports', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inventory', 'Inventory_reports.html'));
});

//Serve HTML form
app.get('/inventory/searchInvoice', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inventory', 'Inventory_searchInvoice.html'));
});

//Serve HTML form
app.get('/inventory/invoiceReports', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inventory', 'Inventory_invoiceReports.html'));
});
//Serve HTML form
app.get('/Library/library_console', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Library', 'library_console.html'));
});

app.get('/Transport/transport_console', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Transport', 'transport_console.html'));
});

/////////////////////// ROUTES FOR MAIN DASHBOARD COMPONENTS ///////////////////////////////////////

// const main_dashboard_dataRouter = require('./src/routes/main_dashboard_data');
// app.use('/', main_dashboard_dataRouter);

// Middleware to conditionally include school routes
app.use((req, res, next) => {
    if (req.session.isSchool) {
        const schoolRouter = require('./src/routes/main_dashboard_data');
        app.use('/', schoolRouter);
    }
    next();
});


/////////////////////// ROUTES FOR SEARCH STUDENT COMPONENTS ///////////////////////////////////////

 const searchStudentRouter = require('./src/routes/universal_routes.js');
 app.use('/', searchStudentRouter);



////////////////////////////////////ADMIN CONSOLE //////////////////////////////////
//////////////////////Submit Credentials of Database ///////////////////////////////
app.post('/submit-config', (req, res) => {
    const { loginName, loginPassword, serverName, databaseUser, databasePassword, databaseName, schoolName } = req.body;

    const query = `
        INSERT INTO user_details (loginName, loginPassword, serverName, databaseUser, databasePassword, databaseName, schoolName, library_interval, library_penalty)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)
    `;
    
    connection_auth.query(query, [loginName, loginPassword, serverName, databaseUser, databasePassword, databaseName, schoolName], (err, result) => {
        if (err) {
            console.error('Error inserting data into user_details table:', err.stack);
            return res.status(500).json({ message: 'Error inserting data into user_details table' });
        }
        res.status(200).json({ message: 'Configuration submitted successfully', data: result });
    });
});

//////////////////////// STUDENT CONSOLE////////////////////////////////
// Import the router for handling student details submission
const submitStudentRouter = require('./src/routes/pre_admission_console_routes/student_details');
app.use('/', submitStudentRouter);

// Import the router for displaying student data
const displayStudentRouter = require('./src/routes/pre_admission_console_routes/display_students');
// Mount the student display router to the root path
app.use('/', displayStudentRouter);

////////// ADMITTED STUDENTS
// Import the router for displaying admitted students
const displayadmStudentRouter = require('./src/routes/pre_admission_console_routes/admitted_student');
// Mount the admitted student display router to the root path
app.use('/', displayadmStudentRouter);

//////////////////////// TEACHER CONSOLE////////////////////////////////
// Import the router for handling teacher details submission
const submitTeacherRouter = require('./src/routes/pre_admission_console_routes/teacher_details');
// Mount the teacher details submission router to the root path
app.use('/', submitTeacherRouter);

// Import the router for displaying teacher data
const displayTeacherRouter = require('./src/routes/pre_admission_console_routes/display_teacher');
// Mount the teacher display router to the root path
app.use('/', displayTeacherRouter);

////////// ADMITTED TEACHERS
// Import the router for displaying admitted teachers
const displayadmTeacherRouter = require('./src/routes/pre_admission_console_routes/admitted_teacher');
// Mount the admitted teacher display router to the root path
app.use('/', displayadmTeacherRouter);


/////////////////////// ROUTES FOR INVENTORY MODULE ///////////////////////////////////////

///ADD VENDOR ROUTE
const addVendorDataRouter = require('./src/routes/Inventory_routes/add_vendor');
app.use('/', addVendorDataRouter);


//////ADD BOOK ROUTE
const addBookDataRouter = require('./src/routes/Inventory_routes/add_books');
app.use('/', addBookDataRouter);

//////ADD UNIFORM ROUTE
const addUniformDataRouter = require('./src/routes/Inventory_routes/add_uniform');
app.use('/', addUniformDataRouter);

//////PURCHASE REPORT ROUTE
const purchaseReportsRouter = require('./src/routes/Inventory_routes/purchase_reports');
app.use('/', purchaseReportsRouter);


//////GENERATE INVOICE ROUTE
const generateInvoiceRouter = require('./src/routes/Inventory_routes/generate_invoice');
app.use('/', generateInvoiceRouter);

//////SEARCH INVOICE ROUTE
const searchInvoiceRouter = require('./src/routes/Inventory_routes/search_invoice');
app.use('/', searchInvoiceRouter);
 

////// INVOICE REPORT ROUTE
const invoiceReportRouter = require('./src/routes/Inventory_routes/invoice_reports');
app.use('/', invoiceReportRouter);


////////////////////////////////// LIBRARY ROUTES ///////////////////////////////////

////// ADD LIBRARY BOOK ROUTE
const addlibrarybookRouter = require('./src/routes/library_routes/add_library_books');
app.use('/', addlibrarybookRouter);

////// ADD LIBRARY MEMBER ROUTE
const addlibrarymemberRouter = require('./src/routes/library_routes/add_library_members');
app.use('/', addlibrarymemberRouter);

////// ISSUE BOOKS ROUTE
const issueBooksRouter = require('./src/routes/library_routes/issue_books');
app.use('/', issueBooksRouter);

////// RETURN BOOKS ROUTE
const returnBooksRouter = require('./src/routes/library_routes/return_books');
app.use('/', returnBooksRouter);

////// SEARCH TRANSACTION ROUTE
const searchTransactionRouter = require('./src/routes/library_routes/search_transaction');
app.use('/', searchTransactionRouter);

////// PENALTY PROCESSOR ROUTE
const penaltyProcessorRouter = require('./src/routes/library_routes/penalty_processor');
app.use('/', penaltyProcessorRouter);

////// REPORTS ROUTE
const libraryReportsRouter = require('./src/routes/library_routes/library_reports');
app.use('/', libraryReportsRouter);


///////////////////////////////// TRANSPORT ROUTES /////////////////////////////

////// DRIVER CONDUCTOR ROUTE
const transportDriverConductorRouter = require('./src/routes/transport_routes/add_driver_conductor');
app.use('/', transportDriverConductorRouter);

////// Create/Manage Bus Route ROUTE
const transportManageRouteRouter = require('./src/routes/transport_routes/manage_route');
app.use('/', transportManageRouteRouter);

////// Create/Manage Shift ROUTE
const transportManageShiftRouter = require('./src/routes/transport_routes/manage_shift');
app.use('/', transportManageShiftRouter);

////// Manage TAG ROUTE SHIFT VEHICLE ROUTE
const transporttagRouteSHiftVehicle = require('./src/routes/transport_routes/tag_route_shift_vehicle');
app.use('/', transporttagRouteSHiftVehicle);

////// ALLOCATE VEHICLE ROUTE 
const transportAllocateVehicle = require('./src/routes/transport_routes/allocate_vehicle.js');
app.use('/', transportAllocateVehicle);


////// LIST STUDENTS ROUTE
const transportGetStudentsDetails = require('./src/routes/transport_routes/get_student_details.js');
app.use('/', transportGetStudentsDetails);


////// ANDROID APP ROUTES ///




// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});