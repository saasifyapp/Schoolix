
///////////////////// DATA VALIDATION /////////////////////

/**
 * Validates required fields in a form section and displays a SweetAlert with missing fields in bold bullet points
 * @param {Object[]} fields - Array of { id, label } objects for fields to validate
 * @param {string} sectionName - Name of the section for the alert title
 * @returns {boolean} True if all fields are valid, false otherwise
 */
function validateTeacherSectionFields(fields, sectionName) {
    const missingFields = fields.filter(field => {
        const element = document.getElementById(field.id);
        if (!element) return false; // Skip if element not found
        if (element.type === 'radio') {
            return !document.querySelector(`input[name="${element.name}"]:checked`);
        }
        return !element.value.trim();
    });

    if (missingFields.length > 0) {
        const missingFieldList = missingFields
            .map(field => `<li><strong>${field.label}</strong></li>`)
            .join('');
        Swal.fire({
            icon: 'error',
            title: `Missing Fields in ${sectionName}`,
            html: `Please fill the following required fields:<ul>${missingFieldList}</ul>`,
            confirmButtonText: 'OK'
        });
        return false;
    }
    return true;
}

/**
 * Validates Personal Information section
 */
function validateTeacherPersonalInformation() {
    const fields = [
        { id: 'firstName', label: 'First Name' },
        { id: 'lastName', label: 'Last Name' },
        { id: 'gender', label: 'Gender' },
        { id: 'dob', label: 'Date of Birth' },
        { id: 'mobileNo', label: 'Mobile Number' },
        { id: 'aadhaar', label: 'Aadhaar Number' },
        { id: 'caste', label: 'Caste' },
        { id: 'category', label: 'Category' },
        { id: 'religion', label: 'Religion' },
        { id: 'landmark', label: 'Landmark' },
        { id: 'nationality', label: 'Nationality' },
        { id: 'city_village', label: 'City/Village' },
        { id: 'taluka', label: 'Taluka' },
        { id: 'district', label: 'District' },
        { id: 'state', label: 'State' },
        { id: 'pinCode', label: 'PIN Code' }
    ];
    return validateTeacherSectionFields(fields, 'Personal Information');
}

/**
 * Validates Guardian/Emergency Contact section
 */
function validateTeacherGuardianInformation() {
    const fields = [
        { id: 'guardianFullName', label: "Guardian's Full Name" },
        { id: 'guardianContact', label: "Guardian's Contact" },
        { id: 'guardianRelation', label: 'Relationship with Guardian' },
        { id: 'guardianAddress', label: "Guardian's Address" }
    ];
    return validateTeacherSectionFields(fields, 'Guardian/Emergency Contact');
}

/**
 * Validates Professional Information section
 */
function validateTeacherProfessionalInformation() {
    const fields = [
        { id: 'qualification', label: 'Qualification' },
        { id: 'experience', label: 'Experience (Years)' },
        { id: 'previousEmployment', label: 'Previous Employment Details' }
    ];
    return validateTeacherSectionFields(fields, 'Professional Information');
}

/**
 * Validates Onboarding Details section
 */
function validateTeacherOnboardingInformation() {
    const fields = [
        { id: 'dateOfJoining', label: 'Date of Joining' },
        { id: 'department', label: 'Department' },
        { id: 'employee_type', label: 'Employee Type' },
        { id: 'designation', label: 'Designation' },
        { id: 'salaryPerMonth', label: 'Salary Per Month' }
    ];
    return validateTeacherSectionFields(fields, 'Onboarding Details');
}

/**
 * Validates Subject-Class Mapping section
 */
function validateTeacherSubjectMappingInformation() {
    const tableBody = document.getElementById('subjectClassTableBody');
    const hasMappings = tableBody && tableBody.rows.length > 0;
    if (!hasMappings) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Subject-Class Mappings',
            html: 'Please add at least one Class and Subject mapping.',
            confirmButtonText: 'OK'
        });
        return false;
    }
    return true;
}

/**
 * Validates Transport Services section
 */
