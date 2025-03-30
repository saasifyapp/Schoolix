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



