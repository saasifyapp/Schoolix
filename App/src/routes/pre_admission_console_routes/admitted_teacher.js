// const express = require('express');
// const router = express.Router();
// const mysql = require('mysql');


// const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// // Use the connection manager middleware
// router.use(connectionManager);


// // Display Admitted DATA
// // Add a new endpoint to retrieve teacher data // READ FROM DATABASE

// router.get('/admitted_teachers', (req, res) => {
//     const query = 'SELECT * FROM pre_adm_admitted_teachers';
//     req.connectionPool .query(query, (err, rows) => {
//         if (err) {
//             console.error('Error fetching data: ' + err.stack);
//             res.status(500).json({ error: 'Error fetching data' });
//             return;
//         }
//         res.json(rows);
//     });
// });

// // Add a new endpoint to handle search queries (teachers)
// router.get("/admitted_teachers/search", (req, res) => {
//     const searchQuery = req.query.search.trim(); // Get the search query from request URL query parameters

//     // Construct the SQL query to filter based on the student name
//     let query = `SELECT * FROM pre_adm_admitted_teachers WHERE teacher_name LIKE ?`;

//     // Execute the SQL query
//     req.connectionPool .query(query, [`%${searchQuery}%`], (err, rows) => {
//         if (err) {
//             console.error("Error fetching data: " + err.stack);
//             res.status(500).json({ error: "Error fetching data" });
//             return;
//         }
//         res.json(rows);
//     });


// });

// // Endpoint to remove a teacher
// router.delete("/remove-adm-teacher", (req, res) => {
//     const teacherName = req.query.name;
//     const mobileNo = req.query.mobile;

//     // Construct the SQL query to delete the teacher from the database
//     const query = `DELETE FROM pre_adm_admitted_teachers WHERE teacher_name = ? AND mobile_no = ? LIMIT 1`;

//     // Execute the SQL query with the teacher's name and mobile number as parameters
//     req.connectionPool .query(query, [teacherName, mobileNo], (err, result) => {
//         if (err) {
//             console.error("Error removing teacher:", err);
//             return res.status(500).send("Error removing teacher");
//         }
//         if (result.affectedRows === 0) {
//             // If no teacher was deleted (i.e., teacher not found), send a 404 response
//             return res.status(404).send("Teacher not found");
//         }
//         console.log("Teacher removed:", result);
//         // Send a success response
//         res.status(200).send("Teacher removed successfully");
//     });
// });


// module.exports = router;