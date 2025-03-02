const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);



// Auto-generate Library Members
router.post('/library/autoGenerateLibraryMembers', (req, res) => {
    // Query to insert or update student library members
    const insertOrUpdateStudentsQuery = `
        INSERT INTO library_member_details (memberID, member_name, member_contact, member_class, books_issued)
        SELECT 
            CONCAT('M', LPAD(student_id, (SELECT LENGTH(MAX(student_id)) FROM primary_student_details), '0')) AS memberID, 
            Name AS member_name, 
            f_mobile_no AS member_contact, 
            Standard AS member_class, 
            0 AS books_issued -- Assuming no books issued by default, adjust as necessary
        FROM primary_student_details
        WHERE is_active = 1
        ORDER BY student_id
        ON DUPLICATE KEY UPDATE
            member_name = VALUES(member_name),
            member_contact = VALUES(member_contact),
            member_class = VALUES(member_class);
    `;

    // Query to delete library members who are no longer active students
    const deleteStudentsQuery = `
        DELETE FROM library_member_details
        WHERE memberID LIKE 'M%' AND memberID NOT IN (
            SELECT CONCAT('M', LPAD(student_id, (SELECT LENGTH(MAX(student_id)) FROM primary_student_details), '0'))
            FROM primary_student_details
            WHERE is_active = 1
        );
    `;

    // Query to insert or update teacher library members
    const insertOrUpdateTeachersQuery = `
        INSERT INTO library_member_details (memberID, member_name, member_contact, member_class, books_issued)
        SELECT 
            CONCAT('T', LPAD(id, 3, '0')) AS memberID, 
            name AS member_name, 
            mobile_no AS member_contact, 
            'Teacher' AS member_class, 
            0 AS books_issued -- Assuming no books issued by default, adjust as necessary
        FROM teacher_details
        WHERE is_active = 1
        ORDER BY id
        ON DUPLICATE KEY UPDATE
            member_name = VALUES(member_name),
            member_contact = VALUES(member_contact),
            member_class = VALUES(member_class);
    `;

    // Query to delete library members who are no longer active teachers
    const deleteTeachersQuery = `
        DELETE FROM library_member_details
        WHERE memberID LIKE 'T%' AND memberID NOT IN (
            SELECT CONCAT('T', LPAD(id, 3, '0'))
            FROM teacher_details
            WHERE is_active = 1
        );
    `;

    req.connectionPool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting database connection:', err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                console.error('Error starting transaction:', err);
                return res.status(500).json({ error: 'Transaction error' });
            }

            // Step 1: Insert or update student library members
            connection.query(insertOrUpdateStudentsQuery, (err, results) => {
                if (err) {
                    console.error('Error auto-generating student members:', err);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: 'Error auto-generating student members' });
                    });
                }

                // Step 2: Delete inactive students from library members
                connection.query(deleteStudentsQuery, (err, results) => {
                    if (err) {
                        console.error('Error deleting student members:', err);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: 'Error deleting student members' });
                        });
                    }

                    // Step 3: Insert or update teacher library members
                    connection.query(insertOrUpdateTeachersQuery, (err, results) => {
                        if (err) {
                            console.error('Error auto-generating teacher members:', err);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: 'Error auto-generating teacher members' });
                            });
                        }

                        // Step 4: Delete inactive teachers from library members
                        connection.query(deleteTeachersQuery, (err, results) => {
                            if (err) {
                                console.error('Error deleting teacher members:', err);
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: 'Error deleting teacher members' });
                                });
                            }

                            // Commit the transaction
                            connection.commit(err => {
                                if (err) {
                                    console.error('Error committing transaction:', err);
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ error: 'Transaction commit error' });
                                    });
                                }

                                connection.release();
                                res.status(200).json({ message: 'Library members auto-generated and synchronized successfully' });
                            });
                        });
                    });
                });
            });
        });
    });
});

// Display All Members
router.get('/library/members', (req, res) => {
    const query = `SELECT * FROM library_member_details ORDER BY memberID`;

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