function validateTeacherTransportInformation() {
    const transportNeeded = document.querySelector('input[name="transportNeeded"]:checked');
    if (!transportNeeded) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Transport Selection',
            html: 'Please select whether Transport is Needed (Yes/No).',
            confirmButtonText: 'OK'
        });
        return false;
    }

    if (transportNeeded.value === 'Yes') {
        const noVehicleFound = document.getElementById('noVehicleFound').checked;
        const fields = [
            { id: 'pickDropAddress', label: 'Pick/Drop Address' },
            { id: 'shift', label: 'Shift' }
        ];
        if (!noVehicleFound) {
            fields.push({ id: 'vehicleRunning', label: 'Vehicle Running' });
        }
        return validateTeacherSectionFields(fields, 'Transport Services');
    }
    return true; // No further validation if transport is not needed
}

// /**
//  * Validates that all teacher consent checkboxes are checked
//  * @returns {boolean} True if all consents are checked, false otherwise
//  */
// function validateTeacherConsents() {
//     const teacherConsentFields = [
//         { id: 'consent-policies', label: 'I agree to the School Policies' },
//         { id: 'consent-photo', label: 'I consent to Photo/Video use in School Activities' },
//         { id: 'consent-activities', label: 'I consent to participate in School Activities and Events' },
//         { id: 'consent-medical', label: 'I consent to Emergency Medical Treatment' },
//         { id: 'consent-accuracy', readily: 'Declaration that all provided information is accurate and complete' },
//         { id: 'consent-rules', label: 'Confirmation of understanding of school rules and regulations' }
//     ];

//     const missingConsents = teacherConsentFields.filter(field => {
//         const checkbox = document.getElementById(field.id);
//         return checkbox && !checkbox.checked;
//     });

//     if (missingConsents.length > 0) {
//         // const missingConsentList = missingConsents
//         //     .map(field => `<li><strong>${field.label}</strong></li>`)
//         //     .join('');
//         // Swal.fire({
//         //     icon: 'error',
//         //     title: 'Missing Consents',
//         //     html: `Please accept all policies and consents:<ul>${missingConsentList}</ul>`,
//         //     confirmButtonText: 'OK'
//         // });
//         return false;
//     }
//     return true;
// }

/**
 * Navigates to the next section
 * @param {number} index - Current section index
 * @param {HTMLElement[]} sections - Array of section elements
 */
function navigateToNextTeacherSection(index, sections) {
    if (index < sections.length - 1) {
        sections[index].style.display = 'none';
        sections[index + 1].style.display = 'block';

        // Update active navigation item
        document.querySelectorAll('.form-navigation li').forEach(nav => {
            nav.classList.remove('active');
        });
        document.querySelectorAll('.form-navigation li')[index + 1].classList.add('active');
    }
}

/**
 * Event listeners for Next buttons with validation and navigation
 */
const teacherSections = document.querySelectorAll('.form-section');
document.getElementById('personal-next').addEventListener('click', function() {
    if (validateTeacherPersonalInformation()) {
        collectTeacherPersonalInformation();
        navigateToNextTeacherSection(0, teacherSections);
    }
});

document.getElementById('guardian-next').addEventListener('click', function() {
    if (validateTeacherGuardianInformation()) {
        collectTeacherGuardianInformation();
        navigateToNextTeacherSection(1, teacherSections);
    }
});

document.getElementById('professional-next').addEventListener('click', function() {
    if (validateTeacherProfessionalInformation()) {
        collectTeacherProfessionalInformation();
        navigateToNextTeacherSection(2, teacherSections);
    }
});

document.getElementById('onboarding-next').addEventListener('click', function() {
    if (validateTeacherOnboardingInformation()) {
        collectTeacherOnboardingInformation();
        navigateToNextTeacherSection(3, teacherSections);
    }
});

document.getElementById('mapping-next').addEventListener('click', function() {
    if (validateTeacherSubjectMappingInformation()) {
        collectTeacherSubjectMappingInformation();
        navigateToNextTeacherSection(4, teacherSections);
    }
});

document.getElementById('transport-next').addEventListener('click', function() {
    if (validateTeacherTransportInformation()) {
        collectTeacherTransportInformation();
        populateTeacherReviewValues();
        navigateToNextTeacherSection(5, teacherSections);
    }
});

// // Review section Next button with consent validation
// document.getElementById('review-next').addEventListener('click', function() {
//     const isConsentValid = validateTeacherConsents();
//     if (isConsentValid) {
//         collectTeacherConsents();
//         // Navigate to next section or handle submission
//         // navigateToNextTeacherSection(6, teacherSections);
//     } else{
//         Swal.fire({
//             icon: 'error',
//             title: 'Missing Consents',
//             html: `Please accept all policies and consents`,
//             confirmButtonText: 'OK'
//         });
//     }
// });




