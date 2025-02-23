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
        {
            buttonId: "generateTC",
            overlayId: "generateTCOverlay",
            closeButtonId: "closeGenerateTCOverlay",
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
    const overlays = [        
        {
            buttonId: "generateTCButton",
            overlayId: "generateTCFormOverlay",
            closeButtonId: "closeGenerateTCFormOverlay",
        },
        {
            buttonId: "searchTCButton",
            overlayId: "searchTCFormOverlay",
            closeButtonId: "closeSearchTCFormOverlay",
        },
    ];

    overlays.forEach(({ buttonId, overlayId, closeButtonId }) => {
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

document.querySelector(".search-button").addEventListener("click", function () {
    let searchValue = document.getElementById("searchInput").value.trim();
    let section = document.getElementById("sectionSelect").value; // Get selected section

    if (!searchValue) {
        Swal.fire({
            icon: "warning",
            title: "Invalid Input",
            text: "Please enter a valid search value.",
            confirmButtonText: "OK"
        });
        return;
    }

    if (!section) {
        Swal.fire({
            icon: "warning",
            title: "Select Section",
            text: "Please select a section before searching.",
            confirmButtonText: "OK"
        });
        return;
    }

    // Determine search type (Number → GR No, Text → Name)
    let searchType = isNaN(searchValue) ? "name" : "grno";

    fetch(`/fetch-student?section=${section}&${searchType}=${encodeURIComponent(searchValue)}`)
        .then(response => response.json())
        .then(data => {
            if (data.message === "No student found") {
                Swal.fire({
                    icon: "error",
                    title: "No Record Found",
                    text: "No matching student details were found.",
                    confirmButtonText: "OK"
                });
            } else if (data.message === "Student is inactive") {
                Swal.fire({
                    icon: "warning",
                    title: "Inactive Student",
                    text: "This student is inactive. Please contact the administration.",
                    confirmButtonText: "OK"
                });
            } else {
                sessionStorage.setItem("studentData", JSON.stringify(data[0]));
                sessionStorage.setItem("selectedSection", section);
                window.location.href = `/Student_Enrollment_Form/student_enrollment_form?section=${encodeURIComponent(section)}&search=${encodeURIComponent(searchValue)}`;
                document.getElementById("updateStudentOverlay").style.display = "none";
                  // Change form mode to "update"
            // document.getElementById("formMode").value = "update";
            }
        })
        .catch(error => {
            console.error("Error fetching student data:", error);
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Something went wrong while fetching student details.",
                confirmButtonText: "OK"
            });
        });
});



document.getElementById("nextStep").addEventListener("click", function() {
    document.getElementById("studentDetails").style.display = "none";
    document.getElementById("identificationInfo").style.display = "block";
});


