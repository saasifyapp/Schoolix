// Initialize an object to store all the form data
let formData = {
    studentInformation: {},
    guardianInformation: {},
    academicInformation: {},
    feesInformation: {},
    transportInformation: {},
    consent: {
        selected: '' // Initialize consent.selected with an empty string
    }
};

// Function to collect data from the Student Information section
function collectStudentInformation() {
    const selectedDocumentsString = selectedDocuments.join(','); // Convert the array to a comma-separated string

    formData.studentInformation = {
        firstName: document.getElementById('firstName').value.trim(),
        middleName: document.getElementById('middleName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        fullName: document.getElementById('fullName').value.trim(),
        dob: document.getElementById('dob').value,
        placeOfBirth: document.getElementById('placeOfBirth').value.trim(),
        age: document.getElementById('age').value.trim(),
        gender: document.getElementById('gender').value.trim(),
        bloodGroup: document.getElementById('bloodGroup').value.trim(),
        studentContact: document.getElementById('studentContact').value.trim(),
        currentAddress: {
            cityVillage: document.getElementById('city_village').value.trim(),
            taluka: document.getElementById('taluka').value.trim(),
            district: document.getElementById('district').value.trim(),
            state: document.getElementById('state').value.trim(),
            landmark: document.getElementById('landmak').value.trim(),
            pinCode: document.getElementById('pinCode').value.trim(),
        },
        nationality: document.getElementById('nationality').value.trim(),
        religion: document.getElementById('religion').value.trim(),
        category: document.getElementById('category').value.trim(),
        caste: document.getElementById('caste').value.trim(),
        domicile: document.getElementById('domicile').value.trim(),
        motherTongue: document.getElementById('motherTongue').value.trim(),
        aadharNo: document.getElementById('aadhaar').value.trim(),
        documents: selectedDocumentsString // Use the comma-separated string of selected documents
    };
    // console.log('Collected student information:', formData);  // Debugging log
    //return formData;
}


// Function to collect data from the Guardian Information section
function collectGuardianInformation() {
    formData.guardianInformation = {
        father: {
            firstName: document.getElementById('fatherFirstName').value,
            middleName: document.getElementById('fatherMiddleName').value,
            lastName: document.getElementById('fatherLastName').value,
            fullName: document.getElementById('fatherFullName').value,
            contactNumber: document.getElementById('fatherContactNumber').value,
            qualification: document.getElementById('fatherQualification').value,
            occupation: document.getElementById('fatherOccupation').value
        },
        mother: {
            firstName: document.getElementById('motherFirstName').value,
            lastName: document.getElementById('motherLastName').value,
            fullName: document.getElementById('motherFullName').value,
            contactNumber: document.getElementById('motherContactNumber').value,
            qualification: document.getElementById('motherQualification').value,
            occupation: document.getElementById('motherOccupation').value
        },
        localGuardian: {
            name: document.getElementById('guardianName').value,
            contact: document.getElementById('guardianContact').value,
            relation: document.getElementById('guardianRelation').value,
            fullAddress: document.getElementById('guardian_fullAddress').value,
            landmark: document.getElementById('guardianAddressLandmark').value,
            pinCode: document.getElementById('guardianpinCode').value
        }
    };
}

// Function to collect data from the Academic Information section
function collectAcademicInformation() {
    formData.academicInformation = {
        section: document.getElementById('section').value.trim(),
        grNo: document.getElementById('grNo').value.trim(),
        admissionDate: document.getElementById('admissionDate').value.trim(),
        standard: document.getElementById('standard').value.trim(),
        division: document.getElementById('division').value.trim(),
        lastSchoolAttended: document.getElementById('lastSchoolAttended').value.trim(),
        classCompleted: document.getElementById('classCompleted').value.trim(),
        percentage: document.getElementById('percentage').value.trim(),
        newAdmission: document.getElementById('newAdmission').checked // Capture checkbox status
    };
    //console.log('Collected academic information:', formData);  // Debugging log
}


// Function to collect data from the Fees and Packages section
// function collectFeesInformation() {
//     formData.feesInformation = {
//         feeSection: document.getElementById('feeSection').value,
//         feeStandard: document.getElementById('feeStandard').value,
//         feeDivision: document.getElementById('feeDivision').value,
//         feeCategory: document.getElementById('feeCategory').value,
//         packageAllotted: document.getElementById('packageAllotted').value
//     };
// }

function collectFeesInformation() {
    // Initialize the formData object if it doesn't already exist
    if (!formData) {
        formData = {};
    }

    // Collecting basic fee-related information
    formData.feesInformation = {
        feeSection: document.getElementById('feeSection')?.value.trim() || "",
        feeStandard: document.getElementById('feeStandard')?.value.trim() || "",
        feeDivision: document.getElementById('feeDivision')?.value.trim() || "",
        feeDetails: [],
        totalPackageAmount: 0
    };

    // Collecting fee category and amount details from the table
    const tableRows = document.querySelectorAll('#feeCategoryAmountTable tr');
    tableRows.forEach((row, index) => {
        if (index < tableRows.length - 1) { // Exclude the total row
            const cells = row.querySelectorAll('td');
            if (cells.length === 2) {
                const categoryName = cells[0].textContent.trim();
                const amount = parseFloat(cells[1].textContent.trim()) || 0;
                formData.feesInformation.feeDetails.push({ categoryName, amount });
            }
        } else {
            // Extract the total amount from the last row (Total Package)
            const totalAmountCell = row.querySelectorAll('td')[1];
            formData.feesInformation.totalPackageAmount = parseFloat(totalAmountCell.textContent.trim()) || 0;
        }
    });

    // Convert feeDetails to a comma-separated string for package_breakup
    formData.package_breakup = formData.feesInformation.feeDetails
        .map(detail => `${detail.categoryName}: ${detail.amount}`)
        .join(', ');

    // Set total_package
    formData.total_package = formData.feesInformation.totalPackageAmount;

    console.log('Collected fees information:', formData);  // Debugging log
}



// // Function to collect data from the Transport Services section
// function collectTransportInformation() {
//     formData.transportInformation = {
//         transportNeeded: document.querySelector('input[name="transportNeeded"]:checked') ? document.querySelector('input[name="transportNeeded"]:checked').value : null,
//         transportStandard: document.getElementById('transportStandard').value,
//         transportDivision: document.getElementById('transportDivision').value,
//         pickDropAddress: document.getElementById('pickDropAddress').value,
//         vehicleRunning: document.getElementById('vehicleRunning').value,
//         vehicleDetails: document.getElementById('vehicleDetails').value
//     };
// }

function collectTransportInformation() {
    const transportNeeded = document.querySelector('input[name="transportNeeded"]:checked')
        ? document.querySelector('input[name="transportNeeded"]:checked').value
        : null;

    if (transportNeeded === "No") {
        formData.transportInformation = {
            transport_needed: 0,
            transport_tagged: null,
            transport_pickup_drop: null
        };
    } else if (transportNeeded === "Yes") {
        formData.transportInformation = {
            transport_needed: 1,
            transport_tagged: document.getElementById('vehicleRunning').value.trim(), // Assuming 'vehicleRunning' is now 'transport_tagged'
            transport_pickup_drop: document.getElementById('pickDropAddress').value.trim(), // Assuming 'pickDropAddress' is 'transport_pickup_drop'
            vehicleDetails: document.getElementById('vehicleInfo')
                ? document.getElementById('vehicleInfo').innerText.trim()
                : null,
            noVehicleFound: document.getElementById('noVehicleFound').checked
        };
    } else {
        formData.transportInformation = {
            transport_needed: null,
            transport_tagged: null,
            transport_pickup_drop: null
        };
    }
}
// let isFormValid = true; // Global form validation flag

// Collect data on "Next" button click and move to the next section
document.getElementById('student-next').addEventListener('click', function () {
    // Reset the flag to true before validation
    let isFormValid = true;

    // Collect all the required fields
    const requiredFields = [
        { id: 'firstName', label: 'First Name' },
        { id: 'middleName', label: 'Middle Name' },
        { id: 'lastName', label: 'Last Name' },
        { id: 'dob', label: 'Date of Birth' },
        { id: 'placeOfBirth', label: 'Place of Birth' },
        { id: 'age', label: 'Age' },
        { id: 'gender', label: 'Gender' },
        { id: 'bloodGroup', label: 'Blood Group' },
        //{ id: 'studentContact', label: 'Student Contact No' },
        { id: 'city_village', label: 'City/Village' },
        { id: 'taluka', label: 'Taluka' },
        { id: 'district', label: 'District' },
        { id: 'state', label: 'State' },
        { id: 'landmak', label: 'Landmark' },
        { id: 'pinCode', label: 'PIN Code' },
        { id: 'nationality', label: 'Nationality' },
        { id: 'religion', label: 'Religion' },
        { id: 'category', label: 'Category' },
        { id: 'caste', label: 'Caste' },
        { id: 'domicile', label: 'Domicile' },
        { id: 'motherTongue', label: 'Mother Tongue' },
        { id: 'aadhaar', label: 'Aadhar Number' },
    ];

    // Array to store missing fields
    let missingFields = [];

    // Validate each field
    requiredFields.forEach(field => {
        const inputElement = document.getElementById(field.id);
        if (!inputElement.value.trim()) {
            missingFields.push(field.label);
            isFormValid = false; // Mark form as invalid
        }
    });

    // Additional validation for multi-select (documentInput)
    const selectedDocuments = document.getElementById('selectedDocuments').innerText.trim();
    if (!selectedDocuments) {
        missingFields.push('Documents');
        isFormValid = false; // Mark form as invalid
    }

    // If there are missing fields, show an alert
    if (!isFormValid) {
        Swal.fire({
            icon: 'error',
            title: 'Incomplete Form',
            html: `<p>The following fields are required:</p><ul>${missingFields.map(field => `<li>${field}</li>`).join('')}</ul>`,
        });
        return; // Stop execution
    }
    console.log(isFormValid)
    // If all fields are filled and valid, navigate to the next section
    if (isFormValid) {
        collectStudentInformation(); // Collect the data
        prefillGuardianNames(); // Prefill guardian details

        // Update the active state in the sidebar navigation
        const navItems = document.querySelectorAll('.form-navigation li');
        navItems.forEach(nav => nav.classList.remove('active')); // Remove active from all items

        // Find the current and next navigation items based on section order
        const currentNavItem = document.querySelector('#student-info'); // Current section nav ID
        const nextNavItem = document.querySelector('#guardian-info'); // Next section nav ID

        if (currentNavItem && nextNavItem) {
            currentNavItem.classList.remove('active'); // Remove active from the current item
            nextNavItem.classList.add('active'); // Add active to the next item
        }

        // Hide the current section and show the next section
        document.getElementById('student-information').style.display = 'none'; // Hide the current section
        document.getElementById('guardian-information').style.display = 'block'; // Show the next section
    }
});


document.getElementById('guardian-next').addEventListener('click', function () {
    let isFormValid = true; // Validation flag
    let missingFields = []; // Array to store missing fields
    let errorMessage = ''; // String to hold the error message

    // Check if Local Guardian radio button is selected
    const localGuardianRadio = document.querySelector('input[name="localGuardianNeeded"]:checked');
    if (!localGuardianRadio) {
        errorMessage = 'Please check whether a Local Guardian is required (Yes or No) before proceeding.';
        isFormValid = false; // Mark form as invalid
    }

    // Required fields for validation
    const guardianFields = [
        { id: 'fatherFirstName', label: "Father's First Name" },
        { id: 'fatherMiddleName', label: "Father's Middle Name" },
        { id: 'fatherLastName', label: "Father's Last Name" },
        { id: 'fatherContactNumber', label: "Father's Contact Number" },
        { id: 'fatherQualification', label: "Father's Qualification" },
        { id: 'fatherOccupation', label: "Father's Occupation" },
        { id: 'motherFirstName', label: "Mother's First Name" },
        { id: 'motherLastName', label: "Mother's Last Name" },
        //{ id: 'motherContactNumber', label: "Mother's Contact Number" },
        { id: 'motherQualification', label: "Mother's Qualification" },
        { id: 'motherOccupation', label: "Mother's Occupation" },
    ];

    // Validate each field
    guardianFields.forEach(field => {
        const inputElement = document.getElementById(field.id);
        if (inputElement && !inputElement.value.trim()) {
            missingFields.push(field.label);
            isFormValid = false; // Mark form as invalid
        }
    });

    // Additional validation for Local Guardian if "Yes" is selected
    if (localGuardianRadio && localGuardianRadio.value === 'yes') {
        const localGuardianFields = [
            { id: 'guardianName', label: "Guardian's Name" },
            { id: 'guardianContact', label: "Guardian's Contact" },
            { id: 'guardianRelation', label: "Relationship with Guardian" },
            { id: 'guardian_fullAddress', label: "Guardian's Address" },
            { id: 'guardianAddressLandmark', label: "Landmark" },
            { id: 'guardianpinCode', label: "PIN Code" },
        ];

        localGuardianFields.forEach(field => {
            const inputElement = document.getElementById(field.id);
            if (inputElement && !inputElement.value.trim()) {
                missingFields.push(field.label);
                isFormValid = false; // Mark form as invalid
            }
        });
    }

    // If the form is invalid, show an alert with the missing fields
    if (!isFormValid) {
        let errorContent = '';

        if (errorMessage) {
            errorContent = `<p>${errorMessage}</p>`;
        }

        if (missingFields.length > 0) {
            errorContent += `<p>The following fields are required:</p><ul>${missingFields.map(field => `<li>${field}</li>`).join('')}</ul>`;
        }

        Swal.fire({
            icon: 'error',
            title: 'Incomplete Form',
            html: errorContent,
        });
        return; // Stop execution if form is invalid
    }

    // If form is valid, proceed to the next section
    if (isFormValid) {
        console.log(formData);
        collectGuardianInformation();

        // Update the active state in the sidebar navigation
        const navItems = document.querySelectorAll('.form-navigation li');
        navItems.forEach(nav => nav.classList.remove('active')); // Remove active from all items

        // Find the current and next navigation items based on section order
        const currentNavItem = document.querySelector('#guardian-info'); // Current section nav ID
        const nextNavItem = document.querySelector('#academic-info'); // Next section nav ID

        if (currentNavItem && nextNavItem) {
            currentNavItem.classList.remove('active'); // Remove active from the current item
            nextNavItem.classList.add('active'); // Add active to the next item
        }

        document.getElementById('guardian-information').style.display = 'none';
        document.getElementById('academic-information').style.display = 'block';
    }
});

document.getElementById('academic-next').addEventListener('click', function () {
    let isFormValid = true; // Validation flag
    let missingFields = []; // Array to store missing fields

    // Required fields for validation
    const academicFields = [
        { id: 'section', label: 'Section' },
        { id: 'admissionDate', label: 'Admission Date' },
        { id: 'standard', label: 'Standard' },
        { id: 'division', label: 'Division' },
    ];

    // Validate each field
    academicFields.forEach(field => {
        const inputElement = document.getElementById(field.id);
        if (inputElement && !inputElement.value.trim()) {
            missingFields.push(field.label);
            isFormValid = false; // Mark form as invalid
        }
    });

    // Additional validation for Previous Academic Records if "New Admission" is not checked
    const isNewAdmission = document.getElementById('newAdmission').checked;
    if (!isNewAdmission) {
        const previousAcademicFields = [
            { id: 'lastSchoolAttended', label: 'Last School Attended' },
            { id: 'classCompleted', label: 'Class Completed' },
            { id: 'percentage', label: 'Percentage' },
        ];

        previousAcademicFields.forEach(field => {
            const inputElement = document.getElementById(field.id);
            if (inputElement && !inputElement.value.trim()) {
                missingFields.push(field.label);
                isFormValid = false; // Mark form as invalid
            }
        });
    }

    // If the form is invalid, show an alert with the missing fields
    if (!isFormValid) {
        Swal.fire({
            icon: 'error',
            title: 'Incomplete Form',
            html: `<p>The following fields are required:</p><ul>${missingFields.map(field => `<li>${field}</li>`).join('')}</ul>`,
        });
        return; // Stop execution
    }

    // If form is valid, proceed to the next section
    if (isFormValid) {
        console.log(formData);
        collectAcademicInformation();
        prefillFeesDetails();

        // Update the active state in the sidebar navigation
        const navItems = document.querySelectorAll('.form-navigation li');
        navItems.forEach(nav => nav.classList.remove('active')); // Remove active from all items

        // Find the current and next navigation items based on section order
        const currentNavItem = document.querySelector('#academic-info'); // Current section nav ID
        const nextNavItem = document.querySelector('#fees-info'); // Next section nav ID

        if (currentNavItem && nextNavItem) {
            currentNavItem.classList.remove('active'); // Remove active from the current item
            nextNavItem.classList.add('active'); // Add active to the next item
        }

        document.getElementById('academic-information').style.display = 'none';
        document.getElementById('fees-information').style.display = 'block';
    }
});


document.getElementById('fees-next').addEventListener('click', function () {
    let isFormValid = true; // Validation flag
    let missingFields = []; // Array to store missing fields

    // Required fields for fee details validation
    const feeFields = [
        { id: 'feeSection', label: 'Section' },
        { id: 'feeStandard', label: 'Standard' },
        { id: 'feeDivision', label: 'Division' },
    ];

    // Validate each fee-related field
    feeFields.forEach(field => {
        const inputElement = document.getElementById(field.id);
        if (inputElement && !inputElement.value.trim()) {
            missingFields.push(field.label);
            isFormValid = false; // Mark form as invalid
        }
    });

    // Check if the table has been populated
    const tableRows = document.querySelectorAll('#feeCategoryAmountTable tr');
    if (tableRows.length <= 1) {  // No rows except the header or 'No Data' row
        missingFields.push('Fee Categories and Amounts');
        isFormValid = false; // Mark form as invalid
    }

    // If the form is invalid, show an alert with the missing fields using Swal
    if (!isFormValid) {
        Swal.fire({
            icon: 'error',
            title: 'Incomplete Form',
            html: `<p>Please generate the package first before proceeding.</p>`,
        });
        return; // Stop execution if form is invalid
    }

    // If form is valid, proceed to the next section
    if (isFormValid) {
        console.log(formData);
        collectFeesInformation(); // Collect form data
        prefillTransportDetails(); // Prefill transport details

        // Update the active state in the sidebar navigation
        const navItems = document.querySelectorAll('.form-navigation li');
        navItems.forEach(nav => nav.classList.remove('active')); // Remove active from all items

        // Find the current and next navigation items based on section order
        const currentNavItem = document.querySelector('#fees-info'); // Current section nav ID
        const nextNavItem = document.querySelector('#transport-info'); // Next section nav ID

        if (currentNavItem && nextNavItem) {
            currentNavItem.classList.remove('active'); // Remove active from the current item
            nextNavItem.classList.add('active'); // Add active to the next item
        }
        document.getElementById('fees-information').style.display = 'none'; // Hide fee section
        document.getElementById('transport-information').style.display = 'block'; // Show transport section
    }
});


document.getElementById('transport-next').addEventListener('click', function () {
    let isFormValid = true; // Validation flag
    let missingFields = []; // Array to store missing fields
    let errorMessage = ''; // String to hold the error message

    // Validate if Transport Needed is selected
    const transportNeeded = document.querySelector('input[name="transportNeeded"]:checked');
    if (!transportNeeded) {
        errorMessage = 'Please check whether the Transport is required (Yes or No) before proceeding.';
        isFormValid = false; // Mark form as invalid
    }

    // If 'Yes' is selected for Transport Needed, check required fields
    if (transportNeeded && transportNeeded.value === 'Yes') {
        // Required fields for transport services section
        const transportFields = [
            { id: 'transportStandard', label: 'Standard' },
            { id: 'transportDivision', label: 'Division' },
            { id: 'pickDropAddress', label: 'Pick/Drop Address' },
            { id: 'vehicleRunning', label: 'Vehicle Running' }
        ];

        // Validate each transport-related field
        transportFields.forEach(field => {
            const inputElement = document.getElementById(field.id);
            if (inputElement && !inputElement.value.trim()) {
                missingFields.push(field.label);
                isFormValid = false; // Mark form as invalid
            }
        });

        // Validation for transport information
        const noVehicleFound = document.getElementById('noVehicleFound').checked;
        const vehicleRunningField = document.getElementById('vehicleRunning');
        const vehicleRunning = vehicleRunningField.value.trim();

        if (noVehicleFound) {
            // If "No Vehicle Found" is checked, ensure "Vehicle Running" is empty
            if (vehicleRunning !== "") {
                // Clear the vehicle running field if it's not empty
                vehicleRunningField.value = "";
                console.log("Vehicle Running field cleared as 'No Vehicle Found' is checked.");
            }
            // Skip further validation for "Vehicle Running"
            isFormValid = true;
        } else {
            // If "No Vehicle Found" is not checked, validate "Vehicle Running"
            if (!vehicleRunning) {
                missingFields.push('Vehicle Running (Specify if no vehicle is found)');
                isFormValid = false; // Mark form as invalid
            }
        }


    }

   // If the form is invalid, show an alert with the missing fields
   if (!isFormValid) {
    let errorContent = '';

    if (errorMessage) {
        errorContent = `<p>${errorMessage}</p>`;
    }

    if (missingFields.length > 0) {
        errorContent += `<p>The following fields are required:</p><ul>${missingFields.map(field => `<li>${field}</li>`).join('')}</ul>`;
    }

    Swal.fire({
        icon: 'error',
        title: 'Incomplete Form',
        html: errorContent,
    });
    return; // Stop execution if form is invalid
}

    // If form is valid, proceed to the next section
    if (isFormValid) {
        console.log(formData);
        collectTransportInformation(); // Collect transport data
        populateReviewValues(); // Populate review section with collected data

        // Update the active state in the sidebar navigation
        const navItems = document.querySelectorAll('.form-navigation li');
        navItems.forEach(nav => nav.classList.remove('active')); // Remove active from all items

        // Find the current and next navigation items based on section order
        const currentNavItem = document.querySelector('#transport-info'); // Current section nav ID
        const nextNavItem = document.querySelector('#review-info'); // Next section nav ID

        if (currentNavItem && nextNavItem) {
            currentNavItem.classList.remove('active'); // Remove active from the current item
            nextNavItem.classList.add('active'); // Add active to the next item
        }

        document.getElementById('transport-information').style.display = 'none'; // Hide transport section
        document.getElementById('review-information').style.display = 'block'; // Show review section
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////
// Function to pre-fill Father's and Mother's last names, and full names
function prefillGuardianNames() {
    const studentMiddleName = formData.studentInformation.middleName;
    const lastName = formData.studentInformation.lastName;

    document.getElementById('fatherLastName').value = lastName;
    document.getElementById('motherLastName').value = lastName;
    document.getElementById('fatherFirstName').value = studentMiddleName;
    document.getElementById('fatherFullName').value = `${studentMiddleName} ${lastName}`;
    document.getElementById('motherFullName').value = lastName;
}

// Function to prefill Section, Standard and Division
function prefillFeesDetails() {
    const section = formData.academicInformation.section;
    const standard = formData.academicInformation.standard;
    const division = formData.academicInformation.division;

    document.getElementById('feeSection').value = section || "";
    document.getElementById('feeStandard').value = standard || "";
    document.getElementById('feeDivision').value = division || "";
}

// // Collect data on "Next" button click and move to the next section
// document.getElementById('academic-next').addEventListener('click', function () {
//     collectAcademicInformation();
//     prefillFeesDetails(); // Call prefill function immediately after collecting academic information
//     document.getElementById('academic-information').style.display = 'none';
//     document.getElementById('fees-information').style.display = 'block';
// });

// Function to prefill Standard and Division in the Transport section
function prefillTransportDetails() {
    const standard = formData.academicInformation.standard;
    const division = formData.academicInformation.division;

    document.getElementById('transportStandard').value = standard || "";
    document.getElementById('transportDivision').value = division || "";
}

// function populateReviewValues() {
//     // Helper function to set values or defaults
//     function setField(id, value) {
//         document.getElementById(id).textContent = value || "Not Provided";
//     }

//     // Student Information
//     const studentInfo = formData.studentInformation;
//     setField("review-fullName", studentInfo.fullName);
//     setField("review-dob", studentInfo.dob);
//     setField("review-placeOfBirth", studentInfo.placeOfBirth);
//     setField("review-age", studentInfo.age);
//     setField("review-gender", studentInfo.gender);
//     setField("review-bloodGroup", studentInfo.bloodGroup);
//     setField("review-studentContact", studentInfo.studentContact);

//     const address = `${studentInfo.currentAddress.cityVillage || ""}, ${studentInfo.currentAddress.taluka || ""}, ${studentInfo.currentAddress.district || ""}, ${studentInfo.currentAddress.state || ""} - ${studentInfo.currentAddress.pinCode || ""}`;
//     setField("review-address", address);

//     setField("review-nationality", studentInfo.nationality);
//     setField("review-religion", studentInfo.religion);
//     setField("review-category", studentInfo.category);
//     setField("review-caste", studentInfo.caste);
//     setField("review-domicile", studentInfo.domicile);
//     setField("review-motherTongue", studentInfo.motherTongue);
//     setField("review-aadharNo", studentInfo.aadharNo);
//     setField("review-documents", studentInfo.documents);

//     // Guardian Information
//     const guardianInfo = formData.guardianInformation;
//     setField("review-fatherName", guardianInfo.father.fullName || "Not Provided");
//     setField("review-motherName", guardianInfo.mother.fullName || "Not Provided");

//     const localGuardian = guardianInfo.localGuardian.name
//         ? guardianInfo.localGuardian.name
//         : "NO";
//     setField("review-localGuardian", localGuardian);

//     // Academic Information
//     const academicInfo = formData.academicInformation;
//     setField("review-section", academicInfo.section);
//     setField("review-standard", academicInfo.standard);
//     setField("review-division", academicInfo.division);
//     setField("review-lastSchool", academicInfo.lastSchoolAttended);
//     setField("review-percentage", academicInfo.percentage);

//     // Fees Information
//     const feesInfo = formData.feesInformation;
//     setField("review-feeSection", feesInfo.feeSection);
//     setField("review-feeStandard", feesInfo.feeStandard);
//     // setField("review-package", feesInfo.packageAllotted);

//     // Populate Fee Details Table
//     const feeDetailsTable = document.getElementById("feeDetailsTableBody");
//     feeDetailsTable.innerHTML = ""; // Clear existing rows

//     if (feesInfo.feeDetails.length > 0) {
//         feesInfo.feeDetails.forEach(detail => {
//             const row = document.createElement("tr");
//             row.innerHTML = `
//                 <td>${detail.categoryName}</td>
//                 <td>${detail.amount.toFixed(2)}</td>
//             `;
//             feeDetailsTable.appendChild(row);
//         });

//         // Add Total Package Amount
//         const totalRow = document.createElement("tr");
//         totalRow.innerHTML = `
//             <td><strong>Total</strong></td>
//             <td><strong>${feesInfo.totalPackageAmount.toFixed(2)}</strong></td>
//         `;
//         feeDetailsTable.appendChild(totalRow);
//     } else {
//         // If no fee details are available
//         const emptyRow = document.createElement("tr");
//         emptyRow.innerHTML = `<td colspan="2">No Fee Details Available</td>`;
//         feeDetailsTable.appendChild(emptyRow);
//     }
// }

function populateReviewValues() {
    // Helper function to set values or defaults
    function setField(id, value) {
        const element = document.getElementById(id);
        if (element) {
            const displayValue = value === null || value === undefined || value.trim() === "" ? "Not Provided" : value;

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = displayValue;
            } else {
                element.textContent = displayValue;
            }
        } else {
            console.error(`Element with id "${id}" not found.`);
        }
    }

    // Student Information
    const studentInfo = formData.studentInformation || {}; // Ensure studentInfo is an object
    setField("review-fullName", studentInfo.fullName);
    setField("review-dob", studentInfo.dob);
    setField("review-placeOfBirth", studentInfo.placeOfBirth);
    setField("review-age", studentInfo.age);
    setField("review-gender", studentInfo.gender);
    setField("review-bloodGroup", studentInfo.bloodGroup);
    setField("review-studentContact", studentInfo.studentContact);

    // Ensure currentAddress exists and is an object
    const currentAddress = studentInfo.currentAddress || {};
    const address = `${currentAddress.cityVillage || "Not Provided"}, ${currentAddress.taluka || "Not Provided"}, ${currentAddress.district || "Not Provided"}, ${currentAddress.state || "Not Provided"} - ${currentAddress.pinCode || "Not Provided"}`;
    setField("review-address", address);

    setField("review-nationality", studentInfo.nationality);
    setField("review-religion", studentInfo.religion);
    setField("review-category", studentInfo.category);
    setField("review-caste", studentInfo.caste);
    setField("review-domicile", studentInfo.domicile);
    setField("review-motherTongue", studentInfo.motherTongue);
    setField("review-aadharNo", studentInfo.aadharNo);
    setField("review-documents", studentInfo.documents);

    // Guardian Information
    const guardianInfo = formData.guardianInformation || {};
    setField("review-fatherName", guardianInfo.father?.fullName || "N/A");
    setField("review-motherName", guardianInfo.mother?.fullName || "N/A");

    const localGuardian = guardianInfo.localGuardian?.name || "N/A";
    setField("review-localGuardian", localGuardian);

    // Academic Information
    const academicInfo = formData.academicInformation || {};
    setField("review-section", academicInfo.section);
    setField("review-standard", academicInfo.standard);
    setField("review-division", academicInfo.division);

    // Check if previous school details should be displayed
    const previousSchoolDetails = document.getElementById("previousSchoolDetails");
    if (academicInfo.newAdmission) {
        previousSchoolDetails.style.display = "none"; // Hide previous school details
        document.getElementById("review-academic-tag").style.display = "block";
        setField("review-academics", "No Academic History");
    } else {
        previousSchoolDetails.style.display = "block"; // Show previous school details
        setField("review-lastSchool", academicInfo.lastSchoolAttended || "N/A");
        setField("review-classCompleted", academicInfo.classCompleted || "N/A");
        setField("review-percentage", academicInfo.percentage || "N/A");
    }


    // Fees Information
    const feesInfo = formData.feesInformation || {};
    setField("review-feeSection", feesInfo.feeSection);
    setField("review-feeStandard", feesInfo.feeStandard);

    // Transport Information
    const transportInfo = formData.transportInformation || {};

    // Set Transport Needed field
    const transportNeeded = document.querySelector('input[name="transportNeeded"]:checked')?.value || "No";
    setField("review-transportNeeded", transportNeeded);

    // Show or hide the transport details section based on transportNeeded value
    const transportDetailsSection = document.getElementById("transportDetailsSection");
    if (transportNeeded === "Yes") {
        transportDetailsSection.style.display = "block";
        // setField("review-transportStandard", transportInfo.transportStandard || "N/A");
        // setField("review-transportDivision", transportInfo.transportDivision || "N/A");
        setField("review-pickDropAddress", transportInfo.transport_pickup_drop || "N/A");
        // setField("review-vehicleRunning", transportInfo.vehicleRunning || "N/A");
        setField("review-vehicleDetails", transportInfo.vehicleDetails || "N/A");
        // setField("review-noVehicleFound", transportInfo.noVehicleFound ? "Yes" : "No");
    } else {
        transportDetailsSection.style.display = "none";
        setField("review-transportNeeded", "Student doesn't need transport.");
    }


    // Populate Fee Details Table
    const feeDetailsTable = document.getElementById("feeDetailsTableBody");
    feeDetailsTable.innerHTML = ""; // Clear existing rows

    if (feesInfo.feeDetails && feesInfo.feeDetails.length > 0) {
        feesInfo.feeDetails.forEach(detail => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${detail.categoryName}</td>
                <td>${detail.amount.toFixed(2)}</td>
            `;
            feeDetailsTable.appendChild(row);
        });

        // Add Total Package Amount
        const totalRow = document.createElement("tr");
        totalRow.innerHTML = `
            <td><strong>Total</strong></td>
            <td><strong>${feesInfo.totalPackageAmount.toFixed(2)}</strong></td>
        `;
        feeDetailsTable.appendChild(totalRow);
    } else {
        // If no fee details are available
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="2">No Fee Details Available</td>`;
        feeDetailsTable.appendChild(emptyRow);
    }
}



function autofillFormFields() {
    // Autofill Student Information
    document.getElementById('firstName').value = "Tapu";
    document.getElementById('middleName').value = "Jethalal";
    document.getElementById('lastName').value = "Gada";
    document.getElementById('fullName').value = "Tapu Jethalal Gada";
    document.getElementById('dob').value = "2012-05-10";
    document.getElementById('placeOfBirth').value = "Mumbai";
    document.getElementById('age').value = "12";
    document.getElementById('gender').value = "Male";
    document.getElementById('bloodGroup').value = "B+";
    document.getElementById('studentContact').value = "9876543210";

    // Autofill Current Address
    document.getElementById('city_village').value = "Mumbai";
    document.getElementById('taluka').value = "Borivali";
    document.getElementById('district').value = "Mumbai Suburban";
    document.getElementById('state').value = "Maharashtra";
    document.getElementById('landmak').value = "Near Gokuldham Society";
    document.getElementById('pinCode').value = "400092";

    // Autofill Other Student Details
    document.getElementById('nationality').value = "Indian";
    document.getElementById('religion').value = "Hindu";
    document.getElementById('category').value = "General";
    document.getElementById('caste').value = "Not Applicable";
    document.getElementById('domicile').value = "Maharashtra";
    document.getElementById('motherTongue').value = "Gujarati";
    document.getElementById('aadhaar').value = "123456789012";

    // Autofill Guardian Information
    document.getElementById('fatherFirstName').value = "Jethalal";
    document.getElementById('fatherMiddleName').value = "Champaklal";
    document.getElementById('fatherLastName').value = "Gada";
    // document.getElementById('fatherFullName').value = "Jethalal Champaklal Gada";
    document.getElementById('fatherContactNumber').value = "9876543211";
    document.getElementById('fatherQualification').value = "B.Com";
    document.getElementById('fatherOccupation').value = "Businessman";

    document.getElementById('motherFirstName').value = "Daya";
    document.getElementById('motherLastName').value = "Gada";
    // document.getElementById('motherFullName').value = "Daya Jethalal Gada";  
    document.getElementById('motherContactNumber').value = "9876543212";
    document.getElementById('motherQualification').value = "Housewife";
    document.getElementById('motherOccupation').value = "Not Applicable";

    document.getElementById('guardianName').value = "Champaklal Gada";
    document.getElementById('guardianContact').value = "9876543213";
    document.getElementById('guardianRelation').value = "Grandfather";
    document.getElementById('guardian_fullAddress').value = "Gokuldham Society, Mumbai";
    document.getElementById('guardianAddressLandmark').value = "Near Club House";
    document.getElementById('guardianpinCode').value = "400092";

    // Autofill Academic Information
    document.getElementById('section').value = "Primary";
    document.getElementById('grNo').value = "1615"; // No GR number autofilled
    // document.getElementById('admissionDate').value = ""; // No admission date autofilled
    document.getElementById('standard').value = "5th";
    document.getElementById('division').value = "Red";
    document.getElementById('lastSchoolAttended').value = "Gokuldham Primary School";
    document.getElementById('classCompleted').value = "4";
    document.getElementById('percentage').value = "90%";

    // Autofill Fees Information
    document.getElementById('feeSection').value = "Primary";
    document.getElementById('feeStandard').value = "5th";
    document.getElementById('feeDivision').value = "Red";
    document.getElementById('feeCategory').value = "General";
    document.getElementById('packageAllotted').value = "Full Year Plan";

    // Call the function to populate review values
    populateReviewValues();
}



///////////////////////////////////   SUBMIT DATA TO SERVER (FORM SUBMISSION) ////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("review-next").addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default button behavior

        // Validate that all consents are checked
        const allChecked = validateConsents();

        if (!allChecked) {
            // Display an alert if any checkbox is not checked
            Swal.fire({
                title: "Incomplete Consent",
                text: "Please ensure all consents are checked before proceeding.",
                icon: "warning",
                confirmButtonText: "OK"
            });
            return; // Prevent submission
        }

        // If all consents are checked, proceed with collectConsent and form submission
        collectConsent();
        //Submit all the form data
        submitForm(); 
    });
});