/**
 * Autopopulates the teacher form fields with test data for testing purposes.
 * Call from Chrome console: autoPopulateTeacherForm()
 */
function autoPopulateTeacherForm() {
    try {
        console.log('Starting teacher form autopopulation...');

        // Helper function to set input value
        function setInputValue(id, value) {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.warn(`Element with ID ${id} not found`);
            }
        }

        // Helper function to check radio button
        function setRadioValue(name, value) {
            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.warn(`Radio button with name ${name} and value ${value} not found`);
            }
        }

        // Helper function to check checkbox
        function setCheckbox(id, checked = true) {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = checked;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.warn(`Checkbox with ID ${id} not found`);
            }
        }

        // 1. Personal Information
        setInputValue('firstName', 'John');
        setInputValue('middleName', 'Seren');
        setInputValue('lastName', 'Doe');
        setRadioValue('gender', 'Male');
        setInputValue('dob', '1980-05-15');
        setInputValue('mobileNo', '9876543210');
        setInputValue('aadhaar', '123456789012');
        setInputValue('caste', 'General');
        setInputValue('category', 'OBC');
        setInputValue('religion', 'Hindu');
        setInputValue('nationality', 'Indian');
        setInputValue('city_village', 'Mumbai');
        setInputValue('taluka', 'Kurla');
        setInputValue('district', 'Mumbai');
        setInputValue('state', 'Maharashtra');
        setInputValue('pinCode', '400001');

        // 2. Guardian/Emergency Contact
        setInputValue('guardianFullName', 'Jane Doe');
        setInputValue('guardianContact', '8765432109');
        setInputValue('guardianRelation', 'Spouse');
        setInputValue('guardianAddress', '456 Elm St, Mumbai');

        // 3. Professional Information
        setInputValue('qualification', 'M.Sc. Mathematics');
        setInputValue('experience', '10');
        setInputValue('previousEmployment', 'ABC School, 2010-2020');

        // 4. Onboarding Details
        setInputValue('dateOfJoining', '2025-01-01');
        setInputValue('department', 'Mathematics');
        setRadioValue('employee_type', 'teacher');
        setInputValue('designation', 'Senior Teacher');
        setInputValue('salaryPerMonth', '50000');


        // 6. Transport Services
        setRadioValue('transportNeeded', 'No');

        // 7. Consents
        const consentIds = [
            'consent-policies',
            'consent-photo',
            'consent-activities',
            'consent-medical',
            'consent-accuracy',
            'consent-rules'
        ];
        consentIds.forEach(id => setCheckbox(id, true));

        console.log('Teacher form autopopulation completed successfully!');
    } catch (error) {
        console.error('Autopopulation error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Autopopulation Failed',
            text: 'An error occurred while autopopulating the form. Check the console for details.',
            confirmButtonText: 'OK'
        });
    }
}




///////////////////// DATA COLLECTION /////////////////////

let teacherformData = {
    teacherpersonalInformation: {},
    teacherguardianInformation: {},
    teacherprofessionalInformation: {},
    teacheronboardingDetails: {},
    mappingInformation: {},
    transportInformation: {},
    consent: {
        selected: '' // Initialize consent.selected with an empty string
    }
};

// Function to format the date from yyyy-mm-dd to dd-mm-yyyy
function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

// Function to collect data from the Teacher Personal Information section
function collectTeacherPersonalInformation() {
    const teacherDob = document.getElementById('dob').value;
    const formattedTeacherDob = formatDateToDDMMYYYY(teacherDob);

    teacherformData.teacherpersonalInformation = {
        teacherFirstName: document.getElementById('firstName').value.trim(),
        teacherMiddleName: document.getElementById('middleName').value.trim(),
        teacherLastName: document.getElementById('lastName').value.trim(),
        teacherFullName: document.getElementById('fullName').value.trim(),
        teacherGender: document.getElementById('gender').value.trim(),
        teacherDob: formattedTeacherDob,
        teacherMobileNo: document.getElementById('mobileNo').value.trim(),
        teacherAadhaarNo: document.getElementById('aadhaar').value.trim(),
        teacherCaste: document.getElementById('caste').value.trim(),
        teacherCategory: document.getElementById('category').value.trim(),
        teacherReligion: document.getElementById('religion').value.trim(),
        teacherNationality: document.getElementById('nationality').value.trim(),
        teacherAddress: {
            teacherCityVillage: document.getElementById('city_village').value.trim(),
            teacherLandmark: document.getElementById('landmark').value.trim(),
            teacherTaluka: document.getElementById('taluka').value.trim(),
            teacherDistrict: document.getElementById('district').value.trim(),
            teacherState: document.getElementById('state').value.trim(),
            teacherPinCode: document.getElementById('pinCode').value.trim()
        }
    };
    console.log('Collected teacher personal information:', teacherformData); // Debugging log
}

