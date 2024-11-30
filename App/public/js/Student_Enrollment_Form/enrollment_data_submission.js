// Initialize an object to store all the form data
let formData = {
    studentInformation: {},
    guardianInformation: {},
    academicInformation: {},
    feesInformation: {},
    transportInformation: {}
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
        section: document.getElementById('section').value,
        grNo: document.getElementById('grNo').value,
        admissionDate: document.getElementById('admissionDate').value,
        standard: document.getElementById('standard').value,
        division: document.getElementById('division').value,
        lastSchoolAttended: document.getElementById('lastSchoolAttended').value,
        classCompleted: document.getElementById('classCompleted').value,
        percentage: document.getElementById('percentage').value
    };
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
    // Collecting basic fee-related information
    formData.feesInformation = {
        feeSection: document.getElementById('feeSection')?.value.trim() || "",
        feeStandard: document.getElementById('feeStandard')?.value.trim() || "",
        feeDivision: document.getElementById('feeDivision')?.value.trim() || "",
        // feeCategory: document.getElementById('feeCategory') ? document.getElementById('feeCategory').value.trim() : "",  // Handling dynamic field
        // packageAllotted: document.getElementById('packageAllotted') ? document.getElementById('packageAllotted').value.trim() : "",  // Handling dynamic field
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
    formData.transportInformation = {
        transportNeeded: document.querySelector('input[name="transportNeeded"]:checked')
            ? document.querySelector('input[name="transportNeeded"]:checked').value
            : null, // Ensure safe access to the checked value
        transportStandard: document.getElementById('transportStandard').value.trim(),
        transportDivision: document.getElementById('transportDivision').value.trim(),
        pickDropAddress: document.getElementById('pickDropAddress').value.trim(),
        vehicleRunning: document.getElementById('vehicleRunning').value.trim(),
        vehicleDetails: document.getElementById('vehicleInfo')
            ? document.getElementById('vehicleInfo').innerText.trim()
            : null, // Collect vehicle information dynamically if available
        noVehicleFound: document.getElementById('noVehicleFound').checked // Capture checkbox status
    };
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
        { id: 'studentContact', label: 'Student Contact No' },
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
        { id: 'motherContactNumber', label: "Mother's Contact Number" },
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

    // Validate if Transport Needed is selected
    const transportNeeded = document.querySelector('input[name="transportNeeded"]:checked');
    if (!transportNeeded) {
        errorMessage = 'Please check whether the Transport is required (Yes or No) before proceeding.';
        isFormValid = false; // Mark form as invalid
    }

    // If 'Yes' is selected for Transport Needed, check required fields
    if (transportNeeded && transportNeeded.value === 'yes') {
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

        // Additional check for no vehicle found
        const noVehicleFound = document.getElementById('noVehicleFound').checked;
        if (noVehicleFound && !document.getElementById('vehicleRunning').value.trim()) {
            missingFields.push('Vehicle Running (If no vehicle found, it should be specified)');
            isFormValid = false; // Mark form as invalid
        }
    }

    // If the form is invalid, show an alert with the missing fields
    if (!isFormValid) {
        Swal.fire({
            icon: 'error',
            title: 'Incomplete Form',
            html: `<p>The following fields are required:</p><ul>${missingFields.map(field => `<li>${field}</li>`).join('')}</ul>`,
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

function populateReviewValues() {
    // Helper function to set values or defaults
    function setField(id, value) {
        document.getElementById(id).textContent = value || "Not Provided";
    }

    // Student Information
    const studentInfo = formData.studentInformation;
    setField("review-fullName", studentInfo.fullName);
    setField("review-dob", studentInfo.dob);
    setField("review-placeOfBirth", studentInfo.placeOfBirth);
    setField("review-age", studentInfo.age);
    setField("review-gender", studentInfo.gender);
    setField("review-bloodGroup", studentInfo.bloodGroup);
    setField("review-studentContact", studentInfo.studentContact);

    const address = `${studentInfo.currentAddress.cityVillage || ""}, ${studentInfo.currentAddress.taluka || ""}, ${studentInfo.currentAddress.district || ""}, ${studentInfo.currentAddress.state || ""} - ${studentInfo.currentAddress.pinCode || ""}`;
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
    const guardianInfo = formData.guardianInformation;
    setField("review-fatherName", guardianInfo.father.fullName || "Not Provided");
    setField("review-motherName", guardianInfo.mother.fullName || "Not Provided");

    const localGuardian = guardianInfo.localGuardian.name
        ? guardianInfo.localGuardian.name
        : "NO";
    setField("review-localGuardian", localGuardian);

    // Academic Information
    const academicInfo = formData.academicInformation;
    setField("review-section", academicInfo.section);
    setField("review-standard", academicInfo.standard);
    setField("review-division", academicInfo.division);
    setField("review-lastSchool", academicInfo.lastSchoolAttended);
    setField("review-percentage", academicInfo.percentage);

    // Fees Information
    const feesInfo = formData.feesInformation;
    setField("review-feeSection", feesInfo.feeSection);
    setField("review-feeStandard", feesInfo.feeStandard);
    // setField("review-package", feesInfo.packageAllotted);

    // Populate Fee Details Table
    const feeDetailsTable = document.getElementById("feeDetailsTableBody");
    feeDetailsTable.innerHTML = ""; // Clear existing rows

    if (feesInfo.feeDetails.length > 0) {
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
    document.getElementById('firstName').value = "John";
    document.getElementById('middleName').value = "Michael";
    document.getElementById('lastName').value = "Doe";
    document.getElementById('fullName').value = "John Michael Doe";
    document.getElementById('dob').value = "2005-01-15";
    document.getElementById('placeOfBirth').value = "New York";
    document.getElementById('age').value = "19";
    document.getElementById('gender').value = "Male";
    document.getElementById('bloodGroup').value = "O+";
    document.getElementById('studentContact').value = "9876543210";

    // Autofill Current Address
    document.getElementById('city_village').value = "Brooklyn";
    document.getElementById('taluka').value = "Kings";
    document.getElementById('district').value = "New York";
    document.getElementById('state').value = "New York";
    document.getElementById('landmak').value = "Near Central Park";
    document.getElementById('pinCode').value = "10001";

    // Autofill Other Student Details
    document.getElementById('nationality').value = "American";
    document.getElementById('religion').value = "Christian";
    document.getElementById('category').value = "General";
    document.getElementById('caste').value = "Not Applicable";
    document.getElementById('domicile').value = "New York";
    document.getElementById('motherTongue').value = "English";
    document.getElementById('aadhaar').value = "123456789012";

    // Autofill Guardian Information
    document.getElementById('fatherFirstName').value = "Robert";
    document.getElementById('fatherMiddleName').value = "James";
    document.getElementById('fatherLastName').value = "Doe";
    document.getElementById('fatherFullName').value = "Robert James Doe";
    document.getElementById('fatherContactNumber').value = "9876543211";
    document.getElementById('fatherQualification').value = "MBA";
    document.getElementById('fatherOccupation').value = "Engineer";

    document.getElementById('motherFirstName').value = "Jane";
    document.getElementById('motherLastName').value = "Doe";
    document.getElementById('motherFullName').value = "Jane Doe";
    document.getElementById('motherContactNumber').value = "9876543212";
    document.getElementById('motherQualification').value = "MSc";
    document.getElementById('motherOccupation').value = "Doctor";

    document.getElementById('guardianName').value = "Michael Smith";
    document.getElementById('guardianContact').value = "9876543213";
    document.getElementById('guardianRelation').value = "Uncle";
    document.getElementById('guardian_fullAddress').value = "123 Guardian Lane";
    document.getElementById('guardianAddressLandmark').value = "Near Guardian Park";
    document.getElementById('guardianpinCode').value = "20002";

    // Autofill Academic Information
    document.getElementById('section').value = "A";
    document.getElementById('grNo').value = "12345";
    document.getElementById('admissionDate').value = "2022-06-15";
    document.getElementById('standard').value = "10";
    document.getElementById('division').value = "B";
    document.getElementById('lastSchoolAttended').value = "St. Michael High School";
    document.getElementById('classCompleted').value = "9";
    document.getElementById('percentage').value = "85%";

    // Autofill Fees Information
    document.getElementById('feeSection').value = "A";
    document.getElementById('feeStandard').value = "10";
    document.getElementById('feeDivision').value = "B";
    document.getElementById('feeCategory').value = "General";
    document.getElementById('packageAllotted').value = "Full Year Plan";

    // Call the function to populate review values
    populateReviewValues();
}


