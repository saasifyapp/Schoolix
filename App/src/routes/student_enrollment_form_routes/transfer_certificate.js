const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed

// Use the connection manager middleware
router.use(connectionManager);

////////////////////// ENDPOINTS FOR SEARCHING STUDENT //////////////


// Endpoint to fetch basic student info for Transfer Certificate
router.get("/get-students-for-suggestion-manage-students", (req, res) => {
    const { section, name, grno } = req.query;
    // Validate input parameters
    if (!section || (!name && !grno)) {
        return res.status(400).json({ error: "Invalid search parameters" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query
    let query = `SELECT Grno, Name, Standard FROM ${tableName} WHERE is_active = 1 AND `;
    let queryParams = [];

    if (grno) {
        query += "Grno = ?"; 
        queryParams.push(grno);
    } else if (name) {
        query += "Name LIKE ?";
        queryParams.push(`%${name}%`);
    }

    // Execute the query
    req.connectionPool.query(query, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error", details: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        // Return the results
        res.json(results);
    });
});



// Endpoint to fetch detailed student info for Transfer Certificate
router.get("/get-student-details-for-tc", (req, res) => {
    const { grno, section } = req.query;

    // Validate input parameters
    if (!section || !grno) {
        return res.status(400).json({ error: "Invalid search parameters" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query
    let query = `SELECT * FROM ${tableName} WHERE is_active = 1 AND Grno = ?`;
    let queryParams = [grno];

    // Execute the query
    req.connectionPool.query(query, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error", details: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No student found with this Grno" });
        }

        // Return the results
        res.json(results);
    });
});


//////////////////////////////////////////////////////////////////////////////

// Endpoint to fetch student details for Transfer Certificate
router.get("/fetch-student-for-TC", (req, res) => {
    const { grno, name, section } = req.query;

    // Validate input parameters
    if (!section || (!grno && !name)) {
        return res.status(400).json({ error: "Invalid search parameters" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query
    let query = `SELECT * FROM ${tableName} WHERE is_active = 1 AND `;
    let queryParams = [];

    if (grno) {
        query += "Grno = ?";
        queryParams.push(grno);
    } else if (name) {
        query += "Name LIKE ?";
        queryParams.push(`%${name}%`);
    }

    // Execute the query
    req.connectionPool.query(query, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error", details: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No student found" });
        }

        // Return the results without checking for inactive student (since the WHERE clause already filters this)
        res.json(results);
    });
});

///////////////////////////////////////////

// Endpoint to fetch and increment max tc_no from transfer_certificates table
router.get('/fetch-new-tc-no', (req, res) => {
    // Construct the SQL query to get the max tc_no considering it as an integer
    const sql = `SELECT MAX(CAST(tc_no AS UNSIGNED)) AS max_tc_no FROM transfer_certificates`;

    // Execute the SQL query
    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        // Extract the max tc_no from the results and consider it as 0 if null
        let maxTcNo = results[0].max_tc_no !== null ? results[0].max_tc_no : 0;

        // Increment the max tc_no by 1
        const newTcNo = maxTcNo + 1;

        // Return the new tc_no to the client
        res.status(200).json({ new_tc_no: newTcNo });
    });
});

/////////////////////////////////////////////////////////////////////////


//////////////////////// GENERATE  TC ////////////////////////////////////////