function collectTeacherGuardianInformation() {
    teacherformData.teacherguardianInformation = {
        teacherGuardianFullName: document.getElementById('guardianFullName').value.trim(),
        teacherGuardianContact: document.getElementById('guardianContact').value.trim(),
        teacherGuardianRelation: document.getElementById('guardianRelation').value.trim(),
        teacherGuardianAddress: document.getElementById('guardianAddress').value.trim()
    };
    console.log('Collected teacher guardian information:', teacherformData); // Debugging log
}

//Collects data from the Professional Information section
function collectTeacherProfessionalInformation() {
    teacherformData.teacherprofessionalInformation = {
        teacherQualification: document.getElementById('qualification').value.trim(),
        teacherExperienceYears: document.getElementById('experience').value.trim(),
        teacherPreviousEmployment: document.getElementById('previousEmployment').value.trim()
    };
    console.log('Collected teacher professional information:', teacherformData); // Debugging log
}

//Collects data from the Onboarding Details section
 
function collectTeacherOnboardingInformation() {
    const teacherJoiningDate = document.getElementById('dateOfJoining').value;
    const formattedTeacherJoiningDate = formatDateToDDMMYYYY(teacherJoiningDate);

    teacherformData.teacheronboardingDetails = {
        teacherDateOfJoining: formattedTeacherJoiningDate,
        teacherDepartment: document.getElementById('department').value.trim(),
        teacherEmployeeType: document.getElementById('employee_type').value.trim(),
        teacherDesignation: document.getElementById('designation').value.trim(),
        teacherSalaryPerMonth: document.getElementById('salaryPerMonth').value.trim()
    };
    console.log('Collected teacher onboarding information:', teacherformData); // Debugging log
}

//Collects data from the Subject-Class Mapping section
 
function collectTeacherSubjectMappingInformation() {
    const tableBody = document.getElementById('subjectClassTableBody');
    const mappings = Array.from(tableBody.rows).map(row => ({
        teacherClassAllotted: row.cells[0].textContent.trim(),
        teacherSubjectTaught: row.cells[1].textContent.trim()
    }));

    teacherformData.mappingInformation = {
        teacherClassAllotted: document.getElementById('classAllotted').value.trim(),
        teacherSubjectTagged: document.getElementById('subjectTagged').value.trim(),
        teacherMappings: mappings
    };
    console.log('Collected teacher subject mapping information:', teacherformData); // Debugging log
}

//Collects data from the Transport Services section

function collectTeacherTransportInformation() {
    const teacherTransportNeeded = document.querySelector('input[name="transportNeeded"]:checked')
        ? document.querySelector('input[name="transportNeeded"]:checked').value
        : null;

    if (teacherTransportNeeded === "No") {
        teacherformData.transportInformation = {
            teacherTransportNeeded: 0,
            teacherTransportTagged: null,
            teacherTransportPickupDrop: null,
            teacherTransportShift: null,
            teacherVehicleDetails: null,
            teacherNoVehicleFound: false
        };
    } else if (teacherTransportNeeded === "Yes") {
        teacherformData.transportInformation = {
            teacherTransportNeeded: 1,
            teacherTransportTagged: document.getElementById('vehicleRunning').value.trim(),
            teacherTransportPickupDrop: document.getElementById('pickDropAddress').value.trim(),
            teacherTransportShift: document.getElementById('shift').value.trim(),
            teacherVehicleDetails: document.getElementById('vehicleInfo')
                ? document.getElementById('vehicleInfo').innerText.trim()
                : null,
            teacherNoVehicleFound: document.getElementById('noVehicleFound').checked
        };
    } else {
        teacherformData.transportInformation = {
            teacherTransportNeeded: null,
            teacherTransportTagged: null,
            teacherTransportPickupDrop: null,
            teacherTransportShift: null,
            teacherVehicleDetails: null,
            teacherNoVehicleFound: false
        };
    }
    console.log('Collected teacher transport information:', teacherformData); // Debugging log
}
document.getElementById('personal-next').addEventListener('click', collectTeacherPersonalInformation);
document.getElementById('guardian-next').addEventListener('click', collectTeacherGuardianInformation);
document.getElementById('professional-next').addEventListener('click', collectTeacherProfessionalInformation);
document.getElementById('onboarding-next').addEventListener('click', collectTeacherOnboardingInformation);
document.getElementById('mapping-next').addEventListener('click', collectTeacherSubjectMappingInformation);
document.getElementById('transport-next').addEventListener('click', collectTeacherTransportInformation);


