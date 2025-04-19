function showManageStudentLoading() {
    const loader = document.getElementById("manageStudentLoader");
    let blurOverlay = document.getElementById("manageStudentBlur");

    if (!blurOverlay) {
        blurOverlay = document.createElement("div");
        blurOverlay.id = "manageStudentBlur";
        blurOverlay.className = "manage-student-blur";
        document.body.appendChild(blurOverlay);
    }

    loader.classList.add("active");
    blurOverlay.style.display = "block";
}

function hideManageStudentLoading() {
    const loader = document.getElementById("manageStudentLoader");
    const blurOverlay = document.getElementById("manageStudentBlur");

    loader.classList.remove("active");
    if (blurOverlay) {
        blurOverlay.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const overlayConfig = [
        {
            buttonId: "updateStudent",
            overlayId: "updateStudentOverlay",
            closeButtonId: "closeUpdateStudentOverlay",
            onOpen: null, // No special function needed
        },
        {
            buttonId: "updatePackage",
            overlayId: "updatePackageOverlay",
            closeButtonId: "closeUpdatePackageOverlay",
            onOpen: null,
        },        
        {
            buttonId: "searchStudent",
            overlayId: "searchStudentOverlay",
            closeButtonId: "closeSearchStudentOverlay",
            onOpen: null,
        },
        {
            buttonId: "deleteStudent",
            overlayId: "deleteStudentOverlay",
            closeButtonId: "closeOverlayDelete",
            onOpen: null, // Load TC data when opening the delete overlay
        },
        {
            buttonId: "generateTC",
            overlayId: "generateTCOverlay",
            closeButtonId: "closeGenerateTCOverlay",
            onOpen: null,
        },
    ];

    overlayConfig.forEach(({ buttonId, overlayId, closeButtonId, onOpen }) => {  
        const button = document.getElementById(buttonId);
        const overlay = document.getElementById(overlayId);
        const closeButton = document.getElementById(closeButtonId);

        if (button && overlay && closeButton) {
            button.addEventListener("click", () => {
                overlay.style.display = "flex";
                if (typeof onOpen === "function") { 
                    onOpen();
                }
            });

            closeButton.addEventListener("click", () => {
                overlay.style.display = "none";
            });
        }
    });
});

// document.addEventListener("DOMContentLoaded", function () {
//     const nextButton = document.getElementById("nextButton");
//     const updatePackageOverlay = document.getElementById("updateStudentPackageOverlay");
//     const closeUpdatePackageOverlay = document.getElementById("closeUpdateStudentPackageOverlay");

//     // Open overlay when clicking Next button
//     nextButton.addEventListener("click", function () {
//         updatePackageOverlay.style.display = "flex";
//     });

//     // Close overlay when clicking close button
//     closeUpdatePackageOverlay.addEventListener("click", function () {
//         updatePackageOverlay.style.display = "none";
//     });
// });



