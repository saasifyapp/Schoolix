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

                if (buttonId === "searchTCButton") {
                    if (typeof refreshTCData === "function") {
                        refreshTCData();
                    } else {
                        console.error("refreshTCData function is not defined!");
                    }
                }
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

////////////////////////////SEARCH TC//////////////////////////////////////////////////////////
// document.addEventListener("DOMContentLoaded", function () {
//     refreshTCData(); // Load students with TC on page load
// });

let tcData = []; // Store fetched TC data globally

function refreshTCData() {
    showManageStudentLoading();
    fetch(`/fetch-all-leave-students`)
        .then(response => response.json())
        .then(data => {
            hideManageStudentLoading();
            tcData = data; // Store data in global object
            displayStudentsHavingTC(tcData);
        })
        .catch(error => {
            hideManageStudentLoading();
            console.error("Error fetching TC data:", error);
            document.getElementById("tcTableBody").innerHTML = 
                `<tr><td colspan="5">Error loading data</td></tr>`;
        });
}

function displayStudentsHavingTC(data) {
    const tableBody = document.getElementById("tcTablebody");
    tableBody.innerHTML = ""; // Clear previous rows

    if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6">No students found</td></tr>`; // Adjusted colspan for the extra action column
        return;
    }

    console.log(data);

    data.forEach(student => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.tc_no || "N/A"}</td>
            <td>${student.student_name || "N/A"}</td>
            <td>${student.standard_of_leaving || "N/A"}</td>
            <td>${student.issue_date || "N/A"}</td>
            <td>${student.reason_of_leaving || "N/A"}</td>
            <td>
                <div class="button-container" style="display: flex; justify-content: center; gap: 10px;">
                    <!-- Edit Button -->
                    <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; 
                        text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;
                        cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                        onclick="editStudent('${student.tc_no}', '${student.student_name}', '${student.standard_of_leaving}', '${student.issue_date}', '${student.reason_of_leaving}')"
                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                        <img src="../images/edit_icon.png" alt="Edit" style="width: 25px; height: 25px; margin: 5px;">
                        <span>Edit</span>
                    </button>

                    <!-- Delete Button -->
                    <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; 
                        text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;
                        cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                        onclick="deleteStudent('${student.tc_no}', '${student.student_name}')"
                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                        <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; margin: 5px;">
                        <span>Delete</span>
                    </button>

                    <!-- Print Button -->
                    <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; 
                        text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;
                        cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                        onclick="printStudent('${student.tc_no}')"
                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                        <img src="../images/print_icon.png" alt="Print" style="width: 25px; height: 25px; margin: 5px;">
                        <span>Print</span>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}


function searchLeaveStudent() {
    const inputField = document.getElementById("searchLeaveStudentInput");
    const query = inputField.value.trim().toLowerCase();
    
    if (query.length < 1) {
        refreshTCData();
        return;
    }

    const isNumeric = /^\d+$/.test(query); // Check if input is a number (GR No)
    
    const filteredData = tcData.filter(student => {
        if (isNumeric) {
            return student.gr_no && student.gr_no.toString().includes(query);
        } else {
            return student.student_name && student.student_name.toLowerCase().includes(query);
        }
    });

    displayStudentsHavingTC(filteredData);
}

function exportTCTable() {
    const table = document.getElementById("tcTable");
    const rows = table.querySelectorAll("tr");
    let csvContent = [];

    // Extract headers
    const headers = [];
    table.querySelectorAll("thead th").forEach(th => headers.push(th.textContent.trim()));
    csvContent.push(headers.join(",")); // Add headers to CSV

    // Extract table rows
    rows.forEach((row, index) => {
        if (index === 0) return; // Skip header row already added
        const rowData = [];
        row.querySelectorAll("td").forEach(td => rowData.push(`"${td.textContent.trim()}"`));
        if (rowData.length) csvContent.push(rowData.join(",")); // Add row to CSV
    });

    // Convert array to CSV format
    const csvString = csvContent.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "TC_Student_Data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
