document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const formModeInput = document.getElementById('formMode');

    if (mode === 'update') {
        formModeInput.value = 'update';

        // ✅ Populate form when update page loads
        const studentDataString = sessionStorage.getItem("studentData");
        if (studentDataString) {
            const studentData = JSON.parse(studentDataString);
            populateStudentForm(studentData);

            updateButtonText();

        
            // 🗑️ Clear session storage after using it
            sessionStorage.removeItem("studentData");
        }

        // For debugging purposes, log the form mode to the console
        if (formModeInput) {
            console.log("Form mode:", formModeInput.value);
        }
    }
});


//// Change Submit to Update ////

function updateButtonText() {
    const reviewNextButton = document.getElementById('review-next');
    if (reviewNextButton) {
        const buttonText = reviewNextButton.innerHTML;
        const updatedButtonText = buttonText.replace('Submit', 'Update');
        reviewNextButton.innerHTML = updatedButtonText;
    }
}

// Function to populate the form fields
function populateStudentForm(studentData) {
    if (!studentData) return;

    function setValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || "";
        } else {
           // console.warn(`Element with ID '${id}' not found.`);
        }
    }


    /////////////// STUDENT INFORMATION ///////////////

    setValue("firstName", studentData.Firstname);
    setValue("middleName", studentData.Middlename);
    setValue("lastName", studentData.Surname);
    setValue("fullName", studentData.Name);
    setValue("dob", formatDateForInput(studentData.DOB));
    setValue("age", studentData.Age);
    setValue("placeOfBirth", studentData.POB);
    setValue("gender", studentData.Gender);
    setValue("bloodGroup", studentData.Blood_Group);

    setValue("studentContact", studentData.student_phone_no);
    setValue("city_village", studentData.Address);
    setValue("taluka", studentData.taluka);
    setValue("district", studentData.district);
    setValue("state", studentData.state);
    setValue("pinCode", studentData.pin_code);
    setValue("landmak", studentData.landmark);

    setValue("nationality", studentData.Nationality);
    setValue("religion", studentData.Religion);
    setValue("category", studentData.Category);
    setValue("caste", studentData.Caste);
    setValue("alpsankhyak", studentData.alpsankhyak);
    setValue("domicile", studentData.Domicile);
    setValue("motherTongue", studentData.Mother_Tongue);
    setValue("aadhaar", studentData.Adhar_no);
    setValue("selectedDocuments", displaySelectedDocuments(studentData.Documents_Submitted));

    setValue("medicalStatus", studentData.medical_status);
    setValue("medicalDescription", studentData.medical_description);


    ////////////// GUARDIAN INFORMATION /////////////////

    const fatherFullName = setFullName(studentData.Father_name, studentData.Grand_father, studentData.Surname);
    const motherFullName = setFullName(studentData.Mother_name, "", studentData.Surname);

    setValue("fatherFirstName", studentData.Father_name);
    setValue("fatherMiddleName", studentData.Grand_father);
    setValue("fatherLastName", studentData.Surname);
    setValue("fatherFullName", fatherFullName);
    setValue("fatherContactNumber", studentData.f_mobile_no);
    setValue("fatherQualification", studentData.F_qualification);
    setValue("fatherOccupation", studentData.f_occupation);
    setValue("fatherContact", studentData.f_mobile_no);

    setValue("motherFirstName", studentData.Mother_name);
    setValue("motherLastName", studentData.Surname);
    setValue("motherFullName", motherFullName);
    setValue("motherContactNumber", studentData.M_mobile_no);
    setValue("motherQualification", studentData.M_Qualification);
    setValue("motherOccupation", studentData.M_occupation);

    setValue("guardianName", studentData.guardian_name);
    setValue("guardianContact", studentData.guardian_contact);
    setValue("guardianRelation", studentData.guardian_relation);
    setValue("guardianAddress", studentData.guardian_address);
    setValue("guardianLandmark", studentData.guardian_landmark);
    setValue("guardianpinCode", studentData.guardian_pin_code);

    // Validate and set the local guardian toggle
    validateLocalGuardianFields(studentData);

    //////////// ACADEMIC INFORMATION //////////////

    setValue("section", studentData.Section);
    setValue("grNo", studentData.Grno);
    setValue("admissionDate", formatDateForInput(studentData.Admission_Date));
    setValue("standard", studentData.Standard);
    setValue("division", studentData.Division);

    setValue("saralId", studentData.saral_id);
    setValue("aaparId", studentData.apar_id);
    setValue("penId", studentData.pen_id);

    
    setValue("lastSchoolAttended", studentData.Last_School);
    setValue("classCompleted", studentData.class_completed);
    setValue("percentage", studentData.percentage_last_school);

    // Validate and set the new admission checkbox
    validateAcademicRecords(studentData);

    /////////////// FEES AND PACKAGE //////////// 

    populateFeeCategoryAmountTable(studentData.package_breakup, studentData.total_package);
    addChangeListeners();


    /////////////// TRANSPORT SERVICE ////////////////////

    setValue("pickDropAddress", studentData.transport_pickup_drop);
    setValue("vehicleRunning", studentData.transport_tagged);

    // Validate and set the transport needed toggle
    validateTransportRequirement(studentData);

    /////////////// CONSENT REVIEW ////////////

    toggleAllCheckboxes(true);

    console.log("Student data successfully populated!");
}

