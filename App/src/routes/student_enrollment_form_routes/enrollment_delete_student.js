const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to fetch students for deletion
router.get('/delete_enrolled_students', (req, res) => {
    const tableName = req.query.type === 'primary' ? 'primary_student_details' : 'pre_primary_student_details';

    const sql = `
        SELECT student_id, Grno, Name, Section, Gender, Standard, Division, DOB 
        FROM ${tableName} WHERE is_active = 1`;
    
    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed', details: error });
        }
        res.status(200).json(results);
    });
});


// Endpoint to delete a student and update transport details if needed
router.post('/deleteEnrolledStudent', (req, res) => {
    const { student_id, Grno, Section } = req.body;
    const tableName = Section.toLowerCase() === 'primary' ? 'primary_student_details' : 'pre_primary_student_details';

    // SQL query to select student details
    const selectSql = `
    SELECT transport_needed, transport_tagged, transport_pickup_drop, Standard, Division, app_uid, Name 
    FROM ${tableName}
    WHERE 
        student_id = ? AND
        Grno = ? AND
        is_active = 1

    `;

    const selectQueryParams = [student_id, Grno];

    req.connectionPool.query(selectSql, selectQueryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        if (results.length > 0) {
            const studentDetails = results[0];
            const { app_uid, Name } = studentDetails;

            const deleteSql = `
            DELETE FROM ${tableName}
            WHERE 
                student_id = ? AND
                Grno = ? AND
                is_active = 1
            `;

            const deleteQueryParams = [student_id, Grno];

            const deleteAndroidUserQuery = `
                DELETE FROM android_app_users
                WHERE uid = ? AND name = ?
            `;

            const androidQueryParams = [app_uid, Name];

            // Function to delete from android_app_users table
            const deleteFromAndroidUsers = (callback) => {
                connection_auth.query(deleteAndroidUserQuery, androidQueryParams, (androidDeleteError, androidDeleteResults) => {
                    if (androidDeleteError) {
                        return callback({ error: 'Android user delete failed', details: androidDeleteError });
                    }
                    callback(null, { success: true, message: 'Android user deleted successfully' });
                });
            };

            if (studentDetails.transport_needed == 0 || studentDetails.transport_tagged == null) {
                // Perform deletion if transport_needed is 0 or transport_tagged is null
                req.connectionPool.query(deleteSql, deleteQueryParams, (deleteError, deleteResults) => {
                    if (deleteError) {
                        return res.status(500).json({ error: 'Database query failed', details: deleteError });
                    }

                    // Delete from android_app_users table
                    deleteFromAndroidUsers((error, result) => {
                        if (error) {
                            return res.status(500).json(error);
                        }

                        res.status(200).json({ success: true, message: 'Student and associated Android user deleted successfully (no transport update needed)', ...result });
                    });
                });
            } else {
                // If transport is needed and transport_tagged is not null, update the transport details
                const vehicleInfoSql = `
                SELECT * FROM transport_schedule_details
                WHERE 
                    vehicle_no = ? AND
                    route_stops LIKE CONCAT('%', ?, '%') AND
                    classes_alloted LIKE CONCAT('%', ?, ' ', ?, '%')
                `;

                const vehicleQueryParams = [studentDetails.transport_tagged, studentDetails.transport_pickup_drop, studentDetails.Standard, studentDetails.Division];

                req.connectionPool.query(vehicleInfoSql, vehicleQueryParams, (vehicleError, vehicleResults) => {
                    if (vehicleError) {
                        return res.status(500).json({ error: 'Database query failed', details: vehicleError });
                    }

                    if (vehicleResults.length > 0) {
                        const vehicleUpdateSql = `
                        UPDATE transport_schedule_details 
                        SET 
                            available_seats = available_seats + 1,
                            students_tagged = COALESCE(students_tagged, 0) - 1
                        WHERE 
                            id = ?
                        `;

                        const vehicleUpdateParams = [vehicleResults[0].id];

                        req.connectionPool.query(vehicleUpdateSql, vehicleUpdateParams, (updateError, updateResults) => {
                            if (updateError) {
                                return res.status(500).json({ error: 'Database update failed', details: updateError });
                            }

                            // Perform deletion after updating the transport details
                            req.connectionPool.query(deleteSql, deleteQueryParams, (deleteError, deleteResults) => {
                                if (deleteError) {
                                    return res.status(500).json({ error: 'Database query failed', details: deleteError });
                                }

                                // Delete from android_app_users table
                                deleteFromAndroidUsers((error, result) => {
                                    if (error) {
                                        return res.status(500).json(error);
                                    }

                                    res.status(200).json({ 
                                        success: true, 
                                        message: 'Student deleted successfully and transport details updated, and associated Android user deleted', 
                                        vehicleDetails: vehicleResults,
                                        ...result
                                    });
                                });
                            });
                        });
                    } else {
                        // Even if vehicle details are not found, still delete the student and associated Android user
                        req.connectionPool.query(deleteSql, deleteQueryParams, (deleteError, deleteResults) => {
                            if (deleteError) {
                                return res.status(500).json({ error: 'Database query failed', details: deleteError });
                            }

                            // Delete from android_app_users table
                            deleteFromAndroidUsers((error, result) => {
                                if (error) {
                                    return res.status(500).json(error);
                                }

                                res.status(200).json({ 
                                    success: true, 
                                    message: 'Student deleted successfully, but no transport details were updated. Associated Android user also deleted', 
                                    ...result 
                                });
                            });
                        });
                    }
                });
            }
        } else {
            res.status(404).json({ error: 'Student not found' });
        }
    });
});


module.exports = router;