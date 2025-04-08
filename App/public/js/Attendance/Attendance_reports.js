// Arrays to hold attendance data for both overlays
let attendanceData = [];
let attendanceSummaryData = [];

/**************************** Today's Attendance Functions ****************************/



// Function to populate the attendance table by fetching data from the server
async function populateAttendanceTable() {
    try {
        const response = await fetch('/get-daily-attendance', { method: 'POST' });
        const result = await response.json();

        if (!result.data.length) {
            Swal.fire({
                icon: 'info',
                title: 'No Records',
                text: result.message || 'No attendance records found for today.',
                timer: 2000,
                showConfirmButton: false
            });
            document.getElementById('attendanceTableBody').innerHTML = `
                <tr><td colspan="9" style="text-align:center;">No records found.</td></tr>
            `;
        } else {
            attendanceData = result.data;
            renderAttendanceTable(attendanceData);
        }
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error Fetching Data',
            text: error.message,
            confirmButtonText: 'Retry'
        });
    }
}

// Function to render the attendance table with provided data
function renderAttendanceTable(data) {
    const attendanceTableBody = document.getElementById('attendanceTableBody');
    attendanceTableBody.innerHTML = ''; // Clear existing table rows

    data.forEach((record, index) => {
        // Store base64 image in sessionStorage
        if (record.in_image) {
            sessionStorage.setItem(`previewInImage_${index}`, record.in_image);
        }
        if (record.out_image) {
            sessionStorage.setItem(`previewOutImage_${index}`, record.out_image);
        }
    
        const row = document.createElement('tr');
        row.dataset.index = index;
    
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${record.user_id}</td>
            <td>${record.name}</td>
            <td>${record.section}</td>
            <td>${record.standard_division}</td>
            <td>${record.date_of_attendance}</td>
            <td>${record.in_time}</td>
            <td>${record.out_time}</td>
            <td>
                <button 
                    style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin: 5px;"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';"
                    onclick="handlePreview(this)">
                    <img src="../images/camera.png" alt="Preview" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Preview</span>
                </button>
            </td>
        `;

        attendanceTableBody.appendChild(row);
    });
}


// Function to apply filters based on user input
function applyFilters() {
    const filterUserID = document.getElementById('filterUserID').value.toLowerCase();
    const filterName = document.getElementById('filterName').value.toLowerCase();
    const filterSection = document.getElementById('filterSection').value.toLowerCase();
    const filterStandard = document.getElementById('filterStandard').value.toLowerCase();
    const filterDate = document.getElementById('filterDate').value;
    const filterInTime = document.getElementById('filterInTime').value;
    const filterOutTime = document.getElementById('filterOutTime').value;
    const searchValue = document.getElementById('attendanceSearchBar').value.toLowerCase();

    // Filter data based on inputs
    const filteredData = attendanceData.filter(record => {
        return (
            (!filterUserID || record.user_id.toLowerCase().includes(filterUserID)) &&
            (!filterName || record.name.toLowerCase().includes(filterName)) &&
            (!filterSection || record.section.toLowerCase().includes(filterSection)) &&
            (!filterStandard || record.standard_division.toLowerCase().includes(filterStandard)) &&
            (!filterDate || record.date_of_attendance.includes(formatDateToLocal(filterDate))) &&
            (!filterInTime || record.in_time.includes(filterInTime)) &&
            (!filterOutTime || record.out_time.includes(filterOutTime)) &&
            (!searchValue || record.user_id.toLowerCase().includes(searchValue) || record.name.toLowerCase().includes(searchValue))
        );
    });

    renderAttendanceTable(filteredData);
}

// Function to refresh attendance data by repopulating the table
function refreshAttendanceData() {
    populateAttendanceTable();
}

// Initialize filters and search listener for Today's Attendance
document.getElementById('attendanceSearchBar').addEventListener('input', applyFilters);
document.getElementById('filterUserID').addEventListener('input', applyFilters);
document.getElementById('filterName').addEventListener('input', applyFilters);
document.getElementById('filterSection').addEventListener('input', applyFilters);
document.getElementById('filterStandard').addEventListener('input', applyFilters);
document.getElementById('filterDate').addEventListener('input', applyFilters);
document.getElementById('filterInTime').addEventListener('input', applyFilters);
document.getElementById('filterOutTime').addEventListener('input', applyFilters);




/**************************** Attendance Summary Functions ****************************/

// Function to populate the attendance summary table by fetching data from the server
async function populateAttendanceSummaryTable() {
    try {
        const response = await fetch('/get-attendance-summary', { method: 'POST' });
        const result = await response.json();

        if (!result.data.length) {
            Swal.fire({
                icon: 'info',
                title: 'No Records',
                text: result.message || 'No attendance summaries found.',
                timer: 2000,
                showConfirmButton: false
            });
            document.getElementById('attendanceSummaryTableBody').innerHTML = `
                <tr><td colspan="9" style="text-align:center;">No records found.</td></tr>
            `;
        } else {
            attendanceSummaryData = result.data;
            renderAttendanceSummaryTable(attendanceSummaryData);
        }
    } catch (error) {
        console.error("Error fetching attendance summary data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error Fetching Data',
            text: error.message,
            confirmButtonText: 'Retry'
        });
    }

}
// Function to render the attendance summary table with provided data
function renderAttendanceSummaryTable(data) {
    const attendanceSummaryTableBody = document.getElementById('attendanceSummaryTableBody');
    attendanceSummaryTableBody.innerHTML = ''; // Clear existing table rows

    data.forEach((record, index) => {
        // Store base64 image in sessionStorage
        if (record.in_image) {
            sessionStorage.setItem(`summaryPreviewInImage_${index}`, record.in_image);
        }
        if (record.out_image) {
            sessionStorage.setItem(`summaryPreviewOutImage_${index}`, record.out_image);
        }
    
        const row = document.createElement('tr');
        row.dataset.index = index;
    
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${record.user_id}</td>
            <td>${record.name}</td>
            <td>${record.section}</td>
            <td>${record.standard_division}</td>
            <td>${record.date_of_attendance}</td>
            <td>${record.in_time}</td>
            <td>${record.out_time}</td>
            <td>
                <button 
                    style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin: 5px;"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';"
                    onclick="handleSummaryPreview(this)">
                    <img src="../images/camera.png" alt="Preview" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Preview</span>
                </button>
            </td>
        `;

        attendanceSummaryTableBody.appendChild(row);
    });
}

