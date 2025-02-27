const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed


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


router.get('/checkOutstandingAndTotalPackage', (req, res) => {
    const { section, grNo } = req.query;

    if (!section || !grNo) {
        return res.status(400).json({ error: 'Section and GR no are required' });
    }

    // Determine the table name based on the section
    let studentDetailsTable = 'test_student_details';
    if (section.toLowerCase() === 'primary') {
        studentDetailsTable = 'primary_student_details';
    } else if (section.toLowerCase() === 'pre-primary') {
        studentDetailsTable = 'pre_primary_student_details';
    }

    const query = `SELECT current_outstanding, total_package FROM ${studentDetailsTable} WHERE Grno = ?`;

    req.connectionPool.query(query, [grNo], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error fetching current outstanding and total package' });
        }

        if (results.length === 0) {
            // No record found, proceed with package generation
            return res.status(200).json({ proceedWithPackageGeneration: true });
        }

        const { current_outstanding, total_package } = results[0];
        res.status(200).json({ current_outstanding, total_package });
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

// router.post('/submitEnrollmentForm', (req, res) => {
//     const formData = req.body;

//     // Log the received data for debugging
//     console.log('Received data:', JSON.stringify(formData, null, 2));

//     if (!formData || !formData.studentInformation || !formData.guardianInformation || !formData.academicInformation || !formData.feesInformation || !formData.transportInformation) {
//         return res.status(400).json({ error: 'Invalid data received' });
//     }

//     const consentText = formData.consent.selected;

//     const {
//         firstName,
//         middleName,
//         lastName,
//         fullName,
//         dob,
//         placeOfBirth,
//         age,
//         gender,
//         bloodGroup,
//         studentContact,
//         currentAddress,
//         nationality,
//         religion,
//         category,
//         caste,
//         domicile,
//         motherTongue,
//         aadharNo,
//         documents
//     } = formData.studentInformation;

//     const { father, mother, localGuardian } = formData.guardianInformation;

//     const {
//         section,
//         grNo,
//         admissionDate,
//         standard,
//         division,
//         lastSchoolAttended,
//         classCompleted,
//         percentage
//     } = formData.academicInformation;

//     const {
//         package_breakup,
//         total_package
//     } = formData;

//     const {
//         transport_needed,
//         transport_tagged,
//         transport_pickup_drop
//     } = formData.transportInformation;

//     const studentDetails = {
//         Firstname: firstName,
//         Middlename: middleName,
//         Surname: lastName,
//         Name: fullName,
//         DOB: dob,
//         Age: age,
//         POB: placeOfBirth,
//         Gender: gender,
//         Blood_Group: bloodGroup,
//         Address: currentAddress.cityVillage,
//         landmark: currentAddress.landmark,
//         taluka: currentAddress.taluka,
//         district: currentAddress.district,
//         state: currentAddress.state,
//         pin_code: currentAddress.pinCode,
//         student_phone_no: studentContact,
//         Adhar_no: aadharNo,
//         Religion: religion,
//         Nationality: nationality,
//         Category: category,
//         Caste: caste,
//         Domicile: domicile,
//         Mother_Tongue: motherTongue,
//         Documents_Submitted: documents,
//         Father_name: father.firstName,
//         F_qualification: father.qualification,
//         F_occupation: father.occupation,
//         F_mobile_no: father.contactNumber,
//         Grand_father: father.middleName,
//         Mother_name: mother.firstName, // Only mother's first name
//         M_Qualification: mother.qualification,
//         M_occupation: mother.occupation,
//         M_mobile_no: mother.contactNumber,
//         guardian_name: localGuardian.name,
//         guardian_contact: localGuardian.contact,
//         guardian_relation: localGuardian.relation,
//         guardian_address: localGuardian.fullAddress,
//         guardian_landmark: localGuardian.landmark,
//         guardian_pin_code: localGuardian.pinCode,
//         Section: section,
//         Grno: grNo,
//         Admission_Date: admissionDate,
//         Standard: standard,
//         Division: division,
//         Last_School: lastSchoolAttended,
//         class_completed: classCompleted,
//         percentage_last_school: percentage.toString(),
//         package_breakup: package_breakup,
//         total_package: total_package,
//         transport_needed: transport_needed,
//         transport_tagged: transport_tagged,
//         transport_pickup_drop: transport_pickup_drop,
//         Consent: consentText
//     };

//     // Retrieve school name from cookie
//     const schoolName = req.cookies.schoolName;
//     if (!schoolName) {
//         return res.status(400).json({ error: 'School name is required' });
//     }

//     // Format school name to lowercase and replace spaces with underscores
//     const formattedSchoolName = schoolName.replace(/\s+/g, '_').toLowerCase();

//     // Start a transaction
//     req.connectionPool.getConnection((err, connection) => {
//         if (err) {
//             return res.status(500).json({ error: 'Database connection failed' });
//         }

//         connection.beginTransaction(error => {
//             if (error) {
//                 return res.status(500).json({ error: 'Transaction initiation failed' });
//             }

//             // Query to get the current highest student_id and increment it by 1
//             const incrementStudentIdQuery = `SELECT MAX(student_id) AS maxStudentId FROM test_student_details`;

//             connection.query(incrementStudentIdQuery, (incrementError, incrementResult) => {
//                 if (incrementError) {
//                     return connection.rollback(() => {
//                         console.error('Error retrieving student_id:', incrementError);
//                         res.status(500).json({ error: 'Error retrieving student_id' });
//                     });
//                 }

//                 const newStudentId = (incrementResult[0].maxStudentId || 0) + 1;
//                 console.log(`Fetched student_id: ${incrementResult[0].maxStudentId}, New student_id: ${newStudentId}`);

//                 const query = `INSERT INTO test_student_details (
//                     student_id, Firstname, Middlename, Surname, Name, DOB, Age, POB, Gender, Blood_Group, Address, 
//                     landmark, taluka, district, state, pin_code, student_phone_no, Adhar_no, Religion, Nationality, 
//                     Category, Caste, Domicile, Mother_Tongue, Documents_Submitted, Father_name, F_qualification, 
//                     F_occupation, F_mobile_no, Grand_father, Mother_name, M_Qualification, M_occupation, M_mobile_no, 
//                     guardian_name, guardian_contact, guardian_relation, guardian_address, guardian_landmark, guardian_pin_code, 
//                     Section, Grno, Admission_Date, Standard, Division, Last_School, class_completed, percentage_last_school, 
//                     package_breakup, total_package, transport_needed, transport_tagged, transport_pickup_drop, consent_text
//                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//                 const values = [
//                     newStudentId,
//                     studentDetails.Firstname,
//                     studentDetails.Middlename,
//                     studentDetails.Surname,
//                     studentDetails.Name,
//                     studentDetails.DOB,
//                     studentDetails.Age,
//                     studentDetails.POB,
//                     studentDetails.Gender,
//                     studentDetails.Blood_Group,
//                     studentDetails.Address,
//                     studentDetails.landmark,
//                     studentDetails.taluka,
//                     studentDetails.district,
//                     studentDetails.state,
//                     studentDetails.pin_code,
//                     studentDetails.student_phone_no,
//                     studentDetails.Adhar_no,
//                     studentDetails.Religion,
//                     studentDetails.Nationality,
//                     studentDetails.Category,
//                     studentDetails.Caste,
//                     studentDetails.Domicile,
//                     studentDetails.Mother_Tongue,
//                     studentDetails.Documents_Submitted,
//                     studentDetails.Father_name,
//                     studentDetails.F_qualification,
//                     studentDetails.F_occupation,
//                     studentDetails.F_mobile_no,
//                     studentDetails.Grand_father,
//                     studentDetails.Mother_name, // Only mother's first name
//                     studentDetails.M_Qualification,
//                     studentDetails.M_occupation,
//                     studentDetails.M_mobile_no,
//                     studentDetails.guardian_name,
//                     studentDetails.guardian_contact,
//                     studentDetails.guardian_relation,
//                     studentDetails.guardian_address,
//                     studentDetails.guardian_landmark,
//                     studentDetails.guardian_pin_code,
//                     studentDetails.Section,
//                     studentDetails.Grno,
//                     studentDetails.Admission_Date,
//                     studentDetails.Standard,
//                     studentDetails.Division,
//                     studentDetails.Last_School,
//                     studentDetails.class_completed,
//                     studentDetails.percentage_last_school,
//                     studentDetails.package_breakup,
//                     studentDetails.total_package,
//                     studentDetails.transport_needed,
//                     studentDetails.transport_tagged,
//                     studentDetails.transport_pickup_drop,
//                     studentDetails.Consent // Correct field
//                 ];

//                 connection.query(query, values, (error, result) => {
//                     if (error) {
//                         return connection.rollback(() => {
//                             console.error('Error submitting enrollment form:', error);
//                             res.status(500).json({ error: 'Error submitting enrollment form' });
//                         });
//                     }

//                     // Generate the UID for insertion using the previously stored newStudentId and log it
//                     const appUid = `${formattedSchoolName}_student_${newStudentId}`;
//                     console.log(`Generated app_uid: ${appUid}`);

//                     // Update the test_student_details table with the app_uid
//                     const updateQuery = `UPDATE test_student_details SET app_uid = ? WHERE student_id = ?`;
//                     connection.query(updateQuery, [appUid, newStudentId], (updateError) => {
//                         if (updateError) {
//                             return connection.rollback(() => {
//                                 console.error('Error updating app_uid:', updateError);
//                                 res.status(500).json({ error: 'Error updating app_uid' });
//                             });
//                         }

//                         const { username, password } = generateUsernameAndPassword(fullName, schoolName, grNo);

//                         // Insert into android_app_users table
//                         const insertIntoAndroidAppUsersQuery = `
//                             INSERT INTO android_app_users (username, password, school_name, type, name, uid)
//                             VALUES (?, ?, ?, ?, ?, ?)
//                         `;

//                         const userType = 'student'; // Assuming the type is 'student'
//                         const studentName = `${firstName} ${middleName} ${lastName}`;

//                         connection.query(insertIntoAndroidAppUsersQuery, [username, password, schoolName, userType, studentName, appUid], (androidAppUsersError) => {
//                             if (androidAppUsersError) {
//                                 return connection.rollback(() => {
//                                     console.error('Error inserting into android_app_users:', androidAppUsersError);
//                                     res.status(500).json({ error: 'Error inserting into android_app_users' });
//                                 });
//                             }

//                             // Commit the transaction after all queries succeed
//                             connection.commit(commitError => {
//                                 if (commitError) {
//                                     return connection.rollback(() => {
//                                         console.error('Transaction commit failed:', commitError);
//                                         res.status(500).json({ error: 'Transaction commit failed' });
//                                     });
//                                 }

//                                 console.log('Transaction committed successfully.');
//                                 res.status(200).json({ message: 'Enrollment form submitted successfully', appUid });
//                             });
//                         });
//                     });
//                 });
//             });
//         });
//     });
// });

router.post('/submitEnrollmentForm', (req, res) => {
    const formData = req.body;

    // Log the received data for debugging
   // console.log('Received data:', JSON.stringify(formData, null, 2));

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
        alpsankhyak,
        domicile,
        motherTongue,
        aadharNo,
        medicalStatus,
        medicalDescription,
        documents
    } = formData.studentInformation;

    const { father, mother, localGuardian } = formData.guardianInformation;

    const {
        section,
        grNo,
        admissionDate,
        standard,
        division,
        classOfAdmission,
        saralId,
        aaparId,
        penId,
        lastSchoolAttended,
        last_school_class_completed ,
        percentage
    } = formData.academicInformation;

    const {
        package_breakup,
        total_package
    } = formData.feesInformation;

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
        admitted_class: classOfAdmission,
        Last_School: lastSchoolAttended,
        last_school_class_completed: last_school_class_completed,
        percentage_last_school: percentage.toString(),
        package_breakup: formData.package_breakup,
        total_package: formData.total_package,
        current_outstanding: formData.total_package,  // For new enrollment, initially current outstanding is the total package
        transport_needed: transport_needed,
        transport_tagged: transport_tagged,
        transport_pickup_drop: transport_pickup_drop,
        Consent: consentText,
        medical_status: medicalStatus,
        medical_description: medicalDescription,
        alpsankhyak: alpsankhyak,
        saral_id: saralId,
        apar_id: aaparId,
        pen_id: penId,
        status: 1
    };

    // Retrieve school name from cookie
    const schoolName = req.cookies.schoolName;
    if (!schoolName) {
        return res.status(400).json({ error: 'School name is required' });
    }

    // Format school name to lowercase and replace spaces with underscores
    const formattedSchoolName = schoolName.replace(/\s+/g, '_').toLowerCase();

    // Determine the table name based on the section
    let tableName = 'test_student_details';
    if (section.toLowerCase() === 'primary') {
        tableName = 'primary_student_details';
    } else if (section.toLowerCase() === 'pre-primary') {
        tableName = 'pre_primary_student_details';
    }

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
            const incrementStudentIdQuery = `SELECT MAX(student_id) AS maxStudentId FROM ${tableName}`;

            connection.query(incrementStudentIdQuery, (incrementError, incrementResult) => {
                if (incrementError) {
                    return connection.rollback(() => {
                        console.error('Error retrieving student_id:', incrementError);
                        res.status(500).json({ error: 'Error retrieving student_id' });
                    });
                }

                const newStudentId = (incrementResult[0].maxStudentId || 0) + 1;
                //console.log(`Fetched student_id: ${incrementResult[0].maxStudentId}, New student_id: ${newStudentId}`);

                // Generate the UID for insertion using the new student_id and school name
                const appUid = `${formattedSchoolName}_student_${newStudentId}`;
                //console.log(`Generated app_uid: ${appUid}`);

                const query = `INSERT INTO ${tableName} (
                    student_id, Firstname, Middlename, Surname, Name, DOB, Age, POB, Gender, Blood_Group, Address, 
                    landmark, taluka, district, state, pin_code, student_phone_no, Adhar_no, Religion, Nationality, 
                    Category, Caste, Domicile, Mother_Tongue, Documents_Submitted, Father_name, F_qualification, 
                    F_occupation, F_mobile_no, Grand_father, Mother_name, M_Qualification, M_occupation, M_mobile_no, 
                    guardian_name, guardian_contact, guardian_relation, guardian_address, guardian_landmark, guardian_pin_code, 
                    Section, Grno, Admission_Date, Standard, Division, Last_School, last_school_class_completed, percentage_last_school, 
                    package_breakup, total_package, current_outstanding, transport_needed, transport_tagged, transport_pickup_drop, consent_text, app_uid, medical_status, medical_description, alpsankhyak, saral_id, apar_id, pen_id, admitted_class, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;

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
                    studentDetails.last_school_class_completed,
                    studentDetails.percentage_last_school,
                    studentDetails.package_breakup,
                    studentDetails.total_package,
                    studentDetails.current_outstanding,
                    studentDetails.transport_needed,
                    studentDetails.transport_tagged,
                    studentDetails.transport_pickup_drop,
                    studentDetails.Consent,
                    appUid,
                    studentDetails.medical_status, 
                    studentDetails.medical_description, 
                    studentDetails.alpsankhyak, 
                    studentDetails.saral_id, 
                    studentDetails.apar_id, 
                    studentDetails.pen_id,
                    studentDetails.admitted_class,
                    studentDetails.status, // status is always set to 1
                ];

                connection.query(query, values, (error, result) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Error submitting enrollment form:', error);
                            res.status(500).json({ error: 'Error submitting enrollment form' });
                        });
                    }

                    const { username, password } = generateUsernameAndPassword(fullName, schoolName, grNo);

                    // Insert into android_app_users table
                    const insertIntoAndroidAppUsersQuery = `
                        INSERT INTO android_app_users (username, password, school_name, type, name, uid)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;

                    const userType = 'student';
                    const studentName = `${firstName} ${middleName} ${lastName}`;

                    connection_auth.query(insertIntoAndroidAppUsersQuery, [username, password, schoolName, userType, studentName, appUid], (userError) => {
                        if (userError) {
                            return connection.rollback(() => {
                                console.error('Error inserting into android_app_users:', userError);
                                res.status(500).json({ error: 'Error inserting into android_app_users' });
                            });
                        }

                        // If transport-related information is needed, insert into the transport schedule table
                        if (transport_needed === 1) {
                            const concatenatedClass = `${standard} ${division}`; // e.g., '5th Red'
                            const transportPickDropAddress = formData.transportInformation.transport_pickup_drop; // Getting transport pick-up/drop-off address
                            const vehicleNo = formData.transportInformation.transport_tagged; // Getting vehicle number (vehicle tagged)

                            console.log(concatenatedClass, transportPickDropAddress, vehicleNo, transport_needed);

                            // First, get the id using vehicle_no, classes_alloted, and route_stops
                            const getIdQuery = `
                                SELECT id 
                                FROM transport_schedule_details
                                WHERE vehicle_no = ? 
                                AND classes_alloted LIKE ? 
                                AND route_stops LIKE ?
                            `;

                            connection.query(getIdQuery, [vehicleNo, `%${concatenatedClass}%`, `%${transportPickDropAddress}%`], (getIdError, results) => {
                                if (getIdError) {
                                    return connection.rollback(() => {
                                        console.error('Error fetching transport schedule id:', getIdError);
                                        res.status(500).json({ error: 'Error fetching transport schedule id' });
                                    });
                                }

                                if (results.length === 0) {
                                    console.log('No matching records found for the given parameters.');
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

                                    console.log('Rows affected:', updateResult.affectedRows);
                                    if (updateResult.affectedRows === 0) {
                                        console.log('No records were updated.');
                                    }

                                    // Commit transaction after all queries are successful
                                    connection.commit(commitError => {
                                        if (commitError) {
                                            return connection.rollback(() => {
                                                console.error('Transaction commit failed:', commitError);
                                                res.status(500).json({ error: 'Transaction commit failed' });
                                            });
                                        }

                                        res.status(200).json({ success: 'Enrollment submitted successfully', data: studentDetails });
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

                                res.json({ message: 'Enrollment form submitted successfully!', data: studentDetails });
                            });
                        }
                    });
                });
            });
        });
    });
});

