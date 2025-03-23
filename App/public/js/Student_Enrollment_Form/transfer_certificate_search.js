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
    fetch(`/get-tc-data`)
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
        tableBody.innerHTML = `<tr><td colspan="15">No students found</td></tr>`; // Adjusted colspan for the extra action column
        return;
    }

    console.log(data);

    data.forEach(student => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.tc_no || "N/A"}</td>
            <td>${student.gr_no || "N/A"}</td>
            <td>${student.student_name || "N/A"}</td>
            <td>${student.date_of_leaving || "N/A"}</td>
            <td>${student.standard_of_leaving || "N/A"}</td>
            <td>${student.reason_of_leaving || "N/A"}</td>
            <td>${student.progress || "N/A"}</td>
            <td>${student.conduct || "N/A"}</td>
            <td>${student.result || "N/A"}</td>
            <td>${student.remark || "N/A"}</td>
            <td>${student.issue_date || "N/A"}</td>
            <td>${student.section || "N/A"}</td>
            <td>${student.generation_status || "N/A"}</td>
            <td>
                <div class="button-container" style="display: flex; justify-content: center; gap: 10px;">
                    <!-- Edit Button -->
                    <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; 
                            text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;
                            cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                            transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                            onclick="editTC('${student.id}')"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; margin: 5px;">
                            <span>Edit</span>
                    </button>

                    <!-- Print Button -->
                   <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; 
        text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;
        cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
        onclick="regenerateTC('${student.tc_no}', '${student.gr_no}', '${student.student_name}', '${student.section}', '${student.generation_status}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    <img src="../images/print.png" alt="Print" style="width: 25px; height: 25px; margin: 5px;">
    <span>Print</span>
</button>

                     <!-- Delete Button -->
                    <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; 
                        text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;
                        cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                        onclick="deleteTC('${student.id}', '${student.tc_no}', '${student.gr_no}', '${student.student_name}', '${student.generation_status}', '${student.section}')"
                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                        <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; margin: 5px;">
                        <span>Delete</span>
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


////////////// EXPORT TC DATA /////////////

function exportTCTable() {
    const table = document.getElementById("tcTable");
    const rows = table.querySelectorAll("tr");
    let csvContent = '';

    // Extract headers
    const headers = table.querySelectorAll("thead th");
    const headerData = [];
    headers.forEach((header, index) => {
        if (index < headers.length - 1) { // Exclude the last header
            headerData.push(`"${header.textContent.trim()}"`);
        }
    });
    csvContent += headerData.join(",") + "\n"; // Add headers to CSV

    // Extract table rows
    rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return; // Skip header row already added
        const cells = row.querySelectorAll("td");
        const rowData = [];
        cells.forEach((cell, cellIndex) => {
            if (cellIndex < cells.length - 1) { // Exclude the last cell
                rowData.push(`"${cell.textContent.trim()}"`);
            }
        });
        if (rowData.length > 0) {
            csvContent += rowData.join(",") + "\n"; // Add row to CSV
        }
    });

    // Convert CSV content to Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, "Transfer_Certificate_Data.csv");
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Transfer_Certificate_Data.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}


///////////////////////////////   EDIT TC ////////////////////

// JUST UPDATE THE TC TABLE //

// Utility functions for date formatting
function formatToDDMMYYYY(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
}

function formatToYYYYMMDD(dateStr) {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", function () {
    const closeEditTCFormButton = document.getElementById("closeEditTCForm");
    if (closeEditTCFormButton) {
        closeEditTCFormButton.addEventListener("click", function () {
            document.getElementById("editTCForm").style.display = "none";
            console.log("Form closed");
        });
    }

    const updateTCButton = document.getElementById("updateTCButton");
    if (updateTCButton) {
        updateTCButton.addEventListener("click", updateTCDetails);
    }
});

