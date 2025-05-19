const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed

// Use the connection manager middleware
router.use(connectionManager);

// Generate Android app username and password
function generateUsernameAndPassword(fullName, schoolName, id) {
    // Split the full name by spaces to extract the name parts
    const nameParts = fullName.split(/\s+/);

    // Get the first part from the first name, middle name, and last name
    const firstPart = nameParts[0] ? nameParts[0].toLowerCase() : "";
    const middlePart = nameParts[1] ? nameParts[1].toLowerCase() : "";
    const lastPart = nameParts[2] ? nameParts[2].toLowerCase() : nameParts[1] ? nameParts[1].toLowerCase() : "";

    // Combine the parts to form the username
    const username = `${firstPart}${lastPart}${id}`;

    // Get the first two letters of the school name
    const schoolAbbr = schoolName.split(" ").map(word => word.slice(0, 1)).join("").toLowerCase();

    // Create the username in the format username@schoolAbbr
    const userWithSchool = `${username}@${schoolAbbr}`;

    // Create the password by combining the school abbreviation and the first two letters of the name parts
    const password = `${schoolAbbr}@${firstPart.slice(0, 2)}${middlePart.slice(0, 2)}${lastPart.slice(0, 2)}`;

    return { username: userWithSchool, password };
}

// Insert new teacher 
router.post('/submitTeacherForm', (req, res) => {
    const data = req.body;


    // Validate required fields
    const requiredFields = [
        'name', 'first_name', 'last_name', 'designation', 'gender', 'date_of_birth', 'date_of_joining',
        'mobile_no', 'address_city', 'teacher_uid_no', 'department', 'qualification', 'experience'
    ];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    req.connectionPool.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection failed:', err);
            return res.status(500).json({ error: 'Database connection failed' });
        }

        const schoolName = req.cookies.schoolName;
        if (!schoolName) {
            return res.status(400).json({ error: 'School name is required' });
        }

        const formattedSchoolName = schoolName.replace(/\s+/g, '_').toLowerCase();

        connection.beginTransaction(error => {
            if (error) {
                console.error('Transaction initiation failed:', error);
                return res.status(500).json({ error: 'Transaction initiation failed' });
            }

            // Query to get the current highest teacher_id and increment it by 1
            const incrementTeacherIdQuery = `SELECT MAX(id) AS maxTeacherId FROM teacher_details`;

            connection.query(incrementTeacherIdQuery, (incrementError, incrementResult) => {
                if (incrementError) {
                    return connection.rollback(() => {
                        console.error('Error retrieving teacher_id:', incrementError);
                        res.status(500).json({ error: 'Error retrieving teacher_id' });
                    });
                }

                const newTeacherId = (incrementResult[0].maxTeacherId || 0) + 1;

                // Generate the UID for insertion using the new teacher_id and school name
                const appUid = `${formattedSchoolName}_teacher_${newTeacherId}`;

                const query = `
    INSERT INTO teacher_details (
        id, name, first_name, last_name, designation, gender, date_of_birth, date_of_joining, mobile_no, address_city, 
        teacher_uid_no, department, qualification, experience, subjects_taught, salary, transport_needed, 
        transport_tagged, transport_pickup_drop, classes_alloted, is_active, subject_class_mapping, 
        previous_employment_details, guardian_name, guardian_contact, relation_with_guardian, guardian_address, 
        teacher_landmark, teacher_pincode, category, taluka, district, state, teacher_caste, 
        teacher_category, teacher_religion, teacher_nationality, app_uid
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

                const values = [
                    newTeacherId,
                    data.name || null,
                    data.first_name || null,
                    data.last_name || null,
                    data.designation || null,
                    data.gender || null,
                    data.date_of_birth || null,
                    data.date_of_joining || null,
                    data.mobile_no || null,
                    data.address_city || null,
                    data.teacher_uid_no || null,
                    data.department || null,
                    data.qualification || null,
                    data.experience || null,
                    data.subjects_taught || null,
                    data.salary || null,
                    data.transport_needed || 0,
                    data.transport_tagged || null,
                    data.transport_pickup_drop || null,
                    data.classes_alloted || null,
                    data.is_active || '1',
                    data.subject_class_mapping || '[]',
                    data.previous_employment_details || null,
                    data.guardian_name || null,
                    data.guardian_contact || null,
                    data.relation_with_guardian || null,
                    data.guardian_address || null,
                    data.teacher_landmark || null,
                    data.teacher_pincode || null,
                    data.category || null,
                    data.taluka || null,
                    data.district || null,
                    data.state || null,
                    data.teacher_caste || null,
                    data.teacher_category || null,
                    data.teacher_religion || null,
                    data.teacher_nationality || null,
                    appUid
                ];

                connection.query(query, values, (insertError, result) => {
                    if (insertError) {
                        return connection.rollback(() => {
                            console.error('Insert error:', insertError);
                            res.status(500).json({ error: 'Failed to insert teacher data' });
                        });
                    }

                    const { username, password } = generateUsernameAndPassword(data.name, schoolName, newTeacherId);

                    const insertIntoAndroidAppUsersQuery = `
                        INSERT INTO android_app_users (username, password, school_name, type, name, uid)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;

                    const userType = data.category;
                    const teacherName = `${data.first_name} ${data.last_name}`;

                    connection_auth.query(insertIntoAndroidAppUsersQuery, [username, password, schoolName, userType, teacherName, appUid], (userError) => {
                        if (userError) {
                            return connection.rollback(() => {
                                console.error('Error inserting into android_app_users:', userError);
                                res.status(500).json({ error: 'Error inserting into android_app_users' });
                            });
                        }

                     // If transport-related information is needed, insert into the transport schedule table
                        if (data.transport_needed === 1) {
                            const transportPickDropAddress = data.transport_pickup_drop;
                            const vehicleNo = data.transport_tagged;

                            // First, get the id using vehicle_no, teacher_shift, and route_stops
                            const getIdQuery = `
                                SELECT id 
                                FROM transport_schedule_details
                                WHERE vehicle_no = ? 
                                AND shift_name = ? 
                                AND route_stops LIKE ?
                            `;

                            connection.query(getIdQuery, [vehicleNo, data.teacher_shift, `%${transportPickDropAddress}%`], (getIdError, results) => {
                                if (getIdError) {
                                    return connection.rollback(() => {
                                        console.error('Error fetching transport schedule id:', getIdError);
                                        res.status(500).json({ error: 'Error fetching transport schedule id' });
                                    });
                                }

                                if (results.length === 0) {
                                    return res.status(404).json({ error: 'No transport schedule found for the provided details' });
                                }

                                const transportId = results[0].id; // Getting the id

                                // Now, update the transport_schedule_details using the retrieved id
                                const transportUpdateQuery = `
                                    UPDATE transport_schedule_details
                                    SET available_seats = available_seats - 1,
                                        students_tagged = COALESCE(students_tagged, 0) + 1
                                    WHERE id = ?
                                `;

                                connection.query(transportUpdateQuery, [transportId], (transportUpdateError, updateResult) => {
                                    if (transportUpdateError) {
                                        return connection.rollback(() => {
                                            console.error('Error updating transport schedule:', transportUpdateError);
                                            res.status(500).json({ error: 'Error updating transport schedule' });
                                        });
                                    }

                                    if (updateResult.affectedRows === 0) {
                                        return res.status(500).json({ error: 'No records were updated.' });
                                    }

                                    // Commit transaction after all queries are successful
                                    connection.commit(commitError => {
                                        if (commitError) {
                                            return connection.rollback(() => {
                                                console.error('Transaction commit failed:', commitError);
                                                res.status(500).json({ error: 'Transaction commit failed' });
                                            });
                                        }

                                        res.json({ success: true, id: newTeacherId, username, password });
                                    });
                                });
                            });
                        } else {
                            // Commit transaction without transport-related insertion
                            connection.commit(commitError => {
                                if (commitError) {
                                    return connection.rollback(() => {
                                        console.error('Error committing transaction:', commitError);
                                        res.status(500).json({ error: 'Error committing transaction' });
                                    });
                                }

                                res.json({ success: true, id: newTeacherId, username, password });
                            });
                        }
                    });
                });
            });
        });
    });
});

module.exports = router;