// Function to validate consents
function validateConsents() {
    // List of consent checkbox IDs
    const consentIds = [
        "consent-policies",
        "consent-photo",
        "consent-trips",
        "consent-medical",
        "consent-accuracy",
        "consent-fees",
        "consent-rules"
    ];

    // Check if all consents are checked
    return consentIds.every(id => {
        const checkbox = document.getElementById(id);
        return checkbox && checkbox.checked;
    });
}

// Function to collect all selected consents
function collectConsent() {
    const consents = [
        { id: "consent-policies", text: "I agree to the School Policies" },
        { id: "consent-photo", text: "I consent to Photo/Video use in School Activities" },
        { id: "consent-trips", text: " I consent to Participate in Field Trips and Extracurricular Activities" },
        { id: "consent-medical", text: "I consent to Emergency Medical Treatment" },
        { id: "consent-accuracy", text: "Declaration of Information Accuracy" },
        { id: "consent-fees", text: "Agreement to Pay Fees as per the chosen plan" },
        { id: "consent-rules", text: "Confirmation of understanding of school rules and regulations" }
    ];

    const selectedConsents = consents
        .filter(consent => document.getElementById(consent.id).checked) // Only include checked boxes
        .map(consent => consent.text) // Get the text of each selected consent
        .join(", "); // Combine the texts into a comma-separated string

          // Ensure that formData.consent is initialized
    if (!formData.consent) {
        formData.consent = {};
    }

    // Store the collected consents in the formData object
    formData.consent.selected = selectedConsents;
    console.log(formData);
}