function editTC(id) {
    console.log("editTC function called with id:", id);

    // Clear previous input values (if any)
    document.getElementById("tc_edit_tcNoValue").textContent = "";
    document.getElementById("tc_edit_grNoValue").textContent = "";
    document.getElementById("tc_edit_studentNameValue").textContent = "";
    document.getElementById("tc_edit_dateOfLeaving").value = "";
    document.getElementById("tc_edit_standardOfLeaving").value = "";
    document.getElementById("tc_edit_reasonOfLeaving").value = "";
    document.getElementById("tc_edit_progress").value = "";
    document.getElementById("tc_edit_conduct").value = "";
    document.getElementById("tc_edit_result").value = "";
    document.getElementById("tc_edit_remark").value = "";
    document.getElementById("tc_edit_issueDate").value = "";
    document.getElementById("tc_edit_generationStatus").value = "";

    // Fetch data from the server using the id
    fetch(`/edit-tc-details?id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const details = data.details;
                document.getElementById("tc_edit_tcNoValue").textContent = details.tc_no || "";
                document.getElementById("tc_edit_grNoValue").textContent = details.gr_no || "";
                document.getElementById("tc_edit_studentNameValue").textContent = details.student_name || "";
                document.getElementById("tc_edit_dateOfLeaving").value = details.date_of_leaving ? formatToDDMMYYYY(details.date_of_leaving) : "";
                document.getElementById("tc_edit_standardOfLeaving").value = details.standard_of_leaving || "";
                document.getElementById("tc_edit_reasonOfLeaving").value = details.reason_of_leaving || "";
                document.getElementById("tc_edit_progress").value = details.progress || "";
                document.getElementById("tc_edit_conduct").value = details.conduct || "";
                document.getElementById("tc_edit_result").value = details.result || "";
                document.getElementById("tc_edit_remark").value = details.remark || "";
                document.getElementById("tc_edit_issueDate").value = details.issue_date ? formatToDDMMYYYY(details.issue_date) : "";
                document.getElementById("tc_edit_generationStatus").value = details.generation_status || "";

                // Store initial values
                initialFormValues = {
                    dateOfLeaving: details.date_of_leaving ? formatToDDMMYYYY(details.date_of_leaving) : "",
                    standardOfLeaving: details.standard_of_leaving || "",
                    reasonOfLeaving: details.reason_of_leaving || "",
                    progress: details.progress || "",
                    conduct: details.conduct || "",
                    result: details.result || "",
                    remark: details.remark || "",
                    issueDate: details.issue_date ? formatToDDMMYYYY(details.issue_date) : "",
                    generationStatus: details.generation_status || ""
                };

                console.log("Form values populated with fetched data");
            } else {
                console.error("Failed to fetch TC details:", data.message);
            }
        })
        .catch(error => {
            console.error("Error fetching TC details:", error);
            Swal.fire("Error", "Error fetching TC details: " + error.message, "error");
        });

    // Show the form
    document.getElementById("editTCForm").style.display = "flex";
    console.log("Form displayed");
}

function updateTCDetails() {
    const tcNo = document.getElementById("tc_edit_tcNoValue").textContent;
    const grNo = document.getElementById("tc_edit_grNoValue").textContent;
    const dateOfLeaving = document.getElementById("tc_edit_dateOfLeaving").value;
    const standardOfLeaving = document.getElementById("tc_edit_standardOfLeaving").value;
    const reasonOfLeaving = document.getElementById("tc_edit_reasonOfLeaving").value;
    const progress = document.getElementById("tc_edit_progress").value;
    const conduct = document.getElementById("tc_edit_conduct").value;
    const result = document.getElementById("tc_edit_result").value;
    const remark = document.getElementById("tc_edit_remark").value;
    const issueDate = document.getElementById("tc_edit_issueDate").value;
    const generationStatus = document.getElementById("tc_edit_generationStatus").value;

    const payload = {
        tc_no: tcNo,
        gr_no: grNo,
        date_of_leaving: formatToYYYYMMDD(dateOfLeaving),
        standard_of_leaving: standardOfLeaving,
        reason_of_leaving: reasonOfLeaving,
        progress: progress,
        conduct: conduct,
        result: result,
        remark: remark,
        issue_date: formatToYYYYMMDD(issueDate),
        generation_status: generationStatus
    };

    fetch('/update-tc-details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                let changesString = Object.keys(data.changes).map(key => {
                    return `${key}: ${data.changes[key].old} ➜ ${data.changes[key].new}`;
                }).join('<br>');

                Swal.fire({
                    title: 'Changes Applied Successfully',
                    html: `The following changes were made:<br><br>${changesString}`,
                    icon: 'success'
                }).then(() => {
                    // Close the form
                    document.getElementById("editTCForm").style.display = "none";

                    // Refresh the data table
                    refreshTCData();
                });
            } else if (data.message === 'No changes detected') {
                Swal.fire("Info", "No changes were made to the TC details", "info");
            } else {
                Swal.fire("Error", "Failed to update TC details", "error");
            }
        })
        .catch(error => {
            console.error("Error updating TC details:", error);
            Swal.fire("Error", "Failed to update TC details: " + error.message, "error");
        });
}


/////////////////////////// DELETE TC ///////////////////////


function deleteTC(studentId, tcNo, grNo, studentName, generationStatus, section) {
    let issuedCopies = "ORIGINAL";
    if (generationStatus.includes("DUPLICATE")) {
        issuedCopies = "ORIGINAL and DUPLICATE";
    }
    if (generationStatus.includes("TRIPLICATE")) {
        issuedCopies = "ORIGINAL, DUPLICATE, and TRIPLICATE";
    }

    Swal.fire({
        title: 'Are you sure?',
        html: `
               <strong>TC No:</strong> ${tcNo}<br>
               <strong>GR No:</strong> ${grNo}<br>
               <strong>Name:</strong> ${studentName}<br>
               <strong>Issued Copies:</strong> ${issuedCopies}<br><br>
               The selected student is issued with <strong>${issuedCopies} TC</strong>. <br> 
               Please make sure to collect the issued copies before deletion.<br><br>
               <input type="text" id="swal-input" class="swal2-input" placeholder="Enter admin password" autocomplete="off">`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            const input = Swal.getPopup().querySelector('#swal-input').value;
            const correctPassword = 'admin@123';

            if (!input) {
                Swal.showValidationMessage(`Please enter the password`);
                return false; // Prevents the modal from closing
            }

            if (input !== correctPassword) {
                Swal.showValidationMessage(`Incorrect password. Please try again.`);
                return false; // Prevents the modal from closing
            }

            return true; // Validation passes, return true
        }
    }).then((result) => {
        if (result.isConfirmed) {
            showProgressSteps(studentId, tcNo, grNo, studentName, section);
        }
    });
}

async function showProgressSteps(studentId, tcNo, grNo, studentName, section) {
    const intervalMessages = [
        "Reactivating the student...",
        "Deleting TC record...",
        "Regenerating App Credentials...",
        "Reallocating transport..."
    ];

    const updateSwal = async (message) => {
        Swal.update({
            title: "Processing...",
            html: message,
            allowOutsideClick: false,
            showConfirmButton: false,
        });
        Swal.showLoading();
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    Swal.fire({
        title: "Processing...",
        html: intervalMessages[0],
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: async () => {
            Swal.showLoading();

            for (let i = 0; i < intervalMessages.length; i++) {
                await updateSwal(intervalMessages[i]);
            }

            // Once all messages have been displayed, perform the delete operation
            deleteTCRecord(studentId, grNo, section)
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: `TC Deleted Successfully!`,
                        html: `The <strong> TC No - ${tcNo} </strong> for <strong>${studentName}</strong> with GR No <strong>${grNo}</strong> has been deleted.`,
                        showConfirmButton: true
                    });
                    refreshTCData(); // Refresh the table data after deletion
                })
                .catch(error => {
                    console.error('Error during TC deletion operation:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Failed to delete the TC. Please try again later.',
                        showConfirmButton: true
                    });
                });
        }
    });
}

//// DELETE RECORD FROM TC TABLE ////

function deleteTCRecord(studentId, grNo, section) {
    const normalizedSection = section.toLowerCase();
    console.log(`Deleting TC for student ID: ${studentId} in section: ${normalizedSection}`);

    return fetch(`/delete-tc-record?id=${studentId}&grno=${grNo}&section=${normalizedSection}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete the record');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            throw error;
        });
}



