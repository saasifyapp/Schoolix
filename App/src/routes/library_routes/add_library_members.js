const express = require('express');
const router = express.Router();

// Add Member Endpoint
router.post('/library/add_member', (req, res) => {
    const { student_name, enrollment_number, student_class, semester, contact } = req.body;

    const query = `INSERT INTO Library_member_details 
                   (student_name, enrollment_number, class, semester, contact) 
                   VALUES (?, ?, ?, ?, ?)`;

    req.connectionPool.query(query, [student_name, enrollment_number, student_class, semester, contact], (err, result) => {
        if (err) {
            console.error('Error adding member:', err);
            return res.status(500).json({ error: 'Error adding member' });
        }
        res.status(201).json({ message: 'Member added successfully', memberId: result.insertId });
    });
});

// Display All Members
router.get('/library/members', (req, res) => {
    const query = `SELECT * FROM Library_member_details`;

    req.connectionPool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching members:', err);
            return res.status(500).json({ error: 'Error fetching members' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;