//Populates the Review and Consent section with data from teacherformData
function populateTeacherReviewValues() {
    // Helper function to set values or defaults
    function setTeacherField(id, value) {
        const element = document.getElementById(id);
        if (element) {
            const displayValue = value === null || value === undefined || value.trim() === "" ? "Not Provided" : value;
            element.textContent = displayValue;
        } else {
            console.error(`Element with id "${id}" not found.`);
        }
    }

    // Personal Information
    const teacherPersonalInfo = teacherformData.teacherpersonalInformation || {};
    setTeacherField("review-fullName", teacherPersonalInfo.teacherFullName);
    setTeacherField("review-dob", teacherPersonalInfo.teacherDob);
    setTeacherField("review-gender", teacherPersonalInfo.teacherGender);
    setTeacherField("review-mobileNo", teacherPersonalInfo.teacherMobileNo);
    setTeacherField("review-aadhaar", teacherPersonalInfo.teacherAadhaarNo);
    const teacherAddress = teacherPersonalInfo.teacherAddress || {};
    const addressString = `${teacherAddress.teacherCityVillage || "Not Provided"}, ${teacherAddress.teacherTaluka || "Not Provided"}, ${teacherAddress.teacherDistrict || "Not Provided"}, ${teacherAddress.teacherState || "Not Provided"} - ${teacherAddress.teacherPinCode || "Not Provided"}`;
    setTeacherField("review-address", addressString);

    // Guardian/Emergency Contact Information
    const teacherGuardianInfo = teacherformData.teacherguardianInformation || {};
    setTeacherField("review-guardianFullName", teacherGuardianInfo.teacherGuardianFullName);
    setTeacherField("review-guardianContact", teacherGuardianInfo.teacherGuardianContact);
    setTeacherField("review-guardianRelation", teacherGuardianInfo.teacherGuardianRelation);
    setTeacherField("review-guardianAddress", teacherGuardianInfo.teacherGuardianAddress);

    // Professional Information
    const teacherProfessionalInfo = teacherformData.teacherprofessionalInformation || {};
    setTeacherField("review-qualification", teacherProfessionalInfo.teacherQualification);
    setTeacherField("review-experience", teacherProfessionalInfo.teacherExperienceYears);
    setTeacherField("review-previousEmployment", teacherProfessionalInfo.teacherPreviousEmployment);

    // Onboarding Information
    const teacherOnboardingInfo = teacherformData.teacheronboardingDetails || {};
    setTeacherField("review-dateOfJoining", teacherOnboardingInfo.teacherDateOfJoining);
    setTeacherField("review-department", teacherOnboardingInfo.teacherDepartment);
    setTeacherField("review-category", teacherOnboardingInfo.teacherEmployeeType); 
    setTeacherField("review-designation", teacherOnboardingInfo.teacherDesignation);
    setTeacherField("review-salaryPerMonth", teacherOnboardingInfo.teacherSalaryPerMonth);

    // Subject-Class Mapping Information
    const teacherMappingInfo = teacherformData.mappingInformation || {};
    const subjectClassTableBody = document.getElementById("subjectClassTableBodyReview");
    subjectClassTableBody.innerHTML = ""; // Clear existing rows
    const mappings = teacherMappingInfo.teacherMappings || [];
    if (mappings.length > 0) {
        mappings.forEach(mapping => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${mapping.teacherClassAllotted || "Not Provided"}</td>
                <td>${mapping.teacherSubjectTaught || "Not Provided"}</td>
            `;
            subjectClassTableBody.appendChild(row);
        });
    } else {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="2">No Subject-Class Mappings Available</td>`;
        subjectClassTableBody.appendChild(emptyRow);
    }

    // Transport Information
    const teacherTransportInfo = teacherformData.transportInformation || {};
    const transportDetailsSection = document.getElementById("transportDetailsSection");
    const transportNeededValue = teacherTransportInfo.teacherTransportNeeded === 1 ? "Yes" : teacherTransportInfo.teacherTransportNeeded === 0 ? "No" : "Not Provided";
    setTeacherField("review-transportNeeded", transportNeededValue);

    if (transportNeededValue === "Yes") {
        transportDetailsSection.style.display = "block";
        setTeacherField("review-pickDropAddress", teacherTransportInfo.teacherTransportPickupDrop);
        setTeacherField("review-shift", teacherTransportInfo.teacherTransportShift);
        setTeacherField("review-vehicleRunning", teacherTransportInfo.teacherTransportTagged);
        setTeacherField("review-noVehicleFound", teacherTransportInfo.teacherNoVehicleFound ? "Yes" : "No");
    } else {
        transportDetailsSection.style.display = "none";
    }

    // Date of Submission
    const today = new Date();
    const formattedSubmissionDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    setTeacherField("submission-date", formattedSubmissionDate);
}

// Event listener for Transport Next button to populate review section
// document.getElementById('transport-next').addEventListener('click', function() {
//     // collectTeacherTransportInformation(); // Collect transport data
//     populateTeacherReviewValues(); // Populate review section
// });

document.getElementById('transport-next').addEventListener('click', populateTeacherReviewValues);

/**
 * Validates that all teacher consent checkboxes are checked
 * @returns {boolean} True if all consents are checked, false otherwise
 */
function validateTeacherConsents() {
    // List of teacher consent checkbox IDs
    const teacherConsentIds = [
        "consent-policies",
        "consent-photo",
        "consent-activities",
        "consent-medical",
        "consent-accuracy",
        "consent-rules"
    ];

    // Check if all consents are checked
    return teacherConsentIds.every(id => {
        const checkbox = document.getElementById(id);
        return checkbox && checkbox.checked;
    });
}

//Collects all selected teacher consents and stores them in teacherformData

function collectTeacherConsents() {
    const teacherConsents = [
        { id: "consent-policies", text: "I agree to the School Policies" },
        { id: "consent-photo", text: "I consent to Photo/Video use in School Activities" },
        { id: "consent-activities", text: "I consent to participate in School Activities and Events" },
        { id: "consent-medical", text: "I consent to Emergency Medical Treatment" },
        { id: "consent-accuracy", text: "Declaration that all provided information is accurate and complete" },
        { id: "consent-rules", text: "Confirmation of understanding of school rules and regulations" }
    ];

    const selectedTeacherConsents = teacherConsents
        .filter(consent => document.getElementById(consent.id).checked) // Only include checked boxes
        .map(consent => consent.text) // Get the text of each selected consent
        .join(", "); // Combine the texts into a comma-separated string

    // Ensure that teacherformData.consent is initialized
    if (!teacherformData.consent) {
        teacherformData.consent = {};
    }

    // Store the collected consents in the teacherformData object
    teacherformData.consent.selected = selectedTeacherConsents;
    // console.log('Collected teacher consents:', teacherformData); // Debugging log
}

//Handles the Select All checkbox to toggle all teacher consent checkboxes

function handleTeacherSelectAll() {
    const selectAllCheckbox = document.getElementById("select-all-checkbox");
    const teacherConsentCheckboxes = document.querySelectorAll(".consent-checkbox");

    selectAllCheckbox.addEventListener("change", function() {
        teacherConsentCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });

    // Update Select All checkbox state based on individual checkboxes
    teacherConsentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            const allChecked = Array.from(teacherConsentCheckboxes).every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
        });
    });
}

