const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);



// Auto-generate Library Members
router.post('/library/autoGenerate_library_members', (req, res) => {
    const query = `
        INSERT INTO library_member_details (memberID, member_name, member_contact, member_class, books_issued)
        SELECT CONCAT('M', LPAD(student_id, (SELECT LENGTH(MAX(student_id)) FROM primary_student_details), '0')) AS memberID, 
                Name AS member_name, 
                f_mobile_no AS member_contact, 
                Standard AS member_class, 
                0 AS books_issued -- Assuming no books issued by default, adjust as necessary
        FROM primary_student_details
        ON DUPLICATE KEY UPDATE
            member_name = VALUES(member_name),
            member_contact = VALUES(member_contact),
            member_class = VALUES(member_class)
    `;

    req.connectionPool.query(query, (err, results) => {
        if (err) {
            console.error('Error auto-generating members:', err);
            return res.status(500).json({ error: 'Error auto-generating members' });
        }
        res.status(200).json({ message: 'Library members auto-generated successfully', results });
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




////////////////////////////////// BELOW CODE OF ADD/UPDATE/DELETE MEMBER IS ORPHANED FOR NOW ///////////////////////////

// Date - 17/FEB/2025
// ADDED BY YASH INGALE
//  AUTOGENERATE FUNCTIONALITY SKIPS MANUALL ADDING OF LIBRARY MEMBERS


/*

// Add Member Endpoint
router.post('/library/add_member', (req, res) => {
    const { member_name, memberID, member_class, contact } = req.body;

    // Check if memberID already exists
    const checkMemberIDQuery = 'SELECT COUNT(*) AS count FROM library_member_details WHERE memberID = ?';
    req.connectionPool.query(checkMemberIDQuery, [memberID], (err, results) => {
        if (err) {
            console.error('Error checking existing memberID:', err);
            return res.status(500).json({ error: 'Error checking existing memberID' });
        }

        if (results[0].count > 0) {
            return res.status(400).json({ error: 'Member ID already exists' });
        }

        // Check if member_name already exists in the same class
        const checkMemberNameQuery = `
            SELECT COUNT(*) AS count
            FROM library_member_details
            WHERE member_name = ? AND member_class = ?
        `;
        req.connectionPool.query(checkMemberNameQuery, [member_name, member_class], (err, results) => {
            if (err) {
                console.error('Error checking existing member name in the same class:', err);
                return res.status(500).json({ error: 'Error checking existing member name' });
            }

            if (results[0].count > 0) {
                return res.status(400).json({ error: 'Member name already exists in the same class' });
            }

            // Proceed with adding the new member
            const insertQuery = `
                INSERT INTO library_member_details 
                (member_name, memberID, member_class, member_contact, books_issued) 
                VALUES (?, ?, ?, ?, 0)
            `;
            req.connectionPool.query(insertQuery, [member_name, memberID, member_class, contact], (err, result) => {
                if (err) {
                    console.error('Error adding member:', err);
                    return res.status(500).json({ error: 'Error adding member' });
                }
                res.status(201).json({ message: 'Member added successfully', memberId: result.insertId });
            });
        });
    });
});

*/

/*

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
*/

/*

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

*/


module.exports = router;
