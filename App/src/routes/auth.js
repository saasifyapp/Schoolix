// const express = require('express');
// const router = express.Router();
// const mysql = require('mysql');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// // Create a MySQL connection by providong server and database for authentication purpose //
// const connection_auth = mysql.createConnection({
//     host: 'sql6.freesqldatabase.com',
//     user: 'sql6697807',
//     password: 'eEHGUaIHIJ',
//     database: 'sql6697807'
// });
// const JWT_SECRET = 'this_is_my_secret_key_which_is_highly_confidential';

// connection_auth.connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL database: ' + err.stack);
//         return;
//     }
//     console.log('Connected to MySQL database as id ' + connection_auth.threadId);
// });

// router.post('/login', (req, res) => {

//     // Taking username and password from Login Form and setting it to two variables
//     const { username, password } = req.body;
//     // Query the database to check if the user details entered in the login form exists in user_details table
//     const query = 'SELECT * FROM user_details WHERE loginName = ? AND loginPassword = ?';
//     connection_auth.query(query, [username, password], (error, results) => {
//         if (error) {
//             console.error('Error querying database:', error);
//             res.status(500).send('Internal Server Error');
//             return;
//         }

//         // Here results is returning a row datapacket which contains all columns data for specific user
//         // If a user with given credentials exists, set connection as global variable and pass the database credentials based on user//
//         if (results.length > 0) {
//             const user = results[0]; // Fetching user details and storing it to a variable for future use
//             // Assuming queryResults is an array of RowDataPacket objects
//             for (const row of results) {
//                 global.serverName = row.serverName;
//                 global.databaseUser = row.databaseUser;
//                 global.databasePassword = row.databasePassword;
//                 global.databaseName = row.databaseName;
//             }
//             global.connection = mysql.createConnection({
//                 host: serverName,
//                 user: databaseUser,
//                 password: databasePassword,
//                 database: databaseName
//             });

//             global.token = jwt.sign({ userId: user.userID }, JWT_SECRET, { expiresIn: '5m' });
//             // Save JWT to cookie
//             res.cookie('jwt', token, { httpOnly: false, maxAge: 300000 }); // Cookie expires in 1 hour    
//             res.redirect('/main_dashboard');

//         }
//         else {
//             res.redirect("/");
//         }
//     });
// });


// router.get('/get-variable', (req, res) => {
//     res.json({ token });
// });
// router.use(authenticateToken);

// // Middleware to authenticate JWT
// function authenticateToken(req, res, next) {
//     const token = req.cookies.jwt;
//     if (!token) {
//         return res.redirect('/');
//     }
//     jwt.verify(token, JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.redirect('/')
//         }
//         req.user = decoded;
//         next();
//     });
// }

// router.get('/logout', (req, res) => {
//     // Clear the JWT cookie by setting its expiration to a past date
//     res.clearCookie('jwt');
//     res.sendStatus(200); // Send success response
// });

// module.exports = router;