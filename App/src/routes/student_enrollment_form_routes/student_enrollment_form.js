const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

// New endpoint to get distinct addresses
router.get('/getCityAddress', (req, res) => {
    const sql = `
        SELECT DISTINCT Address
        FROM (
            SELECT Address FROM pre_primary_student_details
            UNION
            SELECT Address FROM primary_student_details
        ) AS combined_addresses;
    `;

    req.connectionPool.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
});

// GET Endpoint to fetch unique castes from combined tables
router.get('/getUniqueCastes', (req, res) => {
    const query = `
        SELECT Caste 
        FROM primary_student_details
        UNION
        SELECT Caste 
        FROM pre_primary_student_details;
    `;

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching unique castes:', error);
            return res.status(500).json({ error: 'Error fetching unique castes' });
        }
        res.status(200).json(results);
    });
});


// Endpoint to fetch sections from both tables
router.get('/getSections', (req, res) => {
    const queryPrimary = `SELECT DISTINCT Section FROM primary_student_details`;
    const queryPrePrimary = `SELECT DISTINCT Section FROM pre_primary_student_details`;

    Promise.all([
        new Promise((resolve, reject) => {
            req.connectionPool.query(queryPrimary, (error, results) => {
                if (error) return reject(error);
                resolve(results.map(result => result.Section));
            });
        }),
        new Promise((resolve, reject) => {
            req.connectionPool.query(queryPrePrimary, (error, results) => {
                if (error) return reject(error);
                resolve(results.map(result => result.Section));
            });
        })
    ])
        .then(([primarySections, prePrimarySections]) => {
            const sections = [...new Set([...primarySections, ...prePrimarySections])]; // Combine and remove duplicates
            res.status(200).json({ sections });
        })
        .catch(error => {
            console.error('Error fetching sections:', error);
            res.status(500).json({ error: 'Error fetching sections' });
        });
});


// New endpoint to fetch the next GR Number based on section
router.get('/getNextGrno', (req, res) => {
    const { section } = req.query; // Get the section parameter from query string
    // console.log(`Received section: ${section}`); // For testing, just log the section value

    // Map section values to corresponding table names
    const tableMap = {
        "primary": "primary_student_details",
        "pre primary": "pre_primary_student_details"
    };

    const normalizedSection = section ? section.toLowerCase().replace("-", " ") : "";
    const tableName = tableMap[normalizedSection];

    if (!tableName) {
        return res.status(400).json({ error: 'Invalid section value' });
    }

    const query = `SELECT MAX(Grno) AS maxGrno FROM ${tableName}`;

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching GR Number:', error);
            return res.status(500).json({ error: 'Error fetching GR Number' });
        }
        const maxGrno = results[0].maxGrno || 0; // If no records, start from 0
        const nextGrno = maxGrno + 1;
        res.status(200).json({ nextGrno, section });
    });
});



// New endpoint to fetch standards based on section
router.get('/getStandards', (req, res) => {
    const { section } = req.query;
    const tableMap = {
        "primary": "primary_student_details",
        "pre primary": "pre_primary_student_details"
    };

    const normalizedSection = section ? section.toLowerCase().replace("-", " ") : "";
    const tableName = tableMap[normalizedSection];

    if (!tableName) {
        return res.status(400).json({ error: 'Invalid section value' });
    }

    const query = `SELECT DISTINCT Standard FROM ${tableName}`;

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching Standards:', error);
            return res.status(500).json({ error: 'Error fetching Standards' });
        }
        if (!results) {
            return res.status(400).json({ error: 'No results found' });
        }

        const standards = results
            .map(result => result.Standard)
            // Sorting standards based on custom logic. We'll sort them in ascending order.
            .sort((a, b) => {
                const order = ["pre-primary", "nursery", "kg", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
                return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase());
            });

        res.status(200).json({ standards });
    });
});


