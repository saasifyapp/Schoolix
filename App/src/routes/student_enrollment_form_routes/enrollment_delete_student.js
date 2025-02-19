const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to fetch students for deletion
router.get('/delete_enrolled_students', (req, res) => {
    const tableName = req.query.type === 'primary' ? 'primary_student_details' : 'pre_primary_student_details';

    const sql = `
        SELECT student_id, Grno, Name, Section, Gender, Standard, Division, DOB 
        FROM ${tableName}`;
    
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
    SELECT transport_needed, transport_tagged, transport_pickup_drop, Standard, Division 
    FROM ${tableName}
    WHERE 
        student_id = ? AND
        Grno = ?
    `;

    const selectQueryParams = [student_id, Grno];

    // Log the SQL query and parameters
    // console.log('Select SQL query:', selectSql);
    // console.log('Select query parameters:', selectQueryParams);

    req.connectionPool.query(selectSql, selectQueryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        if (results.length > 0) {
            const studentDetails = results[0];
            //console.log('Student Details:', studentDetails);

            const deleteSql = `
            DELETE FROM ${tableName}
            WHERE 
                student_id = ? AND
                Grno = ?
            `;

            const deleteQueryParams = [student_id, Grno];

            if (studentDetails.transport_needed == 0 || studentDetails.transport_tagged == null) {
                // Perform deletion if transport_needed is 0 or transport_tagged is null
                req.connectionPool.query(deleteSql, deleteQueryParams, (deleteError, deleteResults) => {
                    if (deleteError) {
                        return res.status(500).json({ error: 'Database query failed', details: deleteError });
                    }
                    res.status(200).json({ success: true, message: 'Student deleted successfully (no transport update needed)' });
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

               // console.log('Vehicle Info SQL query:', vehicleInfoSql);
               // console.log('Vehicle query parameters:', vehicleQueryParams);

                // Fetch vehicle info
                req.connectionPool.query(vehicleInfoSql, vehicleQueryParams, (vehicleError, vehicleResults) => {
                    if (vehicleError) {
                        return res.status(500).json({ error: 'Database query failed', details: vehicleError });
                    }

                    console.log('Vehicle Details:', vehicleResults);

                    if (vehicleResults.length > 0) {
                        const vehicleUpdateSql = `
                        UPDATE transport_schedule_details 
                        SET 
                            available_seats = available_seats + 1,
                            students_tagged = students_tagged - 1
                        WHERE 
                            id = ?
                        `;

                        const vehicleUpdateParams = [vehicleResults[0].id];

                        //console.log('Vehicle Update SQL query:', vehicleUpdateSql);
                        //console.log('Vehicle update parameters:', vehicleUpdateParams);

                        // Perform the update on the transport schedule details
                        req.connectionPool.query(vehicleUpdateSql, vehicleUpdateParams, (updateError, updateResults) => {
                            if (updateError) {
                                return res.status(500).json({ error: 'Database update failed', details: updateError });
                            }

                            // Perform deletion after updating the transport details
                            req.connectionPool.query(deleteSql, deleteQueryParams, (deleteError, deleteResults) => {
                                if (deleteError) {
                                    return res.status(500).json({ error: 'Database query failed', details: deleteError });
                                }
                                res.status(200).json({ 
                                    success: true, 
                                    message: 'Student deleted successfully and transport details updated', 
                                    vehicleDetails: vehicleResults 
                                });
                            });
                        });
                    } else {
                        res.status(404).json({ success: false, message: 'Vehicle details not found for update', vehicleDetails: vehicleResults });
                    }
                });
            }
        } else {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
    });
});


module.exports = router;