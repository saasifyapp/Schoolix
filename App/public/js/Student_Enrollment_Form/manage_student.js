document.addEventListener("DOMContentLoaded", () => {
    const overlayConfig = [
        {
            buttonId: "updateStudent",
            overlayId: "updateStudentOverlay",
            closeButtonId: "closeUpdateStudentOverlay",
        },
        {
            buttonId: "searchStudent",
            overlayId: "searchStudentOverlay",
            closeButtonId: "closeSearchStudentOverlay",
        },
        {
            buttonId: "deleteStudent",
            overlayId: "deleteStudentOverlay",
            closeButtonId: "closeOverlayDelete",
        },
    ];

    overlayConfig.forEach(({ buttonId, overlayId, closeButtonId }) => {
        const button = document.getElementById(buttonId);
        const overlay = document.getElementById(overlayId);
        const closeButton = document.getElementById(closeButtonId);

        if (button && overlay && closeButton) {
            button.addEventListener("click", () => {
                overlay.style.display = "flex";
            });

            closeButton.addEventListener("click", () => {
                overlay.style.display = "none";
            });
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const updateStudentCard = document.getElementById("updateStudentCard");
    const updateStudentOverlay = document.getElementById("updateStudentOverlay");
    const closeUpdateStudentOverlay = document.getElementById("closeUpdateStudentOverlay");

    if (updateStudentCard && updateStudentOverlay && closeUpdateStudentOverlay) {
        updateStudentCard.addEventListener("click", () => {
            updateStudentOverlay.style.display = "flex";
        });

        closeUpdateStudentOverlay.addEventListener("click", () => {
            updateStudentOverlay.style.display = "none";
        });
    }
});