// New endpoint to fetch divisions based on section and standard
router.get('/getDivisions', (req, res) => {
    const { section, standard } = req.query;
    const tableMap = {
        "primary": "primary_student_details",
        "pre primary": "pre_primary_student_details"
    };

    const normalizedSection = section ? section.toLowerCase().replace("-", " ") : "";
    const tableName = tableMap[normalizedSection];

    if (!tableName) {
        return res.status(400).json({ error: 'Invalid section value' });
    }

    if (!standard) {
        return res.status(400).json({ error: 'Standard is required' });
    }

    const query = `
        SELECT DISTINCT Division 
        FROM ${tableName}
        WHERE Standard = ?
    `;

    req.connectionPool.query(query, [standard], (error, results) => {
        if (error) {
            console.error('Error fetching Divisions:', error);
            return res.status(500).json({ error: 'Error fetching Divisions' });
        }
        const divisions = results.map(result => result.Division);
        res.status(200).json({ divisions });
    });
});


// New combined endpoint to fetch Fee Categories and Amounts based on Standard (class grade)
router.get('/getFeeCategoriesAndAmounts', (req, res) => {
    const { standard } = req.query; // Get the standard parameter from the query string

    if (!standard) {
        return res.status(400).json({ error: 'Standard is required' });
    }

    const query = `SELECT category_name, amount FROM fee_structures WHERE class_grade = ? OR class_grade = 'All Grades'`;

    req.connectionPool.query(query, [standard], (error, results) => {
        if (error) {
            console.error('Error fetching fee categories and amounts:', error);
            return res.status(500).json({ error: 'Error fetching fee categories and amounts' });
        }

        const categoriesAndAmounts = results.map(result => ({
            category_name: result.category_name,
            amount: result.amount
        }));

        res.status(200).json({ categoriesAndAmounts });
    });
});


// Endpoint to filter based on classes_alloted LIKE and route_stops LIKE
router.post('/getVehicleRunning', (req, res) => {
    let { classesAllotted, routeStops } = req.body;

    // Ensure inputs are strings and trim them
    if (typeof classesAllotted === 'string') {
        classesAllotted = classesAllotted.trim();
    }

    if (typeof routeStops === 'string') {
        routeStops = routeStops.trim();
    }

    // Check if classesAllotted or routeStops are empty and handle accordingly
    if (classesAllotted.length === 0 || routeStops.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid input data' });
    }

    const sql = `
        SELECT vehicle_no, driver_name, classes_alloted, route_stops
        FROM transport_schedule_details
        WHERE classes_alloted LIKE ? AND route_stops LIKE ?
        LIMIT 1000;
    `;

    const queryParams = [`%${classesAllotted}%`, `%${routeStops}%`];

    req.connectionPool.query(sql, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, error: 'Database query failed' });
        }

        if (results.length > 0) {
            res.status(200).json({ success: true, vehicles: results });
        } else {
            res.status(200).json({ success: false, vehicles: [] });
        }
    });
});


// Endpoint to get detailed vehicle info based on vehicle number, route, and class
router.get('/studentEnrollment_getVehicleInfo', (req, res) => {
    const { vehicleNo, route, classAllotted } = req.query;

    if (!vehicleNo || !route || !classAllotted) {
        return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    const sql = `
        SELECT vehicle_no, driver_name, vehicle_capacity, available_seats
        FROM transport_schedule_details
        WHERE vehicle_no = ? AND route_stops LIKE ? AND classes_alloted LIKE ?
        LIMIT 1;
    `;

    const queryParams = [vehicleNo, `%${route}%`, `%${classAllotted}%`];

    req.connectionPool.query(sql, queryParams, (error, results) => {
        if (error) {
            console.error('Database query failed:', error);
            return res.status(500).json({ success: false, error: 'Database query failed' });
        }

        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(200).json([]);
        }
    });
});


///////////////////////////////////   SUBMIT DATA TO STUDENT TABLE (FORM SUBMISSION) ////////////////////////////////////

