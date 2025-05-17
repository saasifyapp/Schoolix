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
    setTeacherField("review-category", teacherPersonalInfo.teacherCategory || "Not Provided"); // Using teacherCategory from personal info
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

// Event listener for Submit button to validate and collect consents
document.getElementById('review-next').addEventListener('click', function() {
    collectTeacherConsents(); // Collect selected consents
    const isValid = validateTeacherConsents(); // Validate consents
    console.log('Teacher consents valid:', isValid); // Debugging log
    // Add further submission logic here if needed
});