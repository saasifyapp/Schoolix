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

router.post('/get-daily-attendance', async (req, res) => {
    try {
        const today = formatDate();

        const sqlQuery = `
        SELECT 
            logs.user_id, 
            logs.name, 
            logs.section, 
            logs.standard_division, 
            logs.date_of_attendance,
            MIN(logs.in_time) AS in_time,
            MAX(logs.in_time) AS out_time,
            inlog.image_decode AS in_image,
            outlog.image_decode AS out_image
        FROM attendance_user_logs AS logs

        -- Join for IN image (min in_time)
        LEFT JOIN attendance_user_logs AS inlog 
            ON inlog.user_id = logs.user_id 
            AND inlog.date_of_attendance = logs.date_of_attendance 
            AND inlog.in_time = (
                SELECT MIN(innerlog.in_time)
                FROM attendance_user_logs AS innerlog
                WHERE innerlog.user_id = logs.user_id 
                AND innerlog.date_of_attendance = logs.date_of_attendance
            )

        -- Join for OUT image (max in_time)
        LEFT JOIN attendance_user_logs AS outlog 
            ON outlog.user_id = logs.user_id 
            AND outlog.date_of_attendance = logs.date_of_attendance 
            AND outlog.in_time = (
                SELECT MAX(innerlog.in_time)
                FROM attendance_user_logs AS innerlog
                WHERE innerlog.user_id = logs.user_id 
                AND innerlog.date_of_attendance = logs.date_of_attendance
            )

        WHERE logs.date_of_attendance = ?
        GROUP BY logs.user_id, logs.name, logs.section, logs.standard_division, logs.date_of_attendance
        ORDER BY logs.date_of_attendance DESC, in_time DESC;
        `;

        req.connectionPool.query(sqlQuery, [today], (error, results) => {
            if (error) {
                console.error('[DB ERROR]:', error.message);
                return res.status(500).json({
                    message: '❌ Database query failed while fetching today\'s attendance.',
                    error: error.message
                });
            }

            if (!results.length) {
                return res.status(200).json({ message: 'ℹ️ No attendance records found for today.', data: [] });
            }

            results = results.map(row => {
                const inImageBuffer = row.in_image; // Raw BLOB data
                const outImageBuffer = row.out_image; // Raw BLOB data

                const inImage = inImageBuffer ? `data:image/png;base64,${inImageBuffer.toString('base64')}` : null;
                const outImage = outImageBuffer ? `data:image/png;base64,${outImageBuffer.toString('base64')}` : null;

                return {
                    ...row,
                    in_image: inImage,
                    out_image: outImage
                };
            });

            res.status(200).json({
                message: '✅ Today\'s attendance fetched successfully.',
                data: results
            });
        });
    } catch (error) {
        console.error('[SERVER ERROR]:', error.message);
        res.status(500).json({
            message: '🚨 Internal server error.',
            error: error.message
        });
    }
});

router.post('/get-attendance-summary', async (req, res) => {
    try {
        const sqlQuery = `
        SELECT 
            logs.user_id, 
            logs.name, 
            logs.section, 
            logs.standard_division, 
            logs.date_of_attendance,
            MIN(logs.in_time) AS in_time,
            MAX(logs.in_time) AS out_time,
            inlog.image_decode AS in_image,
            outlog.image_decode AS out_image
        FROM attendance_user_logs AS logs

        -- Join for IN image (min in_time)
        LEFT JOIN attendance_user_logs AS inlog 
            ON inlog.user_id = logs.user_id 
            AND inlog.date_of_attendance = logs.date_of_attendance 
            AND inlog.in_time = (
                SELECT MIN(innerlog.in_time)
                FROM attendance_user_logs AS innerlog
                WHERE innerlog.user_id = logs.user_id 
                AND innerlog.date_of_attendance = logs.date_of_attendance
            )

        -- Join for OUT image (max in_time)
        LEFT JOIN attendance_user_logs AS outlog 
            ON outlog.user_id = logs.user_id 
            AND outlog.date_of_attendance = logs.date_of_attendance 
            AND outlog.in_time = (
                SELECT MAX(innerlog.in_time)
                FROM attendance_user_logs AS innerlog
                WHERE innerlog.user_id = logs.user_id 
                AND innerlog.date_of_attendance = logs.date_of_attendance
            )

        GROUP BY logs.user_id, logs.name, logs.section, logs.standard_division, logs.date_of_attendance
        ORDER BY logs.date_of_attendance DESC, in_time DESC;
        `;

        req.connectionPool.query(sqlQuery, (error, results) => {
            if (error) {
                console.error('[DB ERROR]:', error.message);
                return res.status(500).json({
                    message: '❌ Database query failed while fetching attendance summary.',
                    error: error.message
                });
            }

            if (!results.length) {
                return res.status(200).json({ message: 'ℹ️ No attendance summaries found.', data: [] });
            }

            results = results.map(row => {
                const inImageBuffer = row.in_image; // Raw BLOB data
                const outImageBuffer = row.out_image; // Raw BLOB data

                const inImage = inImageBuffer ? `data:image/png;base64,${inImageBuffer.toString('base64')}` : null;
                const outImage = outImageBuffer ? `data:image/png;base64,${outImageBuffer.toString('base64')}` : null;

                return {
                    ...row,
                    in_image: inImage,
                    out_image: outImage
                };
            });

            res.status(200).json({
                message: '✅ Attendance summary fetched successfully.',
                data: results
            });
        });
    } catch (error) {
        console.error('[SERVER ERROR]:', error.message);
        res.status(500).json({
            message: '🚨 Internal server error.',
            error: error.message
        });
    }
});

module.exports = router;