document.addEventListener('DOMContentLoaded', () => {
    // Function to clear input fields within a given overlay, with exceptions
    function clearOverlayInputs(overlayId) {
        const overlay = document.getElementById(overlayId);
        if (!overlay) return; // Skip if overlay not found

        // Clear all input elements except specific dropdowns
        const inputs = overlay.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'file') {
                input.value = ''; // Clear file inputs
            } else if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false; // Uncheck checkboxes/radios
            } else {
                input.value = ''; // Clear text, date, time, number, hidden, etc.
            }
        });

        // Clear select elements, excluding specific dropdowns
        const selects = overlay.querySelectorAll('select');
        selects.forEach(select => {
            // Skip specific dropdowns that should remain "primary"
            if (
                (overlayId === 'updatePackageOverlay' && select.id === 'dropdown1') ||
                (overlayId === 'searchStudentOverlay' && select.id === 'studentFilter') ||
                (overlayId === 'deleteStudentOverlay' && select.id === 'deleteStudentFilter')
            ) {
                return; // Preserve these dropdowns
            }
            select.value = ''; // Reset other selects to empty or default
        });

        // Clear textareas (if any)
        const textareas = overlay.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.value = ''; // Clear textarea content
        });

        // Special handling for searchStudentOverlay: clear filter-related state
        if (overlayId === 'searchStudentOverlay') {
            // Clear the search input explicitly (already handled by input selector, but for clarity)
            const searchInput = document.getElementById('searchStudentInput');
            if (searchInput) {
                searchInput.value = '';
            }
            // Clear table body to reset filter results (assumed to be the "special filter" state)
            const tableBody = document.getElementById('studentsTablebody');
            if (tableBody) {
                tableBody.innerHTML = ''; // Clear filtered table rows
            }
        }
    }

    // Map of close buttons to overlay IDs
    const closeButtonMap = [
        { buttonId: 'closeAttendanceOverlay1', overlayId: 'overlay1' },
        { buttonId: 'closeAttendanceOverlay', overlayId: 'attendanceOverlay' },
        { buttonId: 'closeManageOverlay', overlayId: 'manageOverlay' },
        { buttonId: 'closeAttendanceSummaryOverlay', overlayId: 'attendanceSummaryOverlay' },
        { buttonId: 'closeUpdateStudentOverlay', overlayId: 'updateStudentOverlay' },
        { buttonId: 'closeUpdatePackageOverlay', overlayId: 'updatePackageOverlay' },
        { buttonId: 'closeUpdateStudentPackageOverlay', overlayId: 'updateStudentPackageOverlay' },
        { buttonId: 'closeSearchStudentOverlay', overlayId: 'searchStudentOverlay' },
        { buttonId: 'closeFilterOverlay', overlayId: 'filterOverlay' },
        { buttonId: 'closeGenerateTCOverlay', overlayId: 'generateTCOverlay' },
        { buttonId: 'closeGenerateTCFormOverlay', overlayId: 'generateTCFormOverlay' },
        { buttonId: 'closeSearchTCFormOverlay', overlayId: 'searchTCFormOverlay' },
        { buttonId: 'closeSearchTCOverlay', overlayId: 'searchTCOverlay' },
        { buttonId: 'closeEditTCForm', overlayId: 'editTCForm' },
        { buttonId: 'closeOverlayDelete', overlayId: 'deleteStudentOverlay' },
    ];

    // Add event listeners for close buttons
    closeButtonMap.forEach(({ buttonId, overlayId }) => {
        const closeButton = document.getElementById(buttonId);
        if (closeButton) {
            closeButton.addEventListener('click', () => clearOverlayInputs(overlayId));
        }
    });

    // Handle enrollFaceOverlay (close button has no ID, selected by class)
    const enrollFaceCloseButton = document.querySelector('#enrollFaceOverlay .close-button');
    if (enrollFaceCloseButton) {
        enrollFaceCloseButton.addEventListener('click', () => clearOverlayInputs('enrollFaceOverlay'));
    }

    // Handle imagePreviewOverlay (close button has inline onclick)
    const imagePreviewCloseButton = document.querySelector('#imagePreviewOverlay .close-button');
    if (imagePreviewCloseButton) {
        imagePreviewCloseButton.addEventListener('click', () => {
            const previewInImage = document.getElementById('previewInImage');
            const previewOutImage = document.getElementById('previewOutImage');
            if (previewInImage) previewInImage.src = '';
            if (previewOutImage) previewOutImage.src = '';
        });
    }

    // Note: previewTCOverlay has no close button; uses Back button with window.location.href
});

function resetSearchOverlays() {
    // Reset for TC Search Overlay
    const searchInputTC = document.getElementById('searchInputforTC');
    const sectionSelectTC = document.getElementById('selectsectionforTC');
    const suggestionsTC = document.getElementById('TCsuggestions');

    if (searchInputTC) {
        searchInputTC.value = '';
        searchInputTC.disabled = true; // back to original state
    }

    if (sectionSelectTC) {
        sectionSelectTC.value = ''; // reset dropdown
        sectionSelectTC.selectedIndex = 0; // in case needed
    }

    if (suggestionsTC) {
        suggestionsTC.innerHTML = ''; // clear autosuggestions
    }

    // Reset for Update Student Overlay
    const searchInputStudent = document.getElementById('searchInput');
    const sectionSelectStudent = document.getElementById('sectionSelect');
    const suggestionsStudent = document.getElementById('suggestions');

    if (searchInputStudent) {
        searchInputStudent.value = '';
        searchInputStudent.disabled = true; // disable until section is chosen
    }

    if (sectionSelectStudent) {
        sectionSelectStudent.value = '';
        sectionSelectStudent.selectedIndex = 0;
    }

    if (suggestionsStudent) {
        suggestionsStudent.innerHTML = '';
    }
}
