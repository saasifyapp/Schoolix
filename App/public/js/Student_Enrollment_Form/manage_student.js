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



// document.addEventListener("DOMContentLoaded", () => {
//     const overlays = [        
//         {
//             buttonId: "generateTCButton",
//             overlayId: "generateTCFormOverlay",
//             closeButtonId: "closeGenerateTCFormOverlay",
//         },
//         {
//             buttonId: "searchTCButton",
//             overlayId: "searchTCFormOverlay",
//             closeButtonId: "closeSearchTCFormOverlay",
//         },
//     ];

//     overlays.forEach(({ buttonId, overlayId, closeButtonId }) => {
//         const button = document.getElementById(buttonId);
//         const overlay = document.getElementById(overlayId);
//         const closeButton = document.getElementById(closeButtonId);

//         if (button && overlay && closeButton) {
//             button.addEventListener("click", () => {
//                 overlay.style.display = "flex";
//             });

//             closeButton.addEventListener("click", () => {
//                 overlay.style.display = "none";
//             });
//         }
//     });
// });


//////////////////DISABLE SEARCH STUDENT INPUT FOR TC OVERLAY////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const sectionSelect = document.getElementById('selectsectionforTC');
    const searchInput = document.getElementById('searchInputforTC');

    // Function to toggle input disabled state
    function toggleSearchInput() {
        if (sectionSelect.value === '' || !sectionSelect.value) {
            searchInput.disabled = true; // Disable if no valid option is selected
        } else {
            searchInput.disabled = false; // Enable if "Primary" or "Pre-primary" is selected
        }
    }

    // Initial check (since input starts disabled and default option is "")
    toggleSearchInput();

    // Listen for changes in the dropdown
    sectionSelect.addEventListener('change', toggleSearchInput);
});

//////////////////DISABLE SEARCH STUDENT INPUT FOR STUDENT UPDATE OVERLAY////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const sectionSelect = document.getElementById('sectionSelect');
    const searchInput = document.getElementById('searchInput');

    // Function to toggle input disabled state
    function toggleSearchInput() {
        if (sectionSelect.value === '' || !sectionSelect.value) {
            searchInput.disabled = true; // Disable if no valid option is selected
        } else {
            searchInput.disabled = false; // Enable if "Primary" or "Pre-primary" is selected
        }
    }

    // Initial check (since input starts disabled and default option is "")
    toggleSearchInput();

    // Listen for changes in the dropdown
    sectionSelect.addEventListener('change', toggleSearchInput);
});