/////////////////////Converting Date in to YYYY-MM-DD/////////////////////////////////////

function formatDateForInput(dateString) {
    if (!dateString) return "";

    const parts = dateString.split("-");
    if (parts.length !== 3) return ""; // Ensure valid date format

    const [day, month, year] = parts;
    return `${year}-${month}-${day}`; // Convert to "yyyy-MM-dd"
}

//////////////////////////Displaying the Submitted Document////////////////////////////////////////////

function displaySelectedDocuments(documentsString) {
    if (!documentsString) return; // Exit if no documents

    selectedDocumentsContainer.innerHTML = ""; // Clear previous selections
    selectedDocuments = []; // Reset selected documents array

    const documents = documentsString.split(",").map(doc => doc.trim()); // Convert string to array

    documents.forEach(doc => {
        addDocument(doc); // Use the existing function to add documents properly
    });

    documentSuggestionsContainer.style.display = "none"; // Ensure suggestions container is hidden

    // Log the populated documents for debugging
   // console.log("Populated Documents:", selectedDocuments);
}


////////////////// SET FULL NAME ////////////

function setFullName(firstName, middleName, lastName) {
    let fullName = firstName || "";
    if (middleName) fullName += " " + middleName;
    if (lastName) fullName += " " + lastName;
    return fullName;
}

//////////////// VALIDATE LOCAL GUARDIAN FIELDS ////////////

function validateLocalGuardianFields(studentData) {
    const guardianFields = [
        studentData.guardian_name,
        studentData.guardian_contact,
        studentData.guardian_relation,
        studentData.guardian_address,
        studentData.guardian_landmark,
        studentData.guardian_pin_code
    ];

    const hasGuardianDetails = guardianFields.some(field => field && field.trim() !== "");

    const yesRadio = document.querySelector('input[name="localGuardianNeeded"][value="yes"]');
    const noRadio = document.querySelector('input[name="localGuardianNeeded"][value="no"]');

    if (hasGuardianDetails) {
        yesRadio.checked = true;
        toggleLocalGuardianDetails(true);
    } else {
        noRadio.checked = true;
        toggleLocalGuardianDetails(false);
    }
}

// Function to toggle the visibility of local guardian details
function toggleLocalGuardianDetails(isVisible) {
    const localGuardianDetails = document.getElementById('localGuardianDetails');
    if (localGuardianDetails) {
        localGuardianDetails.style.display = isVisible ? 'block' : 'none';
    }
}


////////////// VALIDATE PREVIOUS ACADEMIC RECORDS /////////////////

function validateAcademicRecords(studentData) {
    const academicFields = [
        studentData.Last_School,
        studentData.class_completed,
        studentData.percentage_last_school
    ];

    // Check if NONE of the fields have data
    const allFieldsEmpty = academicFields.every(field => !field || field.trim() === "");

    const newAdmissionCheckbox = document.getElementById('newAdmission');
    const fieldsToToggle = [
        document.getElementById('lastSchoolAttended'),
        document.getElementById('classCompleted'),
        document.getElementById('percentage')
    ];

    if (allFieldsEmpty) {
        newAdmissionCheckbox.checked = true;
        fieldsToToggle.forEach(field => field.disabled = true);
    } else {
        newAdmissionCheckbox.checked = false;
        fieldsToToggle.forEach(field => field.disabled = false);
    }
}


///////////// CREATE FEES AND PACKAGE TABLE ///////////

function populateFeeCategoryAmountTable(packageBreakup, totalPackage) {
    const tableBody = document.getElementById('feeCategoryAmountTable');
    
    // Clear any existing rows
    tableBody.innerHTML = '';
    
    // Parse the package_breakup string and create rows
    if (packageBreakup) {
        const breakupItems = packageBreakup.split(',').map(item => item.trim());

        breakupItems.forEach(item => {
            const [category, amount] = item.split(':').map(i => i.trim());

            if (category && amount) {
                const row = document.createElement('tr');

                const categoryCell = document.createElement('td');
                categoryCell.textContent = category;
                row.appendChild(categoryCell);

                const amountCell = document.createElement('td');
                amountCell.textContent = amount;
                row.appendChild(amountCell);

                tableBody.appendChild(row);
            }
        });
    }

    // Add row for Total Package
    if (totalPackage) {
        const row = document.createElement('tr');

        const categoryCell = document.createElement('td');
        categoryCell.textContent = 'Total Package';
        categoryCell.style.fontWeight = 'bold';
        row.appendChild(categoryCell);

        const amountCell = document.createElement('td');
        amountCell.textContent = totalPackage;
        amountCell.style.fontWeight = 'bold';
        row.appendChild(amountCell);

        tableBody.appendChild(row);
    }
}


function clearFeeCategoryAmountTable() {
    const tableBody = document.getElementById('feeCategoryAmountTable');
    tableBody.innerHTML = ''; // Clear the table content
}


