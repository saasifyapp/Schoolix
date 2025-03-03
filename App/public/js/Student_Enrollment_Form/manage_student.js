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