// Function to apply filters based on user input
function applySummaryFilters() {
    const filterUserID = document.getElementById('summaryFilterUserID').value.toLowerCase();
    const filterName = document.getElementById('summaryFilterName').value.toLowerCase();
    const filterSection = document.getElementById('summaryFilterSection').value.toLowerCase();
    const filterStandard = document.getElementById('summaryFilterStandard').value.toLowerCase();
    const filterDate = document.getElementById('summaryFilterDate').value;
    const filterInTime = document.getElementById('summaryFilterInTime').value;
    const filterOutTime = document.getElementById('summaryFilterOutTime').value;
    const searchValue = document.getElementById('attendanceSummarySearchBar').value.toLowerCase();

    // Filter data based on inputs
    const filteredData = attendanceSummaryData.filter(record => {
        return (
            (!filterUserID || record.user_id.toLowerCase().includes(filterUserID)) &&
            (!filterName || record.name.toLowerCase().includes(filterName)) &&
            (!filterSection || record.section.toLowerCase().includes(filterSection)) &&
            (!filterStandard || record.standard_division.toLowerCase().includes(filterStandard)) &&
            (!filterDate || formatToYYYYMMDD(record.date_of_attendance) === filterDate) &&
            (!filterInTime || record.in_time.includes(filterInTime)) &&
            (!filterOutTime || record.out_time.includes(filterOutTime)) &&
            (!searchValue || record.user_id.toLowerCase().includes(searchValue) || record.name.toLowerCase().includes(searchValue))
        );
    });
    

    renderAttendanceSummaryTable(filteredData);
}