function addChangeListeners() {
    const sectionField = document.getElementById('section');
    const standardField = document.getElementById('standard');
    const divisionField = document.getElementById('division');

    if (sectionField) {
        sectionField.addEventListener('change', clearFeeCategoryAmountTable);
    }
    if (standardField) {
        standardField.addEventListener('change', clearFeeCategoryAmountTable);
    }
    if (divisionField) {
        divisionField.addEventListener('change', clearFeeCategoryAmountTable);
    }
}

////////////// VALIDATE TRANSPORT SERVICES /////////////////


function validateTransportRequirement(studentData) {
    const transportFields = [
        studentData.transport_pickup_drop,
        studentData.transport_tagged
    ];

    const yesRadio = document.querySelector('input[name="transportNeeded"][value="Yes"]');
    const noRadio = document.querySelector('input[name="transportNeeded"][value="No"]');
    const pickDropField = document.getElementById('pickDropAddress');
    const vehicleRunningField = document.getElementById('vehicleRunning');

    // Check if transport_needed is 1 or any transport field has value
    const hasTransportDetails = studentData.transport_needed === 1 || transportFields.some(field => field && field.trim() !== "");

    if (hasTransportDetails) {
        yesRadio.checked = true;
        toggleTransportDetails(true);
    } else {
        noRadio.checked = true;
        toggleTransportDetails(false);
    }

    // Enable radio buttons but keep them unchecked until user clicks
    yesRadio.disabled = false;
    noRadio.disabled = false;
    
    if (vehicleRunningField.value.trim() === "") {
        yesRadio.checked = false;
        noRadio.checked = false;
    }
}


////////////////// CONSENT SETTING ///////////

function toggleAllCheckboxes(isChecked) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////// CALL THE UPDATE FUNCTION ////////////////////

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("review-next").addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default button behavior

        const formModeInput = document.getElementById('formMode');
        const formMode = formModeInput ? formModeInput.value : '';

        if (formMode === 'update') {
            // Show Swal alert indicating that this is an update
            Swal.fire({
                title: "Update Mode",
                text: "This is an update. No endpoint call will be made.",
                icon: "info",
                confirmButtonText: "OK"
            });
        } else {
            console.log("Form mode is not 'update'. Current mode:", formMode);
        }
    });
});




///////////////////////////////////NEW//////////////////////////////////////////
// document.addEventListener("DOMContentLoaded", () => {
//     document.getElementById("review-next").addEventListener("click", function (event) {
//         event.preventDefault();
//         console.log("Update")

//         const formMode = document.getElementById('formMode')?.value || '';
//         console.log('Form mode:', formMode); // Debug log to confirm mode

//         if (formMode === 'insert') {
//             const allChecked = validateConsents();
//             if (!allChecked) {
//                 Swal.fire({
//                     title: "Incomplete Consent",
//                     text: "Please ensure all consents are checked before proceeding.",
//                     icon: "warning",
//                     confirmButtonText: "OK"
//                 });
//                 return;
//             }
//             collectConsent();
//             submitForm('/submitEnrollmentForm', 'Enrollment submitted successfully!');
//         } else if (formMode === 'update') {
//             collectConsent(); // Optional: remove if consents don’t change on update
//             submitForm('/updateStudentDetails', 'Student details updated successfully!');
//         } else {
//             console.log("Unknown form mode:", formMode);
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: 'Invalid form mode',
//                 confirmButtonText: 'OK'
//             });
//         }
//     });
// });

// // Reusable submit function
// function submitForm(endpoint, successMessage) {
//     const overlay = document.getElementById('loadingOverlay');
//     const loadingText = document.getElementById('loadingText');
//     overlay.style.visibility = 'visible';

//     const steps = [
//         'Submitting student information...',
//         'Submitting guardian information...',
//         'Submitting academic information...',
//         'Submitting fees information...',
//         'Submitting transport information...',
//         'Submitting consent...'
//     ];

//     let stepIndex = 0;
//     const stepInterval = setInterval(() => {
//         if (stepIndex < steps.length) {
//             loadingText.textContent = steps[stepIndex++];
//         } else {
//             clearInterval(stepInterval);
//         }
//     }, 1000);

//     console.log(`Submitting to ${endpoint} with data:`, JSON.stringify(formData, null, 2)); // Debug log

//     const minimumLoadingTime = 6000;
//     const startTime = Date.now();

//     fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//     })
//         .then(response => {
//             if (!response.ok) throw new Error(`Server error: ${response.status}`);
//             return response.json();
//         })
//         .then(data => {
//             if (data.error) throw new Error(data.error);
//             const elapsedTime = Date.now() - startTime;
//             const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

//             setTimeout(() => {
//                 overlay.style.visibility = 'hidden';
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Success',
//                     text: successMessage,
//                     confirmButtonText: 'OK'
//                 });
//             }, remainingTime);
//         })
//         .catch(error => {
//             console.error('Submission error:', error);
//             overlay.style.visibility = 'hidden';
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: error.message || 'Failed to submit form',
//                 confirmButtonText: 'OK'
//             });
//         });
// }