const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Helper function to format today's date to local date format `dd-mm-yyyy`
const formatDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

// Define the get-daily-attendance endpoint
router.post('/get-daily-attendance', async (req, res) => {
    try {
        const today = formatDate();

        const sqlQuery = `
            SELECT user_id, name, section, standard_division, date_of_attendance, 
                   MIN(in_time) AS in_time, 
                   MAX(in_time) AS out_time
            FROM attendance_user_logs
            WHERE section <> 'Visitor' AND date_of_attendance = ?
            GROUP BY user_id, name, section, standard_division, date_of_attendance
            UNION ALL
            -- Query for Combined Visitor Records
            SELECT 'Unavailable' AS user_id, 'Unavailable' AS name, 'Visitor' AS section, 
                   'Unavailable' AS standard_division, date_of_attendance, 
                   MIN(in_time) AS in_time, 
                   MAX(in_time) AS out_time
            FROM attendance_user_logs
            WHERE section = 'Visitor' AND date_of_attendance = ?
            GROUP BY date_of_attendance, in_time;
        `;

        req.connectionPool.query(sqlQuery, [today, today], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Database query failed' });
            }

            res.status(200).json({ data: results });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Define the get-attendance-summary endpoint
router.post('/get-attendance-summary', async (req, res) => {
    try {
        const sqlQuery = `
            SELECT user_id, name, section, standard_division, date_of_attendance, 
                   MIN(in_time) AS in_time, 
                   MAX(in_time) AS out_time
            FROM attendance_user_logs
            WHERE section <> 'Visitor'
            GROUP BY user_id, name, section, standard_division, date_of_attendance
            UNION ALL
            -- Query for Combined Visitor Records
            SELECT 'Unavailable' AS user_id, 'Unavailable' AS name, 'Visitor' AS section, 
                   'Unavailable' AS standard_division, date_of_attendance, 
                   MIN(in_time) AS in_time, 
                   MAX(in_time) AS out_time
            FROM attendance_user_logs
            WHERE section = 'Visitor'
            GROUP BY date_of_attendance, in_time;
        `;

        req.connectionPool.query(sqlQuery, (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Database query failed' });
            }

            res.status(200).json({ data: results });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;