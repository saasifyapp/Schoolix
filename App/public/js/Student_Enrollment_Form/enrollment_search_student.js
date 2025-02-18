document.addEventListener('DOMContentLoaded', () => {
    const searchStudentButton = document.getElementById('searchStudent');

    if (searchStudentButton) {
        searchStudentButton.addEventListener('click', fetchAndPopulateStudents);
    }

    const studentFilter = document.getElementById('studentFilter');
    if (studentFilter) {
        studentFilter.addEventListener('change', fetchAndPopulateStudents);
    }
});

let allStudentData = [];

// Fetch data from the server and store it for searching
function fetchAndPopulateStudents() {
    const studentType = document.getElementById('studentFilter').value;
    fetch(`/search_enrolled_students?type=${studentType}`)
        .then(response => response.json())
        .then(data => {
            //console.log('Received data:', data);
            if (Array.isArray(data)) {
                allStudentData = data;
                populateTable(data);  // Initially populate the table with all data
            } else {
                console.error('Expected an array but got:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching student data:', error);
            alert('An error occurred while fetching student data.');
        });
}

// Search and filter the data based on the input
function searchStudentDetails() {
    const searchInput = document.getElementById('searchStudentInput').value.trim();
    let filteredData = [];

    if (!searchInput) {
        populateTable(allStudentData);  // If search input is empty, display all data
        return;
    }

    if (isNaN(searchInput)) {
        // If input is not a number, search by name
        filteredData = allStudentData.filter(student => {
            const studentName = `${student.Firstname || ''} ${student.Middlename || ''} ${student.Surname || ''}`.toLowerCase();
            return studentName.includes(searchInput.toLowerCase());
        });
    } else {
        // If input is a number, search by GR number
        filteredData = allStudentData.filter(student => {
            return student.Grno && student.Grno == searchInput;
        });
    }

    populateTable(filteredData);
}

function populateTable(data) {
    if (!data.length) {
        return;  // No data to display
    }

    const table = document.getElementById('studentsTable');
    const tableHead = table.querySelector('thead');
    const tableBody = document.getElementById('studentsTablebody');
    tableHead.innerHTML = ''; // Clear existing headers
    tableBody.innerHTML = ''; // Clear existing rows

    // Create dynamic table headers
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // Create dynamic table rows
    data.forEach(student => {
        const row = document.createElement('tr');
        headers.forEach(header => {
            const cell = document.createElement('td');
            cell.textContent = student[header] || '';
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
}

//////////////////////// FILTER ///////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    const filterButton = document.querySelector('.filterButton');
    const closeFilterButton = document.getElementById('closeFilterOverlay');
    const studentFilter = document.getElementById('studentFilter');

    // Initialize the previous filters button state
    togglePreviousFiltersButton();

    if (filterButton) {
        filterButton.addEventListener('click', () => {
            updateFilterHeadingAndMessage();
            fetchAndUpdateFilterOptions();
            document.getElementById('filterOverlay').style.display = 'flex';
            logPreviousFiltersState();
        });
    }

    if (closeFilterButton) {
        closeFilterButton.addEventListener('click', () => {
            document.getElementById('filterOverlay').style.display = 'none';
        });
    }

    if (studentFilter) {
        studentFilter.addEventListener('change', () => {
            resetFilters();
            updateFilterHeadingAndMessage();
        });
    }
});

let selectedColumns = [];
let availableColumns = [];

// Update heading and message based on dropdown value
function updateFilterHeadingAndMessage() {
    const studentType = document.getElementById('studentFilter').value;
    const filterHeading = document.getElementById("filterHeading");
    const filterMessage = document.getElementById("filterMessage");

    if (studentType === 'primary') {
        filterHeading.textContent = 'Filters for Primary Section';
        filterMessage.textContent = 'Showing filters for the Primary section';
    } else if (studentType === 'pre_primary') {
        filterHeading.textContent = 'Filters for Pre-primary Section';
        filterMessage.textContent = 'Showing filters for the Pre-primary section';
    } else {
        filterHeading.textContent = 'Filters for (section) section';
        filterMessage.textContent = '';
    }
}

// Fetch and update filter options dynamically
function fetchAndUpdateFilterOptions() {
    const studentType = document.getElementById('studentFilter').value;
    fetch(`/getTableColumns?type=${studentType}`)
        .then(response => response.json())
        .then(columns => {
            // Limit the columns array to the first 10 columns
            const limitedColumns = columns.slice(0, 10);
            availableColumns = limitedColumns;
            updateFilterOptions(limitedColumns);
        })
        .catch(error => {
            console.error('Error fetching table columns:', error);
            alert('An error occurred while fetching table columns.');
        });
}

function updateFilterOptions(columns) {
    const selectFilterDiv = document.querySelector('.select-filter');
    selectFilterDiv.innerHTML = '<h3>Select Filters</h3>'; // Clear existing filters and add heading

    columns.forEach(column => {
        const isChecked = selectedColumns.includes(column);
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="filter" value="${column}" onclick="updateRightSide()" ${isChecked ? 'checked' : ''}> ${column}
        `;
        selectFilterDiv.appendChild(label);
    });

    updateRightSide(); // Update the right side with the preserved filters
}

// Function to update the right-side content based on selected checkboxes
function updateRightSide() {
    const selectedFiltersDiv = document.getElementById("selectedFilters");
    selectedFiltersDiv.innerHTML = ''; // Clear existing selected filters

    // Get all checked checkboxes
    const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    selectedColumns = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);

    // Loop through all checked checkboxes and add their labels to the right side
    selectedColumns.forEach(column => {
        const newDiv = document.createElement("div");
        newDiv.textContent = column;
        selectedFiltersDiv.appendChild(newDiv);
    });

    togglePreviousFiltersButton();
}

function togglePreviousFiltersButton() {
    const lastUsedFilters = localStorage.getItem('lastUsedFilters');
    const button = document.getElementById('previousFiltersButton');
    button.disabled = lastUsedFilters === null;
}

// Log the state of previous filters and the Previous Filters button
function logPreviousFiltersState() {
    const lastUsedFilters = localStorage.getItem('lastUsedFilters');
    console.log('Previous Filters:', lastUsedFilters);
    console.log('Previous Filters Button Enabled:', !document.getElementById('previousFiltersButton').disabled);
}

// Apply filters and fetch filtered data
function applyFilters() {
    const studentType = document.getElementById('studentFilter').value;

    if (selectedColumns.length === 0) {
        // No filters applied, fetch all columns
        fetch(`/search_enrolled_students?type=${studentType}`)
            .then(response => response.json())
            .then(data => {
                populateTable(data);
                document.getElementById('filterOverlay').style.display = 'none'; // Close filter dialog
            })
            .catch(error => {
                console.error('Error fetching all data:', error);
            });
        return;
    }

    // Only store the selected filters if any filters are actually applied
    localStorage.setItem('lastUsedFilters', JSON.stringify({ type: studentType, columns: selectedColumns }));

    fetch(`/fetchFilteredData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: studentType, columns: selectedColumns })
    })
    .then(response => response.json())
    .then(data => {
        populateTable(data);
        document.getElementById('filterOverlay').style.display = 'none'; // Close filter dialog
    })
    .catch(error => {
        console.error('Error fetching filtered data:', error);
    });
}

// Reset filters
function resetFilters() {
    selectedColumns = []; // Clear selected columns
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateRightSide();
}

// Apply previous filters
function applyPreviousFilters() {
    const lastUsedFilters = JSON.parse(localStorage.getItem('lastUsedFilters'));

    if (lastUsedFilters) {
        // Restore the selected columns, ignore unavailable columns
        selectedColumns = lastUsedFilters.columns.filter(column => availableColumns.includes(column));

        // Check the appropriate boxes based on the available columns
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectedColumns.includes(checkbox.value);
        });

        updateRightSide(); // Update the right side with the restored filters
        document.getElementById('filterOverlay').style.display = 'flex';
    }
}