// Initialize Select All handler
handleTeacherSelectAll();

// // Event listener for Submit button to validate and collect consents
// document.getElementById('review-next').addEventListener('click', function() {
//     collectTeacherConsents(); // Collect selected consents
//     const isValid = validateTeacherConsents(); // Validate consents
//     console.log('Teacher consents valid:', isValid); // Debugging log
//     // Add further submission logic here if needed
// });





///////////////////////  DATA SUBMISSION ///////////////////

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("review-next").addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default button behavior

        const formMode = document.getElementById('formMode')?.value || '';

        if (formMode === 'insert') {
            handleTeacherInsertMode();
        } else if (formMode === 'update') {
            handleTeacherUpdateMode();
        } else {
            handleTeacherInvalidMode();
        }

        console.log("Current mode:", formMode);
    });
});

function handleTeacherInsertMode() {
    // Validate that all consents are checked
    const allChecked = validateTeacherConsents();
    if (!allChecked) {
        Swal.fire({
            title: "Incomplete Consent",
            html: "Please ensure all consents are checked before proceeding.",
            icon: "warning",
            confirmButtonText: "OK"
        });
        return; // Prevent submission
    }

    // Validate all form sections
    const isValid = validateTeacherForm();
    if (!isValid) {
        return; // Prevent submission if any section is invalid
    }

    // Collect consents and submit form
    collectTeacherConsents();
    submitTeacherForm('/submitTeacherForm', 'Teacher form submitted successfully!', false);
}