router.post('/submitEnrollmentForm', (req, res) => {
    const formData = req.body;

    // Log the received data for debugging
    console.log('Received data:', JSON.stringify(formData, null, 2));

    if (!formData || !formData.studentInformation || !formData.guardianInformation || !formData.academicInformation || !formData.feesInformation || !formData.transportInformation) {
        return res.status(400).json({ error: 'Invalid data received' });
    }

    const consentText = formData.consent.selected;

    const {
        firstName,
        middleName,
        lastName,
        fullName,
        dob,
        placeOfBirth,
        age,
        gender,
        bloodGroup,
        studentContact,
        currentAddress,
        nationality,
        religion,
        category,
        caste,
        domicile,
        motherTongue,
        aadharNo,
        documents
    } = formData.studentInformation;

    const { father, mother, localGuardian } = formData.guardianInformation;

    const {
        section,
        grNo,
        admissionDate,
        standard,
        division,
        lastSchoolAttended,
        classCompleted,
        percentage
    } = formData.academicInformation;

    const {
        package_breakup,
        total_package
    } = formData;

    const {
        transport_needed,
        transport_tagged,
        transport_pickup_drop
    } = formData.transportInformation;

    const studentDetails = {
        Firstname: firstName,
        Middlename: middleName,
        Surname: lastName,
        Name: fullName,
        DOB: dob,
        Age: age,
        POB: placeOfBirth,
        Gender: gender,
        Blood_Group: bloodGroup,
        Address: currentAddress.cityVillage,
        landmark: currentAddress.landmark,
        taluka: currentAddress.taluka,
        district: currentAddress.district,
        state: currentAddress.state,
        pin_code: currentAddress.pinCode,
        student_phone_no: studentContact,
        Adhar_no: aadharNo,
        Religion: religion,
        Nationality: nationality,
        Category: category,
        Caste: caste,
        Domicile: domicile,
        Mother_Tongue: motherTongue,
        Documents_Submitted: documents,
        Father_name: father.firstName,
        F_qualification: father.qualification,
        F_occupation: father.occupation,
        F_mobile_no: father.contactNumber,
        Grand_father: father.middleName,
        Mother_name: mother.firstName, // Only mother's first name
        M_Qualification: mother.qualification,
        M_occupation: mother.occupation,
        M_mobile_no: mother.contactNumber,
        guardian_name: localGuardian.name,
        guardian_contact: localGuardian.contact,
        guardian_relation: localGuardian.relation,
        guardian_address: localGuardian.fullAddress,
        guardian_landmark: localGuardian.landmark,
        guardian_pin_code: localGuardian.pinCode,
        Section: section,
        Grno: grNo,
        Admission_Date: admissionDate,
        Standard: standard,
        Division: division,
        Last_School: lastSchoolAttended,
        class_completed: classCompleted,
        percentage_last_school: percentage.toString(),
        package_breakup: package_breakup,
        total_package: total_package,
        transport_needed: transport_needed,
        transport_tagged: transport_tagged,
        transport_pickup_drop: transport_pickup_drop,
        Consent: consentText
    };

    // Retrieve school name from cookie
    const schoolName = req.cookies.schoolName;
    if (!schoolName) {
        return res.status(400).json({ error: 'School name is required' });
    }

    // Format school name to lowercase and replace spaces with underscores
    const formattedSchoolName = schoolName.replace(/\s+/g, '_').toLowerCase();

    // Start a transaction
    req.connectionPool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        connection.beginTransaction(error => {
            if (error) {
                return res.status(500).json({ error: 'Transaction initiation failed' });
            }

            // Query to get the current highest student_id and increment it by 1
            const incrementStudentIdQuery = `SELECT MAX(student_id) AS maxStudentId FROM test_student_details`;

            connection.query(incrementStudentIdQuery, (incrementError, incrementResult) => {
                if (incrementError) {
                    return connection.rollback(() => {
                        console.error('Error retrieving student_id:', incrementError);
                        res.status(500).json({ error: 'Error retrieving student_id' });
                    });
                }

                const newStudentId = (incrementResult[0].maxStudentId || 0) + 1;
                console.log(`Fetched student_id: ${incrementResult[0].maxStudentId}, New student_id: ${newStudentId}`);

                const query = `INSERT INTO test_student_details (
                    student_id, Firstname, Middlename, Surname, Name, DOB, Age, POB, Gender, Blood_Group, Address, 
                    landmark, taluka, district, state, pin_code, student_phone_no, Adhar_no, Religion, Nationality, 
                    Category, Caste, Domicile, Mother_Tongue, Documents_Submitted, Father_name, F_qualification, 
                    F_occupation, F_mobile_no, Grand_father, Mother_name, M_Qualification, M_occupation, M_mobile_no, 
                    guardian_name, guardian_contact, guardian_relation, guardian_address, guardian_landmark, guardian_pin_code, 
                    Section, Grno, Admission_Date, Standard, Division, Last_School, class_completed, percentage_last_school, 
                    package_breakup, total_package, transport_needed, transport_tagged, transport_pickup_drop, consent_text
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                const values = [
                    newStudentId,
                    studentDetails.Firstname,
                    studentDetails.Middlename,
                    studentDetails.Surname,
                    studentDetails.Name,
                    studentDetails.DOB,
                    studentDetails.Age,
                    studentDetails.POB,
                    studentDetails.Gender,
                    studentDetails.Blood_Group,
                    studentDetails.Address,
                    studentDetails.landmark,
                    studentDetails.taluka,
                    studentDetails.district,
                    studentDetails.state,
                    studentDetails.pin_code,
                    studentDetails.student_phone_no,
                    studentDetails.Adhar_no,
                    studentDetails.Religion,
                    studentDetails.Nationality,
                    studentDetails.Category,
                    studentDetails.Caste,
                    studentDetails.Domicile,
                    studentDetails.Mother_Tongue,
                    studentDetails.Documents_Submitted,
                    studentDetails.Father_name,
                    studentDetails.F_qualification,
                    studentDetails.F_occupation,
                    studentDetails.F_mobile_no,
                    studentDetails.Grand_father,
                    studentDetails.Mother_name, // Only mother's first name
                    studentDetails.M_Qualification,
                    studentDetails.M_occupation,
                    studentDetails.M_mobile_no,
                    studentDetails.guardian_name,
                    studentDetails.guardian_contact,
                    studentDetails.guardian_relation,
                    studentDetails.guardian_address,
                    studentDetails.guardian_landmark,
                    studentDetails.guardian_pin_code,
                    studentDetails.Section,
                    studentDetails.Grno,
                    studentDetails.Admission_Date,
                    studentDetails.Standard,
                    studentDetails.Division,
                    studentDetails.Last_School,
                    studentDetails.class_completed,
                    studentDetails.percentage_last_school,
                    studentDetails.package_breakup,
                    studentDetails.total_package,
                    studentDetails.transport_needed,
                    studentDetails.transport_tagged,
                    studentDetails.transport_pickup_drop,
                    studentDetails.Consent // Correct field
                ];

                connection.query(query, values, (error, result) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Error submitting enrollment form:', error);
                            res.status(500).json({ error: 'Error submitting enrollment form' });
                        });
                    }

                    // Generate the UID for insertion using the previously stored newStudentId and log it
                    const appUid = `${formattedSchoolName}_student_${newStudentId}`;
                    console.log(`Generated app_uid: ${appUid}`);

                    // Update the test_student_details table with the app_uid
                    const updateQuery = `UPDATE test_student_details SET app_uid = ? WHERE student_id = ?`;
                    connection.query(updateQuery, [appUid, newStudentId], (updateError) => {
                        if (updateError) {
                            return connection.rollback(() => {
                                console.error('Error updating app_uid:', updateError);
                                res.status(500).json({ error: 'Error updating app_uid' });
                            });
                        }

                        // Commit the transaction after all queries succeed
                        connection.commit(commitError => {
                            if (commitError) {
                                return connection.rollback(() => {
                                    console.error('Transaction commit failed:', commitError);
                                    res.status(500).json({ error: 'Transaction commit failed' });
                                });
                            }

                            console.log('Transaction committed successfully.');
                            res.status(200).json({ message: 'Enrollment form submitted successfully', appUid });
                        });
                    });
                });
            });
        });
    });
});

function generateUsernameAndPassword(fullName, schoolName) {
    // Split the full name by spaces to extract the name parts
    const nameParts = fullName.split(/\s+/);

    // Get the first letter from the first name and the first three letters from the last name
    const firstPart = nameParts[0].slice(0, 2).toLowerCase();  // First two letter of first name
    const secondPart = nameParts[1].slice(0, 2).toLowerCase(); // First two letters of last name
    const lastPart = nameParts[2].slice(0, 2).toLowerCase();   // First two letters of last name 

    // Combine the parts to form the username
    const username = `${firstPart}${secondPart}${lastPart}`;

    // Get the first three letters of the school name
    const schoolAbbr = schoolName.split(" ").map(word => word[0]).join("").toLowerCase();

    // Create the password by combining the school abbreviation and the username
    const password = `${schoolAbbr}@${username}`;

    return { username, password };
}

module.exports = router;