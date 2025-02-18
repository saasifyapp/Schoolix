document.addEventListener("DOMContentLoaded", () => {
    // Update Student Overlay (Make sure overlay is in HTML)
    const updateStudentButton = document.getElementById("updateStudent");
    const updateStudentOverlay = document.getElementById("updateStudentOverlay"); // Ensure this exists in HTML
    const closeOverlayUpdateButton = document.getElementById("closeOverlayUpdate");

    if (updateStudentButton && updateStudentOverlay && closeOverlayUpdateButton) {
        updateStudentButton.addEventListener("click", () => {
            updateStudentOverlay.style.display = "flex";
        });

        closeOverlayUpdateButton.addEventListener("click", () => {
            updateStudentOverlay.style.display = "none";
        });
    }

    // Search Student Overlay
    const searchStudentButton = document.getElementById("searchStudent");
    const searchStudentOverlay = document.getElementById("searchStudentOverlay");
    const closeOverlaySearchButton = document.getElementById("closeSearchStudentOverlay");

    if (searchStudentButton && searchStudentOverlay && closeOverlaySearchButton) {
        searchStudentButton.addEventListener("click", () => {
            searchStudentOverlay.style.display = "flex"; // Show overlay when button clicked
        });

        closeOverlaySearchButton.addEventListener("click", () => {
            searchStudentOverlay.style.display = "none"; // Hide overlay when close button clicked
        });
    }

    // Delete Student Overlay
    const deleteStudentButton = document.getElementById("deleteStudent");
    const deleteStudentOverlay = document.getElementById("deleteStudentOverlay");
    const closeOverlayDeleteButton = document.getElementById("closeOverlayDelete");

    if (deleteStudentButton && deleteStudentOverlay && closeOverlayDeleteButton) {
        deleteStudentButton.addEventListener("click", () => {
            deleteStudentOverlay.style.display = "flex";
        });

        closeOverlayDeleteButton.addEventListener("click", () => {
            deleteStudentOverlay.style.display = "none";
        });
    }
});

