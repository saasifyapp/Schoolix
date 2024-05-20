const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
app.use(cookieParser()); 

const scheduledTask = require('../App/src/routes/scheduledTask'); // Import the scheduled task module





// Configure dotenv to load the .env file from the  src directory
dotenv.config({ path: path.join(__dirname, 'src', '.env') });
// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html for login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login', 'index.html'));
});

// Set up Express to parse request bodies
app.use(express.urlencoded({ extended: true }));


///////////////////////////////// AUTHENTICATION //////////////////////////

// const connection_auth = mysql.createPool({
//     connectionLimit: 10, // Adjust this value based on your application's needs
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME
// });

const JWT_SECRET = 'this_is_my_secret_key_which_is_highly_confidential';

// // Testing the connection
// connection_auth.getConnection((err, connection_auth) => {
//     if (err) {
//         console.error('Error connecting to MySQL database:', err);
//         return;
//     }
//     console.log('Connected to MySQL database as id', connection_auth.threadId);
//     connection_auth.release(); // Release the connection as it's just for testing the connection
// });

app.post('/login', (req, res) => {

    const { username, password } = req.body;
    const query = 'SELECT * FROM user_details WHERE loginName = ? AND loginPassword = ?';

    if (req.cookies.jwt && req.cookies.schoolName && req.cookies.username == username) {
        console.log("same user logged in to new tab | NO NEW CONNECTION ESTABLISHED")
        res.redirect('/dashboard');
    }

    else {

        // Create a new connection pool for authentication
        const connection_auth = mysql.createPool({
            connectionLimit: 10,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });


        // Testing the connection
        connection_auth.getConnection((err, connection) => {
            if (err) {
                console.error('Error connecting to MySQL database:', err);
                return res.status(500).send('Internal Server Error');
            }
            console.log('Connected to user(demo) database as id', connection.threadId);
            connection.release(); // Release the connection as it's just for testing the connection

            // Proceed with authentication after successful connection
            connection_auth.getConnection((err, connection) => {
                if (err) {
                    console.error('Error getting connection from pool:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                connection.query(query, [username, password], (error, results) => {
                    connection.release(); // Release the connection back to the pool

                    if (error) {
                        console.error('Error querying database:', error);
                        res.status(500).send('Internal Server Error');
                        return;
                    }

                    // Check if a session is already active
                    if (req.cookies.jwt && req.cookies.schoolName) {
                        if (!results.length === 0) {
                            console.log("A session is already active. Please close that session to continue.");
                            res.status(402).send('A session is already active. Please close that session to continue.');
                            return;
                        }
                    }

                    // If no user found with given credentials
                    if (results.length === 0) {
                        res.status(401).send('Invalid username or password.');
                        if (connection_auth) {
                            connection_auth.end((err) => {
                                if (err) {
                                    console.error('Error closing MySQL connection:', err);
                                } else {
                                    console.log('User(demo) database disconnected.');
                                }
                            });
                        }
                        return;
                    }

                    // Close the connection pool of demo database after 5 seconds
                    setTimeout(() => {
                        connection_auth.end((err) => {
                            if (err) {
                                console.error('Error closing connection pool:', err);
                                return;
                            }
                            console.log('User(demo) database disconnected after 5 sec.');
                        });
                    }, 5000); // 5000 milliseconds = 5 seconds

                    // Assuming only one user is found with given credentials
                    const user = results[0];
                    const { serverName, databaseUser, databasePassword, databaseName, schoolName, LoginName } = user;

                    // Create a connection using user's database credentials
                    if (!global.connection) {
                    global.connection = mysql.createPool({
                        host: serverName,
                        user: databaseUser,
                        password: databasePassword,
                        database: databaseName
                    });
                }

                    // Generate JWT token
                    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '2h' });

                    // Save JWT and schoolName to cookies
                    res.cookie('schoolName', schoolName, { maxAge: 7200000  });
                    res.cookie('jwt', token, { httpOnly: false, maxAge: 7200000  });
                    res.cookie('username', LoginName, { httpOnly: false, maxAge: 7200000  });

                    // Redirect to dashboard
                    res.redirect('/dashboard');
                });
            });
        });
    };
});



app.get('/get-variable', (req, res) => {
    res.json({ token });
});
app.use(authenticateToken);


// Route to serve main_dashboard after login
app.get('/dashboard', authenticateToken, (req, res) => {
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
    res.sendFile(path.join(__dirname, 'public', 'Inventory', 'Inventory_billing.html'));
});
//Serve HTML form
app.get('/inventory/reports', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Inventory', 'Inventory_reports.html'));
});


// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const token = req.cookies.jwt;
    const schoolNameCookie = req.cookies.schoolName;
    const usernameCookie = req.cookies.username;

    if (!schoolNameCookie || !usernameCookie) {
        return res.redirect('/');
    }

    // If you need to use the JWT token for further processing, you can include it here
    if (!token) {
        return res.redirect('/');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            res.clearCookie('jwt');
            res.clearCookie('schoolName');
            return res.redirect('/')
        }
        req.user = decoded;
        next();
    });
}

app.post('/clear-cookies', (req, res) => {
    // Clear the cookies by setting their expiration to a past date
    res.clearCookie('jwt');
    res.clearCookie('schoolName');
    res.sendStatus(200); // Send a success response
    console.log("deleted by Tab")
});


// Logout route
app.get('/logout', (req, res) => {
    // Clear the JWT cookie by setting its expiration to a past date
    res.clearCookie('jwt');
    res.clearCookie('schoolName');
    res.clearCookie('username');

    // Close the MySQL connection
    if (global.connection) {
        global.connection.end((err) => {
            if (err) {
                console.error('Error closing MySQL connection:', err);
            } else {
                console.log('School database disconnected on signout.');
            }
        });
    }

    // // Close the MySQL connection
    // if (connection_auth) {
    //     connection_auth.end((err) => {
    //         if (err) {
    //             console.error('Error closing MySQL connection:', err);
    //         } else {
    //             console.log('MySQL connection closed successfully.');
    //         }
    //     });
    // }

    res.redirect('/');
});

//////////////////////// STUDENT CONSOLE////////////////////////////////
// Import the router for handling student details submission
const submitStudentRouter = require('./src/routes/pre_admission_console_routes/student_details');
// Mount the student details submission router to the root path
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


/////////////////////// ROUTES FOR MAIN DASHBOARD COMPONENTS ///////////////////////////////////////

const main_dashboard_dataRouter = require('./src/routes/main_dashboard_data');
// Mount the student details submission router to the root path
app.use('/', main_dashboard_dataRouter);
 

/////////////////////// Call a Scheduled Task to send a ping to own server every 25 mins ///////////////////////////////////////

// scheduledTask();

/////////////////////// ROUTES FOR INVENTORY MODULE ///////////////////////////////////////
///ADD VENDOR ROUTE
const addVendorDataRouter = require('./src/routes/Inventory_routes/add_vendor');
// Mount the student details submission router to the root path
app.use('/', addVendorDataRouter);


//////ADD BOOK ROUTE
const addBookDataRouter = require('./src/routes/Inventory_routes/add_books');
// Mount the student details submission router to the root path
app.use('/', addBookDataRouter);

//////ADD UNIFORM ROUTE
const addUniformDataRouter = require('./src/routes/Inventory_routes/add_uniform');
// Mount the student details submission router to the root path
app.use('/', addUniformDataRouter);

//////PURCHASE REPORT ROUTE
const purchaseReportsRouter = require('./src/routes/Inventory_routes/purchase_reports');
// Mount the student details submission router to the root path
app.use('/', purchaseReportsRouter);

 


// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});