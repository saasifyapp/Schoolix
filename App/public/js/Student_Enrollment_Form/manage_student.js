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

document.addEventListener("DOMContentLoaded", () => {
    const overlayMappings = {        
        generateTCButton: "searchTCFormOverlay",  // Clicking "Generate TC" opens "Search TC Form"
        searchTCButton: "generateTCOverlay",      // Clicking "Search TC" opens "Generate TC Overlay"
    };

    Object.entries(overlayMappings).forEach(([buttonId, overlayId]) => {
        const button = document.getElementById(buttonId);
        const overlay = document.getElementById(overlayId);
        const closeButton = overlay?.querySelector(".close-button");

        if (button && overlay) {
            button.addEventListener("click", () => {
                // Close all overlays first
                Object.values(overlayMappings).forEach(id => {
                    document.getElementById(id).style.display = "none";
                });

                // Open the correct overlay
                overlay.style.display = "flex";
            });

            closeButton?.addEventListener("click", () => {
                overlay.style.display = "none";
            });
        }
    });

    // Open Generate TC Form from Search TC Form
    const searchButton = document.querySelector("#searchTCFormOverlay .search-button");
    const generateTCFormOverlay = document.getElementById("generateTCFormOverlay");
    const closeGenerateTCForm = generateTCFormOverlay?.querySelector(".close-button");

    if (searchButton && generateTCFormOverlay) {
        searchButton.addEventListener("click", () => {
            // document.getElementById("searchTCFormOverlay").style.display = "none"; // Close Search TC Form
            // generateTCFormOverlay.style.display = "flex"; // Open Generate TC Form
            searchStudentAndHandleTC();
        });

        closeGenerateTCForm?.addEventListener("click", () => {
            generateTCFormOverlay.style.display = "none";
            clearTCForm(); // Clear form fields
        });
    }

    // Open Search TC Overlay from Generate TC Overlay
    const searchTCButtonInGenerateTC = document.querySelector("#generateTCOverlay #searchTCButton");
    const searchTCOverlay = document.getElementById("searchTCOverlay");
    const closeSearchTCOverlay = searchTCOverlay?.querySelector(".close-button");

    if (searchTCButtonInGenerateTC && searchTCOverlay) {
        searchTCButtonInGenerateTC.addEventListener("click", () => {
            document.getElementById("generateTCOverlay").style.display = "none"; // Close Generate TC Overlay
            searchTCOverlay.style.display = "flex"; // Open Search TC Overlay
        });

        closeSearchTCOverlay?.addEventListener("click", () => {
            searchTCOverlay.style.display = "none";
        });
    }
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
                window.location.href = `/Student_Enrollment_Form/student_enrollment_form?section=${encodeURIComponent(section)}&search=${encodeURIComponent(searchValue)}&mode=update`;
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



// document.getElementById("nextStep").addEventListener("click", function() {
//     document.getElementById("studentDetails").style.display = "none";
//     document.getElementById("identificationInfo").style.display = "block";
// });


document.getElementById("generateTCOnOverlay").addEventListener("click", function () {
    // Fill TC preview with form data
    const formData = {
        studentName: document.getElementById("studentName").value.trim(),
        motherName: document.getElementById("motherName").value.trim(),
        dob: document.getElementById("dob").value,
        placeOfBirth: document.getElementById("placeOfBirth").value.trim(),
        nationality: document.getElementById("nationality").value.trim(),
        religion: document.getElementById("religion").value.trim(),
        category: document.getElementById("category").value.trim(),
        caste: document.getElementById("caste").value.trim(),
        aadharId: document.getElementById("aadharId").value.trim(),
        lastSchool: document.getElementById("lastSchool").value.trim(),
        dateOfAdmission: document.getElementById("dateOfAdmission").value,
        classOfAdmission: document.getElementById("classOfAdmission").value.trim(),
        tcNo: document.getElementById("tcNo").value.trim(),
        dateOfLeaving: document.getElementById("dateOfLeaving").value,
        standardLeaving: document.getElementById("standardLeaving").value.trim(),
        reasonLeaving: document.getElementById("reasonLeaving").value.trim(),
        progress: document.getElementById("progress").value.trim(),
        conduct: document.getElementById("conduct").value.trim(),
        result: document.getElementById("result").value.trim(),
        remark: document.getElementById("remark").value.trim()
    };

    // Populate the HTML with the form data
    document.getElementById("tcStudentName").innerText = formData.studentName;
    document.getElementById("tcMotherName").innerText = formData.motherName;
    document.getElementById("tcDOB").innerText = formData.dob;
    document.getElementById("tcPlaceOfBirth").innerText = formData.placeOfBirth;
    document.getElementById("tcNationality").innerText = formData.nationality;
    document.getElementById("tcReligion").innerText = formData.religion;
    document.getElementById("tcCategory").innerText = formData.category;
    document.getElementById("tcCaste").innerText = formData.caste;
    document.getElementById("tcAadharId").innerText = formData.aadharId;
    document.getElementById("tcLastSchool").innerText = formData.lastSchool;
    document.getElementById("tcDateOfAdmission").innerText = formData.dateOfAdmission;
    document.getElementById("tcClassOfAdmission").innerText = formData.classOfAdmission;
    document.getElementById("tcDateOfLeaving").innerText = formData.dateOfLeaving;
    document.getElementById("tcStandardLeaving").innerText = formData.standardLeaving;
    document.getElementById("tcReasonLeaving").innerText = formData.reasonLeaving;
    document.getElementById("tcProgress").innerText = formData.progress;
    document.getElementById("tcConduct").innerText = formData.conduct;
    document.getElementById("tcResult").innerText = formData.result;
    document.getElementById("tcRemark").innerText = formData.remark;

    // Show the overlay
    document.getElementById("previewTCOverlay").style.display = "flex";
});

// Close overlay
document.getElementById("closePreviewTCOverlay").addEventListener("click", function () {
    document.getElementById("previewTCOverlay").style.display = "none";
});

// Download TC as Image
document.getElementById("downloadTC").addEventListener("click", function () {
    html2canvas(document.getElementById("tcContainer")).then(canvas => {
        let link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "Transfer_Certificate.png";
        link.click();
    });
});