function handleTeacherUpdateMode() {
    // Validate all form sections (optional for updates, but ensures data integrity)
    const isValid = validateTeacherForm();
    if (!isValid) {
        return; // Prevent submission if any section is invalid
    }

    // Collect consents (optional, as consents may not change on update)
    collectTeacherConsents();
    submitTeacherForm('/updateTeacherDetails', 'Teacher details updated successfully!', true);
}

function handleTeacherInvalidMode() {
    // Handle invalid form mode
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid form mode',
        confirmButtonText: 'OK'
    });
}

/**
 * Validates all teacher form sections
 * @returns {boolean} True if all sections are valid, false otherwise
 */
function validateTeacherForm() {
    const validators = [
        { fn: validateTeacherPersonalInformation, name: 'Personal Information' },
        { fn: validateTeacherGuardianInformation, name: 'Guardian Information' },
        { fn: validateTeacherProfessionalInformation, name: 'Professional Information' },
        { fn: validateTeacherOnboardingInformation, name: 'Onboarding Information' },
        { fn: validateTeacherSubjectMappingInformation, name: 'Subject-Class Mapping' },
        { fn: validateTeacherTransportInformation, name: 'Transport Information' }
    ];

    for (const validator of validators) {
        if (!validator.fn()) {
            return false; // Stop on first invalid section
        }
    }
    return true;
}

/**
 * Flattens and transforms teacherformData to match teacher_details table
 * @param {Object} formData - The teacherformData object
 * @returns {Object} Flattened data ready for submission
 */