function generateUsernameAndPassword(fullName, schoolName, grNo) {
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


////////////////////////// FETCH STUDENTS BASED ON SECTION AND GR ////////////////

router.get("/fetch-student", (req, res) => {
    const { grno, name, section } = req.query;

    // Log the received query parameters
    //console.log("Received query parameters:", { grno, name, section });

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
        // If section is not recognized
        return res.status(400).json({ error: "Invalid section parameter" });
    }
    
    // Log the determined table name
    //console.log("Using table:", tableName);

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

    // Log the constructed query and parameters
    console.log("Constructed query:", query);
    console.log("Query parameters:", queryParams);

    // Execute the query
    req.connectionPool.query(query, queryParams, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }

        // Log the query results
        console.log("Query results:", results);

        if (results.length === 0) {
            return res.status(404).json({ message: "No student found" });
        }

        // Check if the student is inactive
        if (results[0].is_active === 0) {
            return res.status(200).json({ message: "Student is inactive", student: results[0] });
        }

        // Return the results
        res.json(results);
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////// UPDATE STUDENT ENDPOINT ///////////////////////////////////////////


router.post('/updateStudentDetails', (req, res) => {
    const formData = req.body;

    console.log('Received update data:', JSON.stringify(formData, null, 2));

    if (!formData || !formData.academicInformation || !formData.academicInformation.grNo) {
        return res.status(400).json({ error: 'Invalid data received or grNo missing' });
    }

    const {
        studentInformation,
        guardianInformation,
        academicInformation,
        feesInformation,
        transportInformation,
        consent,
        package_breakup,
        total_package
    } = formData;

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
        alpsankhyak,
        domicile,
        motherTongue,
        aadharNo,
        medicalStatus,
        medicalDescription,
        documents
    } = studentInformation;

    const {
        father,
        mother,
        localGuardian
    } = guardianInformation;

    const {
        section,
        grNo,
        admissionDate,
        standard,
        division,
        classOfAdmission,
        saralId,
        aaparId,
        penId,
        lastSchoolAttended,
        last_school_class_completed,
        percentage
    } = academicInformation;

    const {
        transport_needed,
        transport_tagged,
        transport_pickup_drop
    } = transportInformation;

    const consentText = consent.selected;

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
        Mother_name: mother.firstName,
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
        admitted_class: classOfAdmission,
        Last_School: lastSchoolAttended,
        last_school_class_completed: last_school_class_completed,
        percentage_last_school: percentage?.toString() || '',
        package_breakup: package_breakup,
        total_package: total_package,
        current_outsntanding : total_package, 
        transport_needed: transport_needed,
        transport_tagged: transport_tagged,
        transport_pickup_drop: transport_pickup_drop,
        Consent: consentText,
        medical_status: medicalStatus,
        medical_description: medicalDescription,
        alpsankhyak: alpsankhyak,
        saral_id: saralId,
        apar_id: aaparId,
        pen_id: penId,
        status: 1
    };

    const schoolName = req.cookies.schoolName;
    if (!schoolName) {
        return res.status(400).json({ error: 'School name is required' });
    }

    let tableName = 'test_student_details';
    if (section.toLowerCase() === 'primary') {
        tableName = 'primary_student_details';
    } else if (section.toLowerCase() === 'pre-primary') {
        tableName = 'pre_primary_student_details';
    }

    req.connectionPool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        connection.beginTransaction(error => {
            if (error) {
                connection.release();
                return res.status(500).json({ error: 'Transaction initiation failed' });
            }

            // Select all current student data
            const selectQuery = `
                SELECT * 
                FROM ${tableName} 
                WHERE Grno = ? AND Section = ?
            `;

            connection.query(selectQuery, [grNo, section], (selectError, results) => {
                if (selectError) {
                    return connection.rollback(() => {
                        console.error('Error selecting current student data:', selectError);
                        connection.release();
                        res.status(500).json({ error: 'Error selecting current student data' });
                    });
                }

                if (results.length === 0) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(404).json({ error: 'No student found with the provided Grno and section' });
                    });
                }

                const currentStudentData = results[0];

                // Compare current data with new data and identify changes
                const changes = {};
                for (const key in currentStudentData) {
                    if (currentStudentData.hasOwnProperty(key) && studentDetails.hasOwnProperty(key)) {
                        const oldValue = currentStudentData[key] != null ? currentStudentData[key].toString() : '';
                        const newValue = studentDetails[key] != null ? studentDetails[key].toString() : '';
                        if (oldValue !== newValue) {
                            changes[key] = {
                                old: currentStudentData[key],
                                new: studentDetails[key]
                            };
                        }
                    }
                }

                console.log('Changes:', JSON.stringify(changes, null, 2));

                // Generate the new username and password
                const { username, password } = generateUsernameAndPassword(fullName, schoolName, grNo);
                const studentName = `${firstName} ${middleName} ${lastName}`;

                // Perform the update
                const updateQuery = `
                    UPDATE ${tableName} SET
                        Firstname = ?, Middlename = ?, Surname = ?, Name = ?, DOB = ?, Age = ?, POB = ?, Gender = ?, 
                        Blood_Group = ?, Address = ?, landmark = ?, taluka = ?, district = ?, state = ?, pin_code = ?, 
                        student_phone_no = ?, Adhar_no = ?, Religion = ?, Nationality = ?, Category = ?, Caste = ?, 
                        Domicile = ?, Mother_Tongue = ?, Documents_Submitted = ?, Father_name = ?, F_qualification = ?, 
                        F_occupation = ?, F_mobile_no = ?, Grand_father = ?, Mother_name = ?, M_Qualification = ?, 
                        M_occupation = ?, M_mobile_no = ?, guardian_name = ?, guardian_contact = ?, guardian_relation = ?, 
                        guardian_address = ?, guardian_landmark = ?, guardian_pin_code = ?, Section = ?, Admission_Date = ?, 
                        Standard = ?, Division = ?, Last_School = ?, last_school_class_completed = ?, percentage_last_school = ?, 
                        package_breakup = ?, total_package = ?, current_outstanding = ?, transport_needed = ?, transport_tagged = ?, 
                        transport_pickup_drop = ?, consent_text = ?, medical_status = ?, medical_description = ?, 
                        alpsankhyak = ?, saral_id = ?, apar_id = ?, pen_id = ?, admitted_class = ?
                    WHERE Grno = ?
                `;

                const updateValues = [
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
                    studentDetails.Mother_name,
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
                    studentDetails.Admission_Date,
                    studentDetails.Standard,
                    studentDetails.Division,
                    studentDetails.Last_School,
                    studentDetails.last_school_class_completed,
                    studentDetails.percentage_last_school,
                    studentDetails.package_breakup,
                    studentDetails.total_package,
                    studentDetails.total_package,
                    studentDetails.transport_needed,
                    studentDetails.transport_tagged,
                    studentDetails.transport_pickup_drop,
                    studentDetails.Consent,
                    studentDetails.medical_status,
                    studentDetails.medical_description,
                    studentDetails.alpsankhyak,
                    studentDetails.saral_id,
                    studentDetails.apar_id,
                    studentDetails.pen_id,
                    studentDetails.admitted_class,
                    grNo
                ];

                connection.query(updateQuery, updateValues, (updateError, updateResult) => {
                    if (updateError) {
                        return connection.rollback(() => {
                            console.error('Error updating student details:', updateError);
                            connection.release();
                            res.status(500).json({ error: 'Error updating student details' });
                        });
                    }

                    if (updateResult.affectedRows === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(404).json({ error: 'No student found with the provided Grno' });
                        });
                    }

                    const updateAndroidQuery = `
                    UPDATE android_app_users SET
                        username = ?, 
                        password = ?,
                        name = ?
                    WHERE uid = ?
                    `;

                    const androidUpdateValues = [username, password, studentName, currentStudentData.app_uid];

                    connection_auth.query(updateAndroidQuery, androidUpdateValues, (androidUpdateError, androidUpdateResult) => {
                        if (androidUpdateError) {
                            return connection.rollback(() => {
                                console.error('Error updating android_app_users:', androidUpdateError);
                                connection.release();
                                res.status(500).json({ error: 'Error updating android_app_users' });
                            });
                        }

                        connection.commit(commitError => {
                            if (commitError) {
                                return connection.rollback(() => {
                                    console.error('Transaction commit failed:', commitError);
                                    connection.release();
                                    res.status(500).json({ error: 'Transaction commit failed' });
                                });
                            }
                            connection.release();
                            res.json({ message: 'Student details and Android app user updated successfully!', changes });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;