////////////////////////// PRINT TC FROM SEARCH ////////////////////

async function fetchSchoolDetails(loginName, schoolName) {
    const response = await fetch('/fetch-school-detail-to-regenerate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: { loginName, schoolName },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }

    const schoolDetailsResponse = await response.json();

    if (!schoolDetailsResponse.result || Object.keys(schoolDetailsResponse.result).length === 0) {
        throw new Error("School details not found or empty.");
    }

    return schoolDetailsResponse.result;
}

async function regenerateTC(tc_no, gr_no, student_name, section, generation_status) {
    let certificateType = '';
    let tcStatus = '';

    switch (generation_status?.toUpperCase()) {
        case 'ORIGINAL':
            certificateType = 'DUPLICATE';
            tcStatus = 'DUPLICATE';
            break;
        case 'DUPLICATE':
            certificateType = 'TRIPLICATE';
            tcStatus = 'TRIPLICATE';
            break;
        case 'TRIPLICATE':
            Swal.fire({
                title: 'Limit Reached',
                html: `There are already three copies issued for this student:<br><strong>${student_name}</strong> (<strong>GR No: ${gr_no}</strong>)`,
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        default:
            certificateType = 'ORIGINAL';
            tcStatus = 'ORIGINAL';
    }

    Swal.fire({
        title: 'Confirm Generation',
        html: `Do you want to generate a <strong>${certificateType} COPY</strong> of Transfer Certificate for<br><strong>GR No: ${gr_no} | ${student_name}</strong>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Fetching Student Details',
                    text: 'Please wait...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Fetch student details
                const studentResponse = await fetch(`/get-student-details-for-tc-regeneration?tc_no=${encodeURIComponent(tc_no)}&grno=${encodeURIComponent(gr_no)}&section=${encodeURIComponent(section)}`);
                if (!studentResponse.ok) {
                    throw new Error(`HTTP error! status: ${studentResponse.status}`);
                }
                const studentData = await studentResponse.json();
                Swal.close();

                if (studentData.error) {
                    Swal.fire({
                        title: 'Error',
                        text: studentData.error,
                        icon: 'error'
                    });
                    return;
                }

                if (studentData.message) {
                    Swal.fire({
                        title: 'Not Found',
                        text: studentData.message,
                        icon: 'warning'
                    });
                    return;
                }

                const studentDetails = studentData.studentDetails;
                const tcDetails = studentData.tcDetails;

                // Fetch school details
                const cookies = document.cookie.split(';').reduce((prev, cookie) => {
                    const [name, value] = cookie.split('=').map(c => c.trim());
                    return { ...prev, [name]: value };
                }, {});
                
                const schoolName = decodeURIComponent(cookies["schoolName"]);
                const loginName = decodeURIComponent(cookies["username"]);
                
                const schoolDetails = await fetchSchoolDetails(loginName, schoolName);

                // Prepare TC form data object
                const tcFormData = {
                    studentName: studentDetails.Name || tcDetails.student_name || "",
                    motherName: studentDetails.Mother_name || "",
                    dob: formatDate(studentDetails.DOB),
                    placeOfBirth: studentDetails.POB || "",
                    nationality: studentDetails.Nationality || "",
                    religion: studentDetails.Religion || "",
                    category: studentDetails.Category || "",
                    caste: studentDetails.Caste || "",
                    aadharId: studentDetails.Adhar_no || "",
                    tc_grNo: studentDetails.Grno || tcDetails.gr_no || "",
                    tc_section: studentDetails.Section || "",
                    tc_class: studentDetails.Standard || tcDetails.current_class || "",
                    saralId: studentDetails.saral_id || "",
                    aaparId: studentDetails.apar_id || "",
                    penId: studentDetails.pen_id || "",
                    lastSchool: studentDetails.Last_School || "NA",
                    dateOfAdmission: formatDate(studentDetails.Admission_Date),
                    classOfAdmission: studentDetails.admitted_class || "",
                    tcNo: tcDetails.tc_no || "",
                    dateOfLeaving: formatDate(tcDetails.date_of_leaving),
                    standardLeaving: tcDetails.standard_of_leaving || "",
                    reasonLeaving: tcDetails.reason_of_leaving || "",
                    progress: tcDetails.progress || "",
                    conduct: tcDetails.conduct || "",
                    result: tcDetails.result || "",
                    remark: tcDetails.remark || "",
                    tcNo: tcDetails.tc_no || "",
                    schoolName: schoolDetails.school_name,
                    loginName: schoolDetails.login_name,
                    contact_no: schoolDetails.contact_no,
                    email_address: schoolDetails.email_address,
                    udise_no: schoolDetails.udise_no,
                    board_index_no: schoolDetails.board_index_no,
                    detailed_address: schoolDetails.detailed_address,
                    tc_status: tcStatus,
                    issueDate: formatDate(tcDetails.issue_date || "")
                };

                console.log('TC Form Data Object:', tcFormData);

                 // Update table header with dynamic tcStatus
                 document.querySelector('.content-table thead').textContent = tcStatus;


                // Call the preview function
                populateTCFormData(tcFormData);

                Swal.fire({
                    title: 'Generating',
                    html: `<strong>${certificateType}</strong> TC generation in progress for<br><strong>GR No: ${gr_no} | ${student_name}</strong>`,
                    icon: 'success'
                });
            } catch (error) {
                Swal.close();
                Swal.fire({
                    title: 'Error',
                    text: `Failed to fetch student or school details: ${error.message}`,
                    icon: 'error'
                });
                console.error('Fetch error:', error);
            }
        }
    });
}


// Utility function to format date
const formatDate = (dateStr) => {
    const components = dateStr.split("-");
    if (components[2].length == 4) {
        // Assuming input is already in DD-MM-YYYY format
        return dateStr;
    }
    const [year, month, day] = components;
    return `${day}-${month}-${year}`;
};