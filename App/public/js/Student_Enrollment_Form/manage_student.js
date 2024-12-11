document.addEventListener("DOMContentLoaded", () => {
    // Update Student Overlay
    const updateStudentButton = document.getElementById("updateStudent");
    const updateStudentOverlay = document.getElementById("updateStudentOverlay");
    const closeOverlayUpdateButton = document.getElementById("closeOverlayUpdate");

    updateStudentButton.addEventListener("click", () => {
        updateStudentOverlay.style.display = "flex";
    });

    closeOverlayUpdateButton.addEventListener("click", () => {
        updateStudentOverlay.style.display = "none";
    });

    // Search Student Overlay
    const searchStudentButton = document.getElementById("searchStudent");
    const searchStudentOverlay = document.getElementById("searchStudentOverlay");
    const closeOverlaySearchButton = document.getElementById("closeOverlaySearch");

    searchStudentButton.addEventListener("click", () => {
        searchStudentOverlay.style.display = "flex";
    });

    closeOverlaySearchButton.addEventListener("click", () => {
        searchStudentOverlay.style.display = "none";
    });

    // Delete Student Overlay
    const deleteStudentButton = document.getElementById("deleteStudent");
    const deleteStudentOverlay = document.getElementById("deleteStudentOverlay");
    const closeOverlayDeleteButton = document.getElementById("closeOverlayDelete");

    deleteStudentButton.addEventListener("click", () => {
        deleteStudentOverlay.style.display = "flex";
    });

    closeOverlayDeleteButton.addEventListener("click", () => {
        deleteStudentOverlay.style.display = "none";
    });
});