// Endpoint to fetch school details with filtering by loginName and schoolName
router.get('/fetch-tc-school-details', (req, res) => {
    const { loginName, schoolName } = req.query;

    // Construct the SQL query to get required school details
    const sql = `
        SELECT 
            LoginName,
            schoolName,
            contact_no,
            email_address,
            udise_no,
            board_index_no ,
            detailed_address
        FROM user_details
        WHERE LoginName = ? AND schoolName = ?
    `;

    // Execute the SQL query
    connection_auth.query(sql, [loginName, schoolName], (error, results) => {
        if (error) {
            console.error('Database query failed', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        // Log the result for debugging purposes
       // console.log('Fetch School Details Result:', results);

        // Return the results to the client
        res.status(200).json(results[0] || {}); // Return the first result or an empty object if no results found
    });
});

// New endpoint to deactivate student
router.post('/deactivate-student', (req, res) => {
    const { section, grno } = req.body;

    if (!section || !grno) {
        return res.status(400).json({ error: "Invalid section or grno" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query to update is_active to 0
    const query = `UPDATE ${tableName} SET is_active = 1 WHERE Grno = ?`;
    req.connectionPool.query(query, [grno], (error, results) => {
        if (error) {
            console.error('Database query failed', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

       // console.log('Deactivate Student Result:', results);
        res.status(200).json({ message: 'Student deactivated successfully' });
    });
});



// New endpoint to delete Android user
router.post('/delete-android-user', (req, res) => {
    const { section, grno } = req.body;

    if (!section || !grno) {
        return res.status(400).json({ error: "Invalid section or grno" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query to fetch app_uid
    const fetchUidQuery = `SELECT app_uid FROM ${tableName} WHERE Grno = ?`;
    req.connectionPool.query(fetchUidQuery, [grno], (error, results) => {
        if (error) {
            console.error('Database query failed', error);
            return res.status(500).json({ error: 'Database query failed', details: error });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'App UID not found for the given Gr No' });
        }

        const appUid = results[0].app_uid;

        // Construct the SQL query to delete the entry in android_app_users
        const deleteQuery = `DELETE FROM android_app_users WHERE uid = ?`;
        connection_auth.query(deleteQuery, [appUid], (deleteError, deleteResults) => {
            if (deleteError) {
                console.error('Database query failed', deleteError);
                return res.status(500).json({ error: 'Database query failed', details: deleteError });
            }

            //console.log('Delete Android User Result:', deleteResults);
            res.status(200).json({ message: 'Android user deleted successfully' });
        });
    });
});



// Endpoint to delete Transport Allotted
router.post('/delete-transport-alloted', (req, res) => {
    const { section, grno } = req.body;

    if (!section || !grno) {
        return res.status(400).json({ error: "Invalid section or grno" });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Construct the SQL query to fetch transport details and class details (standard and division)
    const fetchDetailsQuery = `SELECT transport_needed, transport_tagged, transport_pickup_drop, Standard, Division FROM ${tableName} WHERE Grno = ?`;
    //console.log('Executing query:', fetchDetailsQuery, 'with params:', [grno]);
    connection_auth.query(fetchDetailsQuery, [grno], (fetchError, fetchResults) => {
        if (fetchError) {
            console.error('Database query failed:', fetchError);
            return res.status(500).json({ error: 'Database query failed', details: fetchError });
        }

        //console.log('Fetch Transport and Class Details Result:', fetchResults);

        if (fetchResults.length === 0) {
          return res.status(404).json({ error: 'Details not found for the given Gr No' });
        }

        const { transport_needed, transport_tagged, transport_pickup_drop, Standard, Division } = fetchResults[0];
        const concatenatedClass = `${Standard} ${Division}`;

        if (transport_needed && transport_tagged) {
            // Fetch vehicle ID from transport_schedule_details
            const getVehicleId = (vehicle_no, transportPickupDrop, callback) => {
                if (!vehicle_no) return callback(null, null);

                const getIdQuery = `
                    SELECT id FROM transport_schedule_details
                    WHERE vehicle_no = ? AND classes_alloted LIKE ? AND route_stops LIKE ?
                `;
                const params = [vehicle_no, `%${concatenatedClass}%`, `%${transportPickupDrop}%`];
               // console.log('Executing query:', getIdQuery, 'with params:', params);
                connection_auth.query(getIdQuery, params, (getIdError, results) => {
                    if (getIdError) return callback(getIdError);
                  //  console.log('Get Vehicle ID Result:', results);
                    callback(null, results.length > 0 ? results[0].id : null);
                });
            };

            // Update seats in transport_schedule_details
            const updateSeats = (vehicleId, callback) => {
                if (!vehicleId) return callback(null);

                const updateSeatsQuery = `
                    UPDATE transport_schedule_details 
                    SET available_seats = available_seats + 1, 
                        students_tagged = 
                            CASE 
                                WHEN students_tagged > 0 THEN students_tagged - 1 
                                ELSE 0 
                            END
                    WHERE id = ?
                `;
               // console.log('Executing query:', updateSeatsQuery, 'with params:', [vehicleId]);
                connection_auth.query(updateSeatsQuery, [vehicleId], (updateError) => {
                    if (updateError) return callback(updateError);
                //    console.log('Update Seats Result for vehicleId:', vehicleId);
                    callback(null);
                });
            };

            // Perform the operations sequentially
            getVehicleId(transport_tagged, transport_pickup_drop, (getIdError, vehicleId) => {
                if (getIdError) {
                    console.error('Database query failed:', getIdError);
                    return res.status(500).json({ error: 'Database query failed', details: getIdError });
                }

                if (!vehicleId) {
                   // console.log('Vehicle not found in transport schedule, no changes made.');
                    return res.status(200).json({ message: 'No transport allotment found for this student.' });
                }

                updateSeats(vehicleId, (updateSeatsError) => {
                    if (updateSeatsError) {
                        console.error('Database query failed:', updateSeatsError);
                        return res.status(500).json({ error: 'Database query failed', details: updateSeatsError });
                    }

                   // console.log('Transport allotment deleted successfully');
                    res.status(200).json({ message: 'Transport allotment deleted successfully' });
                });
            });

        } else {
            res.status(200).json({ message: 'No transport allotment found' });
        }
    });
});

// Endpoint to save Transfer Certificate data
router.post('/save-to-tc-table', (req, res) => {
    const { 
      tc_no, 
      gr_no, 
      student_name, 
      date_of_leaving, 
      standard_of_leaving, 
      reason_of_leaving, 
      progress, 
      conduct, 
      result, 
      remark, 
      issue_date, 
      section,
      current_class,
      generation_status = 'ORIGINAL', 
    } = req.body;
  
    // Check for duplicate tc_no
    const checkDuplicateQuery = `SELECT COUNT(*) AS count FROM transfer_certificates WHERE tc_no = ?`;
    req.connectionPool.query(checkDuplicateQuery, [tc_no], (checkError, checkResults) => {
      if (checkError) {
        console.error('Database query failed:', checkError);
        return res.status(500).json({ error: 'Database query failed', details: checkError });
      }
  
      if (checkResults[0].count > 0) {
        // Duplicate tc_no found
        return res.status(409).json({ error: 'Duplicate TC No', message: 'A record with this TC No already exists.' });
      }
  
      // Construct the SQL query to insert a new record into the transfer_certificates table
      const insertQuery = `INSERT INTO transfer_certificates 
        (tc_no, gr_no, student_name, date_of_leaving, standard_of_leaving, reason_of_leaving, 
         progress, conduct, result, remark, issue_date, section, current_class, generation_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
      const queryParams = [tc_no, gr_no, student_name, date_of_leaving, standard_of_leaving, 
        reason_of_leaving, progress, conduct, result, remark, issue_date, section, current_class, generation_status];
  
      req.connectionPool.query(insertQuery, queryParams, (insertError, result) => {
        if (insertError) {
          console.error('Database query failed:', insertError);
          return res.status(500).json({ error: 'Database query failed', details: insertError });
        }
  
       // console.log('Insert TC Data Result:', result);
        res.status(200).json({ message: 'Transfer Certificate data saved successfully' });
      });
    });
  });

////////////////////////////////////////////////////////////////////////////////



//////////////////////// EDIT TC ////////////////////////////////////////




// Endpoint to fetch all students who have left school with TC
router.get("/get-tc-data", async (req, res) => {
    try {
        const query = `SELECT * FROM transfer_certificates`;

        // Execute query
        req.connectionPool.query(query, (error, results) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No transfer certificate records found" });
            }

            res.json(results);
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// Endpoint to fetch TC details by id
router.get("/edit-tc-details", async (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.status(400).json({ error: "ID parameter is required" });
    }

    try {
        const query = `SELECT * FROM transfer_certificates WHERE id = ?`;
        
        // Execute query with the provided id
        req.connectionPool.query(query, [id], (error, results) => {
            if (error) {
                console.error("Database error:", error);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No transfer certificate record found for the given ID" });
            }

            res.json({ success: true, details: results[0] });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// Endpoint to update TC details by tc_no and gr_no
router.post("/update-tc-details", async (req, res) => {
    const { tc_no, gr_no, date_of_leaving, standard_of_leaving, reason_of_leaving, progress, conduct, result, remark, issue_date, generation_status } = req.body;

    if (!tc_no || !gr_no) {
        return res.status(400).json({ error: "tc_no and gr_no parameters are required" });
    }

    try {
        const selectQuery = `
            SELECT id, date_of_leaving, standard_of_leaving, reason_of_leaving, progress, conduct, result, remark, issue_date, generation_status 
            FROM transfer_certificates 
            WHERE tc_no = ? AND gr_no = ?
        `;

        req.connectionPool.query(selectQuery, [tc_no, gr_no], (selectError, results) => {
            if (selectError) {
                console.error("Database error:", selectError);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "No transfer certificate record found for the given TC No and GR No" });
            }

            const currentValues = results[0];
            const id = currentValues.id;

            const updatedFields = {
                date_of_leaving,
                standard_of_leaving,
                reason_of_leaving,
                progress,
                conduct,
                result,
                remark,
                issue_date,
                generation_status
            };

            let changes = {};

            Object.keys(updatedFields).forEach(key => {
                if (updatedFields[key] !== currentValues[key]) {
                    changes[key] = {
                        old: currentValues[key],
                        new: updatedFields[key]
                    };
                }
            });

            if (Object.keys(changes).length === 0) {
                return res.status(200).json({ success: false, message: "No changes detected" });
            }

            const updateQuery = `
                UPDATE transfer_certificates 
                SET 
                    date_of_leaving = ?, 
                    standard_of_leaving = ?, 
                    reason_of_leaving = ?, 
                    progress = ?, 
                    conduct = ?, 
                    result = ?, 
                    remark = ?, 
                    issue_date = ?, 
                    generation_status = ?
                WHERE 
                    id = ?
            `;

            const values = [
                date_of_leaving,
                standard_of_leaving,
                reason_of_leaving,
                progress,
                conduct,
                result,
                remark,
                issue_date,
                generation_status,
                id
            ];

            req.connectionPool.query(updateQuery, values, (updateError, updateResults) => {
                if (updateError) {
                    console.error("Database error:", updateError);
                    return res.status(500).json({ error: "Database error" });
                }

                res.json({ success: true, message: "TC details updated successfully", changes });
            });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Server error" });
    }
});




/////////////////////////////////////// DELETE TC //////////////////////////////


// New endpoint to delete a TC record
router.delete("/delete-tc-record", (req, res) => {
    const { id, grno, section } = req.query; // Get section from query parameters

    console.log(`Received parameters: id=${id}, grno=${grno}, section=${section}`);

    if (!id || !grno || !section) {
        console.error('Missing required parameters');
        return res.status(400).json({ error: "Missing required parameters" });
    }

    const schoolName = req.cookies.schoolName;
    if (!schoolName) {
        return res.status(400).json({ error: 'School name is required' });
    }

    // Determine the appropriate table based on section
    let tableName;
    if (section === "primary") {
        tableName = "primary_student_details";
    } else if (section === "pre_primary") {
        tableName = "pre_primary_student_details";
    } else {
        console.error('Invalid section parameter');
        return res.status(400).json({ error: "Invalid section parameter" });
    }

    // Start a transaction
    req.connectionPool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: "Database connection failed" });
        }

        connection.beginTransaction(async (transactionError) => {
            if (transactionError) {
                console.error("Transaction initiation failed:", transactionError);
                connection.release();
                return res.status(500).json({ error: "Transaction initiation failed" });
            }

            try {
                // Step 1: Reactivate the student by setting is_active to 1
                const reactivateStudentQuery = `UPDATE ${tableName} SET is_active = 1 WHERE Grno = ?`;
                connection.query(reactivateStudentQuery, [grno], (reactivateError, reactivateResult) => {
                    if (reactivateError) {
                        console.error("Database error:", reactivateError);
                        return connection.rollback(() => {
                            connection.release();
                            return res.status(500).json({ error: "Database error while reactivating student" });
                        });
                    }

                    if (reactivateResult.affectedRows === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            return res.status(404).json({ error: "Failed to reactivate student or student not found" });
                        });
                    }

                    console.log(`Reactivated student with GR No: ${grno}`);

                    // Step 2: Proceed with deleting the TC record
                    const deleteTCQuery = `DELETE FROM transfer_certificates WHERE id = ? AND gr_no = ?`;
                    connection.query(deleteTCQuery, [id, grno], (deleteError, deleteResult) => {
                        if (deleteError) {
                            console.error("Database error:", deleteError);
                            return connection.rollback(() => {
                                connection.release();
                                return res.status(500).json({ error: "Database error while deleting TC record" });
                            });
                        }

                        if (deleteResult.affectedRows === 0) {
                            return connection.rollback(() => {
                                connection.release();
                                return res.status(404).json({ error: "No TC record found to delete" });
                            });
                        }

                        console.log(`Deleted TC with ID: ${id}`);

                        // Step 3: Fetch the student details to get the app_uid and other required information
                        const fetchStudentDetailsQuery = `
                            SELECT app_uid, Name, transport_needed, transport_tagged, transport_pickup_drop, Standard, Division 
                            FROM ${tableName} WHERE Grno = ?
                        `;
                        connection.query(fetchStudentDetailsQuery, [grno], (fetchError, fetchResult) => {
                            if (fetchError) {
                                console.error("Database error:", fetchError);
                                return connection.rollback(() => {
                                    connection.release();
                                    return res.status(500).json({ error: "Database error while fetching student details" });
                                });
                            }

                            if (fetchResult.length === 0) {
                                return connection.rollback(() => {
                                    connection.release();
                                    return res.status(404).json({ error: "Student not found with the given GR No" });
                                });
                            }

                            const studentDetails = fetchResult[0];
                            const { app_uid, Name: fullName, transport_needed, transport_tagged, transport_pickup_drop, Standard, Division } = studentDetails;

                            // Generate the new username and password
                            const { username, password } = regenerateUsernameAndPassword(fullName, schoolName, grno);
                            const studentName = fullName;

                            // Step 4: Insert into android_app_users table using connection_auth
                            const insertIntoAndroidAppUsersQuery = `
                                INSERT INTO android_app_users (username, password, school_name, type, name, uid)
                                VALUES (?, ?, ?, ?, ?, ?)
                            `;

                            const userType = 'student';

                            connection_auth.query(insertIntoAndroidAppUsersQuery, [username, password, schoolName, userType, studentName, app_uid], (userError) => {
                                if (userError) {
                                    console.error('Error inserting into android_app_users:', userError);
                                    return connection.rollback(() => {
                                        connection.release();
                                        return res.status(500).json({ error: 'Error inserting into android_app_users' });
                                    });
                                }

                                console.log(`Regenerated Android credentials for app UID: ${app_uid}`);

                                // Step 5: Update transport schedule details if needed and if transport_tagged is not null
                                if (transport_needed === 1 && transport_tagged) {
                                    const concatenatedClass = `${Standard} ${Division}`; // e.g., '5th Red'
                                    const getIdQuery = `
                                        SELECT id 
                                        FROM transport_schedule_details
                                        WHERE vehicle_no = ? 
                                        AND classes_alloted LIKE ? 
                                        AND route_stops LIKE ?
                                    `;

                                    connection.query(getIdQuery, [transport_tagged, `%${concatenatedClass}%`, `%${transport_pickup_drop}%`], (getIdError, results) => {
                                        if (getIdError) {
                                            console.error('Error fetching transport schedule id:', getIdError);
                                            return connection.rollback(() => {
                                                connection.release();
                                                return res.status(500).json({ error: 'Error fetching transport schedule id' });
                                            });
                                        }

                                        if (results.length === 0) {
                                            console.log('No transport schedule found for the provided details, but continuing transaction');
                                        } else {
                                            const transportId = results[0].id;

                                            // Now, update the transport_schedule_details using the retrieved id
                                            const transportUpdateQuery = `
                                                UPDATE transport_schedule_details
                                                SET available_seats = available_seats - 1,
                                                    students_tagged = COALESCE(students_tagged, 0) + 1
                                                WHERE id = ?
                                            `;

                                            connection.query(transportUpdateQuery, [transportId], (transportUpdateError, updateResult) => {
                                                if (transportUpdateError) {
                                                    console.error('Error updating transport schedule:', transportUpdateError);
                                                    return connection.rollback(() => {
                                                        connection.release();
                                                        return res.status(500).json({ error: 'Error updating transport schedule' });
                                                    });
                                                }

                                                console.log(`Updated transport schedule for ID: ${transportId}`);
                                            });
                                        }
                                        
                                        // Commit transaction
                                        connection.commit((commitError) => {
                                            if (commitError) {
                                                console.error("Transaction commit failed:", commitError);
                                                return connection.rollback(() => {
                                                    connection.release();
                                                    return res.status(500).json({ error: "Transaction commit failed" });
                                                });
                                            }

                                            console.log("Transaction committed successfully");
                                            connection.release();
                                            res.json({ message: "Record deleted successfully, android user inserted, and transport details updated" });
                                        });
                                    });
                                } else {
                                    // Commit transaction if no transport update is needed or if transport_tagged is null
                                    connection.commit((commitError) => {
                                        if (commitError) {
                                            console.error("Transaction commit failed:", commitError);
                                            return connection.rollback(() => {
                                                connection.release();
                                                return res.status(500).json({ error: "Transaction commit failed" });
                                            });
                                        }

                                        console.log("Transaction committed successfully");
                                        connection.release();
                                        res.json({ message: "Record deleted successfully and android user inserted" });
                                    });
                                }
                            });
                        });
                    });
                });
            } catch (transactionError) {
                console.error("Error during transaction:", transactionError);
                try {
                    connection.rollback(() => {
                        connection.release();
                        return res.status(500).json({ error: "Transaction failed and rolled back", details: transactionError.message });
                    });
                } catch (rollbackError) {
                    console.error("Rollback error:", rollbackError);
                    connection.release();
                }
            }
        });
    });
});

// Function to regenerate username and password
function regenerateUsernameAndPassword(fullName, schoolName, grNo) {
    // Split the full name by spaces to extract the name parts
    const nameParts = fullName.split(/\s+/);

    // Get the first part from the first name, middle name, and last name
    const firstPart = nameParts[0] ? nameParts[0].toLowerCase() : "";
    const middlePart = nameParts[1] ? nameParts[1].toLowerCase() : "";
    const lastPart = nameParts[2] ? nameParts[2].toLowerCase() : nameParts[1] ? nameParts[1].toLowerCase() : "";

    // Combine the parts to form the username
    const username = `${firstPart}${lastPart}${grNo}`;

    // Get the first two letters of the school name
    const schoolAbbr = schoolName.split(" ").map(word => word.slice(0, 1)).join("").toLowerCase();

    // Create the username in the format username@schoolAbbr
    const userWithSchool = `${username}@${schoolAbbr}`;

    // Create the password by combining the school abbreviation and the first two letters of the name parts
    const password = `${schoolAbbr}@${firstPart.slice(0, 2)}${middlePart.slice(0, 2)}${lastPart.slice(0, 2)}`;

    return { username: userWithSchool, password };
}

module.exports = router;