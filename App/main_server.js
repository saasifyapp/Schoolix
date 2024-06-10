const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express();
 
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



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
    connectionLimit: 10,
    queueLimit: 0
});

// Session configuration
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
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
    });
});


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


app.get('/logout', (req, res) => {
    // Log the username of the user logging out
    console.log('User logged out:', req.session.user.username);

    // Clear cookies
    res.clearCookie('jwt');
    res.clearCookie('schoolName');
    res.clearCookie('username');
    res.clearCookie('session_cookie');

    // If the user has a userConnectionPool, end it
    if (req.session.userConnectionPool) {
        req.session.userConnectionPool.end((err) => {
            if (err) {
                console.error('Error closing MySQL connection:', err);
            } else {
                console.log('User-specific database disconnected on signout.');
            }
        });
    }

    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
    });

    // Redirect to the home page
    res.redirect('/');
});



app.get('/dashboard', authenticateToken, (req, res) => {
    // Serve the main_dashboard.html file
    res.sendFile(path.join(__dirname, 'public', 'Main_Dashboard', 'main_dashboard.html'));
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

/////////////////////// ROUTES FOR MAIN DASHBOARD COMPONENTS ///////////////////////////////////////

const main_dashboard_dataRouter = require('./src/routes/main_dashboard_data');
app.use('/', main_dashboard_dataRouter);


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


// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});