function submitForm() {
    // Show the loading animation
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    overlay.style.visibility = 'visible';

    // Steps to display
    const steps = [
        'Submitting student information...',
        'Submitting guardian information...',
        'Submitting academic information...',
        'Submitting fees information...',
        'Submitting transport information...',
        'Submitting consent...'
    ];

    // Display each step with a delay
    let stepIndex = 0;
    const stepInterval = 1000; // 1 second per step
    const displaySteps = setInterval(() => {
        if (stepIndex < steps.length) {
            loadingText.textContent = steps[stepIndex];
            stepIndex++;
        } else {
            clearInterval(displaySteps);
        }
    }, stepInterval);

    // Simulate loading duration (minimum 6 seconds)
    const minimumLoadingTime = 6000; // 6 seconds
    const startTime = Date.now();

    fetch('/submitEnrollmentForm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error); // Trigger the error handler
            }

            // Calculate remaining time for the animation
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

            setTimeout(() => {
                // Hide the loading animation
                overlay.style.visibility = 'hidden';

                // Display success alert
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Form submitted successfully!',
                    confirmButtonText: 'OK'
                });
            }, remainingTime); // Ensure animation lasts at least 6 seconds
        })
        .catch(error => {
            // Hide the loading animation immediately on error
            overlay.style.visibility = 'hidden';

            // Display error alert
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to submit form',
                confirmButtonText: 'OK'
            });
        });
}
