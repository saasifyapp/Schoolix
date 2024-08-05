const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Add Member Endpoint
router.post('/library/add_member', (req, res) => {
    const { member_name, memberID, member_class, contact } = req.body;

    const query = `INSERT INTO library_member_details 
                   (member_name, memberID, member_class, member_contact, books_issued) 
                   VALUES (?, ?, ?, ?, 0)`;

    req.connectionPool.query(query, [member_name, memberID, member_class, contact], (err, result) => {
        if (err) {
            console.error('Error adding member:', err);
            return res.status(500).json({ error: 'Error adding member' });
        }
        res.status(201).json({ message: 'Member added successfully', memberId: result.insertId });
    });
});

// Display All Members
router.get('/library/members', (req, res) => {
    const query = `SELECT * FROM library_member_details`;

    req.connectionPool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching members:', err);
            return res.status(500).json({ error: 'Error fetching members' });
        }
        res.status(200).json(results);
    });
});

// Update Member Endpoint
router.put('/library/member/:id', (req, res) => {
    const memberID = req.params.id;
    const { member_name, member_contact, member_class } = req.body;

    const query = `
        UPDATE library_member_details 
        SET member_name = ?, member_contact = ?, member_class = ?
        WHERE memberID = ?
    `;

    req.connectionPool.query(query, [member_name, member_contact, member_class, memberID], (err, result) => {
        if (err) {
            console.error('Error updating member details:', err);
            return res.status(500).json({ error: 'Error updating member details' });
        }
        res.status(200).json({ message: 'Member details updated successfully' });
    });
});

// Retrieve Member Info Endpoint
router.get('/library/member/:id', (req, res) => {
    const memberID = req.params.id;

    const query = `
        SELECT memberID, member_name, member_contact, member_class, books_issued 
        FROM library_member_details 
        WHERE memberID = ?
    `;

    req.connectionPool.query(query, [memberID], (err, results) => {
        if (err) {
            console.error('Error retrieving member details:', err);
            return res.status(500).json({ error: 'Error retrieving member details' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.status(200).json({ member: results[0] });
    });
});


// Delete Book Endpoint
router.delete('/library/member/:memberID', (req, res) => {
    const memberID = req.params.memberID;

    const query = `DELETE FROM library_member_details WHERE memberID = ?`;

    req.connectionPool.query(query, [memberID], (err, result) => {
        if (err) {
            console.error('Error deleting member:', err);
            return res.status(500).json({ error: 'Error deleting member' });
        }
        res.status(200).json({ message: 'Member deleted successfully' });
    });
});

// Search Members Endpoint
router.get('/library/members/search', (req, res) => {
    const searchTerm = req.query.search;

    const query = `
        SELECT * FROM library_member_details
        WHERE memberID LIKE ? OR member_name LIKE ?
    `;

    const values = [`%${searchTerm}%`, `%${searchTerm}%`];

    req.connectionPool.query(query, values, (err, results) => {
        if (err) {
            console.error('Error searching members:', err);
            return res.status(500).json({ error: 'Error searching members' });
        }
        res.status(200).json(results);
    });
});


module.exports = router;
