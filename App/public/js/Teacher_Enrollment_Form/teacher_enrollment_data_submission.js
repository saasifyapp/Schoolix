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
        // Display an alert if any checkbox is not checked
        Swal.fire({
            title: "Incomplete Consent",
            html: "Please ensure all consents are checked before proceeding.",
            icon: "warning",
            confirmButtonText: "OK"
        });
        return; // Prevent submission
    }

    // Collect consents and submit form
    collectTeacherConsents();
    submitTeacherForm('/submitTeacherForm', 'Teacher form submitted successfully!');
}

function handleTeacherUpdateMode() {
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
 * Flattens and transforms teacherformData to match teacher_details table
 * @param {Object} formData - The teacherformData object
 * @returns {Object} Flattened data ready for submission
 */
function prepareTeacherSubmitData(formData) {
    const mappings = formData.mappingInformation?.teacherMappings || [];
    return {
        id: formData.id || null, // For updates, null for inserts
        name: formData.teacherpersonalInformation?.teacherFullName || '',
        first_name: formData.teacherpersonalInformation?.firstName || '',
        last_name: formData.teacherpersonalInformation?.lastName || '',
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
        transport_needed: formData.transportInformation?.teacherTransportNeeded ? 1 : 0,
        transport_tagged: formData.transportInformation?.teacherTransportTagged || '',
        transport_pickup_drop: formData.transportInformation?.teacherTransportPickupDrop || '',
        classes_alloted: mappings.map(m => m.teacherClassAllotted).join(', ') || '',
        is_active: formData.is_active || 'true',
        subject_class_mapping: JSON.stringify(mappings),
        previous_employment_details: formData.teacherprofessionalInformation?.teacherPreviousEmployment || '',
        guardian_name: formData.teacherguardianInformation?.teacherGuardianFullName || '',
        guardian_contact: formData.teacherguardianInformation?.teacherGuardianContact || '',
        relation_with_guardian: formData.teacherguardianInformation?.teacherGuardianRelation || '',
        guardian_address: formData.teacherguardianInformation?.teacherGuardianAddress || '',
        teacher_landmark: formData.teacherpersonalInformation?.teacherAddress?.teacherLandmark || '',
        teacher_pincode: formData.teacherpersonalInformation?.teacherAddress?.teacherPinCode || '',
        app_uid: formData.app_uid || '',
        category: formData.teacheronboardingDetails?.employee_type || 'teacher',
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
function submitTeacherForm(endpoint, successMessage, isUpdate = false) {
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

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
    })
        .then(response => {
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
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
                        window.location.href = '/teacher_Management_Form/manage_teacher';
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