function prepareTeacherSubmitData(formData) {
    const mappings = formData.mappingInformation?.teacherMappings || [];
    const subjectClassMapping = mappings.map(m => `${m.teacherClassAllotted}: ${m.teacherSubjectTaught}`).join(', ');

    return {
        // id: formData.id || null, // For updates, null for inserts
        name: formData.teacherpersonalInformation?.teacherFullName || '',
        first_name: formData.teacherpersonalInformation?.teacherFirstName || '',
        last_name: formData.teacherpersonalInformation?.teacherLastName || '',
        designation: formData.teacheronboardingDetails?.teacherDesignation || '',
        gender: formData.teacherpersonalInformation?.teacherGender || '',
        date_of_birth: formData.teacherpersonalInformation?.teacherDob || '',
        date_of_joining: formData.teacheronboardingDetails?.teacherDateOfJoining || '',
        mobile_no: formData.teacherpersonalInformation?.teacherMobileNo || '',
        address_city: formData.teacherpersonalInformation?.teacherAddress?.teacherCityVillage || '',
        teacher_uid_no: formData.teacherpersonalInformation?.teacherAadhaarNo || '',
        department: formData.teacheronboardingDetails?.teacherDepartment || '',
        qualification: formData.teacherprofessionalInformation?.teacherQualification || '',
        experience: formData.teacherprofessionalInformation?.teacherExperienceYears || '',
        subjects_taught: mappings.map(m => m.teacherSubjectTaught).join(', ') || '',
        salary: formData.teacheronboardingDetails?.teacherSalaryPerMonth || '',
        transport_needed: formData.transportInformation?.teacherTransportNeeded === 1 ? 1 : 0,
        transport_tagged: formData.transportInformation?.teacherTransportTagged || '',
        transport_pickup_drop: formData.transportInformation?.teacherTransportPickupDrop || '',
        teacher_shift: formData.transportInformation?.teacherTransportShift || '',
        classes_alloted: mappings.map(m => m.teacherClassAllotted).join(', ') || '',
        is_active: formData.is_active || 1,
        subject_class_mapping: subjectClassMapping,
        previous_employment_details: formData.teacherprofessionalInformation?.teacherPreviousEmployment || '',
        guardian_name: formData.teacherguardianInformation?.teacherGuardianFullName || '',
        guardian_contact: formData.teacherguardianInformation?.teacherGuardianContact || '',
        relation_with_guardian: formData.teacherguardianInformation?.teacherGuardianRelation || '',
        guardian_address: formData.teacherguardianInformation?.teacherGuardianAddress || '',
        teacher_landmark: formData.teacherpersonalInformation?.teacherAddress?.teacherLandmark || '',
        teacher_pincode: formData.teacherpersonalInformation?.teacherAddress?.teacherPinCode || '',
        app_uid: formData.app_uid || '',
        category: formData.teacheronboardingDetails?.teacherEmployeeType || '',
        taluka: formData.teacherpersonalInformation?.teacherAddress?.teacherTaluka || '',
        district: formData.teacherpersonalInformation?.teacherAddress?.teacherDistrict || '',
        state: formData.teacherpersonalInformation?.teacherAddress?.teacherState || '',
        teacher_caste: formData.teacherpersonalInformation?.teacherCaste || '',
        teacher_category: formData.teacherpersonalInformation?.teacherCategory || '',
        teacher_religion: formData.teacherpersonalInformation?.teacherReligion || '',
        teacher_nationality: formData.teacherpersonalInformation?.teacherNationality || '',
        consent: formData.consent?.selected || '' // Include consents if needed
    };
}

/**
 * Reusable function to submit teacher form data
 * @param {string} endpoint - API endpoint for submission
 * @param {string} successMessage - Success message for SweetAlert
 * @param {boolean} isUpdate - Whether this is an update operation
 */
function submitTeacherForm(endpoint, successMessage, isUpdate) {
    // Show the loading animation
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    overlay.style.visibility = 'visible';

    // Steps to display
    const steps = isUpdate ? [
        'Updating teacher information...',
        'Updating guardian information...',
        'Updating professional information...',
        'Updating onboarding information...',
        'Updating subject-class mapping...',
        'Updating transport information...',
        'Updating consent...'
    ] : [
        'Submitting teacher information...',
        'Submitting guardian information...',
        'Submitting professional information...',
        'Submitting onboarding information...',
        'Submitting subject-class mapping...',
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

    // Prepare form data for submission
    const submitData = prepareTeacherSubmitData(teacherformData);
    console.log('Submitting data:', submitData); // Debug log to inspect payload

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Server error: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);

            // Calculate remaining time for the animation
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

            setTimeout(() => {
                // Hide the loading animation
                overlay.style.visibility = 'hidden';

                if (isUpdate && data.changes) {
                    let changeDetails = '<p>Changes made:</p><ul style="text-align: left; margin: 0; padding: 0 0 0 20px;">';
                    for (const [key, value] of Object.entries(data.changes)) {
                        changeDetails += `<li style="margin-bottom: 10px;"><b>${key}</b>: ${value.old} → ${value.new}</li>`;
                    }
                    changeDetails += '</ul>';
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        html: `${successMessage}<br>${changeDetails}`,
                        confirmButtonText: 'OK',
                        customClass: {
                            popup: 'swal-wide'
                        }
                    }).then(() => {
                        window.location.href = '/teacher_Management_Form/manage_teacher';
                    });
                } else {
                    // Display success alert for non-update submissions
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: successMessage,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        window.location.href = '/teacher_enrollment_form';
                    });
                }
            }, remainingTime); // Ensure animation lasts at least 6 seconds
        })
        .catch(error => {
            console.error('Submission error:', error);

            // Hide the loading animation immediately on error
            overlay.style.visibility = 'hidden';
            clearInterval(displaySteps);

            // Display error alert
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to submit teacher form',
                confirmButtonText: 'OK'
            });
        });
}