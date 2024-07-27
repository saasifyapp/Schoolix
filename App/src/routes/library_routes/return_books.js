const express = require('express');
const router = express.Router();

// Fetch Return Book Details Endpoint
router.post('/library/get_return_details', (req, res) => {
    const { inputType, studentOrBookNo } = req.body;

    const studentQuery = `SELECT member_name, member_contact, member_class, books_issued FROM library_member_details WHERE memberID = ?`;
    const bookQuery = `SELECT book_name, book_author, book_publication, available_quantity FROM library_book_details WHERE bookID = ?`;

    // This is a reverse scenario.
    // If Student Enrollment No is entered - Search for Books that the student has taken
    // If Book Number is entered - Search for the students who have taken that book

    const issueDetailsByStudentQuery = `SELECT id, bookID, book_name, book_author, book_publication, issue_date, return_date FROM library_transactions WHERE memberID = ?`;
const issueDetailsByBookQuery = `SELECT id, memberID, member_name, member_class, member_contact, issue_date, return_date FROM library_transactions WHERE bookID = ?`;

const formatDateToIST = (date) => {
    const istDate = new Date(date);
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

if (inputType === 'student') {
    req.connectionPool.query(studentQuery, [studentOrBookNo], (err, studentResult) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching student details' });
        }

        if (studentResult.length > 0) {
            const student = studentResult[0];
            req.connectionPool.query(issueDetailsByStudentQuery, [studentOrBookNo], (err, issueResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Error fetching issue details by student' });
                }

                // Format issue and return dates to IST format
                issueResult.forEach(issue => {
                    issue.issue_date = formatDateToIST(issue.issue_date);
                    issue.return_date = formatDateToIST(issue.return_date);
                });

                return res.status(200).json({
                    type: 'student',
                    details: student,
                    issues: issueResult
                });
            });
        } else {
            return res.status(404).json({ error: 'No details found for the provided student enrollment number' });
        }
    });
} else if (inputType === 'book') {
    req.connectionPool.query(bookQuery, [studentOrBookNo], (err, bookResult) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching book details' });
        }

        if (bookResult.length > 0) {
            const book = bookResult[0];
            req.connectionPool.query(issueDetailsByBookQuery, [studentOrBookNo], (err, issueResult) => {
                if (err) {
                    return res.status(500).json({ error: 'Error fetching issue details by book' });
                }

                // Format issue and return dates to IST format
                issueResult.forEach(issue => {
                    issue.issue_date = formatDateToIST(issue.issue_date);
                    issue.return_date = formatDateToIST(issue.return_date);
                });

                return res.status(200).json({
                    type: 'book',
                    details: book,
                    issues: issueResult
                });
            });
        } else {
            return res.status(404).json({ error: 'No details found for the provided book number' });
        }
    });
} else {
    return res.status(400).json({ error: 'Invalid input type' });
}
});



const formatDateToIST = (date) => {
    const istDate = new Date(date);
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Return Book Endpoint
router.post('/library/return_book', (req, res) => {
    const { id } = req.body;

    const getIssueQuery = `SELECT * FROM library_transactions WHERE id = ?`;
    const deleteIssueQuery = `DELETE FROM library_transactions WHERE id = ?`;
    const updateMemberQuery = `UPDATE library_member_details SET books_issued = books_issued - 1 WHERE memberID = ?`;
    const updateBookQuery = `UPDATE library_book_details SET available_quantity = available_quantity + 1 WHERE bookID = ?`;
    const logReturnTransactionQuery = `INSERT INTO library_transaction_log (transaction_type, memberID, bookID, transaction_date) VALUES ('return', ?, ?, ?)`;

    req.connectionPool.query(getIssueQuery, [id], (err, issueResult) => {
        if (err) {
            console.error('Error fetching issue details:', err);
            return res.status(500).json({ error: 'Error fetching issue details' });
        }

        if (issueResult.length === 0) {
            console.error('Issue record not found');
            return res.status(404).json({ error: 'Issue record not found' });
        }

        const issue = issueResult[0];
        req.connectionPool.query(deleteIssueQuery, [id], (err) => {
            if (err) {
                console.error('Error deleting issue record:', err);
                return res.status(500).json({ error: 'Error deleting issue record' });
            }

            req.connectionPool.query(updateMemberQuery, [issue.memberID], (err) => {
                if (err) {
                    console.error('Error updating member details:', err);
                    return res.status(500).json({ error: 'Error updating member details' });
                }

                req.connectionPool.query(updateBookQuery, [issue.bookID], (err) => {
                    if (err) {
                        console.error('Error updating book details:', err);
                        return res.status(500).json({ error: 'Error updating book details' });
                    }

                    const transactionDate = formatDateToIST(new Date());
                    req.connectionPool.query(logReturnTransactionQuery, [issue.memberID, issue.bookID, transactionDate], (err) => {
                        if (err) {
                            console.error('Error logging return transaction:', err);
                            return res.status(500).json({ error: 'Error logging return transaction' });
                        }

                        res.status(200).json({ message: 'Book returned successfully' });
                    });
                });
            });
        });
    });
});

module.exports = router;