function populateTable(data) {
    const table = document.getElementById('studentsTable');
    const tableHead = table.querySelector('thead');
    const tableBody = document.getElementById('studentsTablebody');
    tableHead.innerHTML = ''; // Clear existing headers
    tableBody.innerHTML = ''; // Clear existing rows

    if (!data.length) {
        tableHead.innerHTML = '<tr><th>No data available</th></tr>';
        return;  // No data to display
    }

    // Create dynamic table headers
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // Create dynamic table rows
    data.forEach(row => {
        const tableRow = document.createElement('tr');
        headers.forEach(header => {
            const cell = document.createElement('td');
            cell.textContent = row[header] || '';
            tableRow.appendChild(cell);
        });
        tableBody.appendChild(tableRow);
    });
}

// Clear localStorage on window unload or refresh to avoid storing stale data
window.addEventListener('beforeunload', () => {
    localStorage.removeItem('lastUsedFilters');
});

////////////////////////////// EXPORT //////////////////////////////////////

function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');
  
    let csvContent = '';
    
    // Extract headers
    const headers = table.querySelectorAll('th');
    const headerData = [];
    headers.forEach(header => {
        headerData.push(`"${header.textContent.trim()}"`);
    });
    csvContent += headerData.join(',') + '\n';
  
    // Extract rows
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) {
            return; // Skip rows without cells (e.g., header row)
        }
        const rowData = [];
        cells.forEach(cell => {
            rowData.push(`"${cell.textContent.trim()}"`);
        });
        csvContent += rowData.join(',') + '\n';
    });
  
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }
  
  function exportStudentsTable() {
    const studentType = document.getElementById('studentFilter').value;
    let filename;

    if (studentType === "primary") {
        filename = selectedColumns.length > 0 ? "Primary_Students_FilteredDetails.csv" : "Primary_Students_AllDetails.csv";
    } else if (studentType === "pre_primary") {
        filename = selectedColumns.length > 0 ? "Pre_Primary_Students_FilteredDetails.csv" : "Pre_Primary_Students_AllDetails.csv";
    } else {
        filename = selectedColumns.length > 0 ? "Students_FilteredDetails.csv" : "Students_AllDetails.csv"; // Default filename
    }

    exportTableToCSV('studentsTable', filename);
}