// Function to refresh attendance summary data by repopulating the table
function refreshAttendanceSummaryData() {
    populateAttendanceSummaryTable();
}

// Initialize filters and search listener for Attendance Summary
document.getElementById('attendanceSummarySearchBar').addEventListener('input', applySummaryFilters);
document.getElementById('summaryFilterUserID').addEventListener('input', applySummaryFilters);
document.getElementById('summaryFilterName').addEventListener('input', applySummaryFilters);
document.getElementById('summaryFilterSection').addEventListener('input', applySummaryFilters);
document.getElementById('summaryFilterStandard').addEventListener('input', applySummaryFilters);
document.getElementById('summaryFilterDate').addEventListener('input', applySummaryFilters);
document.getElementById('summaryFilterInTime').addEventListener('input', applySummaryFilters);
document.getElementById('summaryFilterOutTime').addEventListener('input', applySummaryFilters);

// Initial data load for both overlays
//refreshAttendanceData();
//refreshAttendanceSummaryData();

// Helper function to convert "dd-mm-yyyy" or similar to "yyyy-mm-dd"
function formatToYYYYMMDD(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        // Assuming original format is dd-mm-yyyy or dd/mm/yyyy
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
}



///////////////////////////////// PREVIEW FUNCTIONS ////////////////////

function handlePreview(button) {
    const rowIndex = button.closest('tr').dataset.index;

    const inImage = sessionStorage.getItem(`previewInImage_${rowIndex}`);
    const outImage = sessionStorage.getItem(`previewOutImage_${rowIndex}`);

    const inImageHTML = inImage ? `<img src="${inImage}" alt="In Image" style="width: 100%; max-width: 300px; border-radius: 8px;" />` : '<p>🟡 No In image available</p>';
    const outImageHTML = outImage ? `<img src="${outImage}" alt="Out Image" style="width: 100%; max-width: 300px; border-radius: 8px;" />` : '<p>🟡 No Out image available</p>';

    Swal.fire({
        title: "📸 Preview Attendance Images",
        html: `
            <div style="display: flex; gap: 20px; justify-content: center; align-items: center; flex-wrap: wrap;">
                <div>
                    <h4>In Image</h4>
                    ${inImageHTML}
                </div>
                <div>
                    <h4>Out Image</h4>
                    ${outImageHTML}
                </div>
            </div>
        `,
        width: '700px',
        confirmButtonText: 'Close'
    });
}

// Function to handle the preview for attendance summary images
function handleSummaryPreview(button) {
    const rowIndex = button.closest('tr').dataset.index;

    const inImage = sessionStorage.getItem(`summaryPreviewInImage_${rowIndex}`);
    const outImage = sessionStorage.getItem(`summaryPreviewOutImage_${rowIndex}`);

    const inImageHTML = inImage ? `<img src="${inImage}" alt="In Image" style="width: 100%; max-width: 300px; border-radius: 8px;" />` : '<p>🟡 No In image available</p>';
    const outImageHTML = outImage ? `<img src="${outImage}" alt="Out Image" style="width: 100%; max-width: 300px; border-radius: 8px;" />` : '<p>🟡 No Out image available</p>';

    Swal.fire({
        title: "📸 Preview Attendance Images",
        html: `
            <div style="display: flex; gap: 20px; justify-content: center; align-items: center; flex-wrap: wrap;">
                <div>
                    <h4>In Image</h4>
                    ${inImageHTML}
                </div>
                <div>
                    <h4>Out Image</h4>
                    ${outImageHTML}
                </div>
            </div>
        `,
        width: '700px',
        confirmButtonText: 'Close'
    });
}