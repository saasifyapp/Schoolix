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
