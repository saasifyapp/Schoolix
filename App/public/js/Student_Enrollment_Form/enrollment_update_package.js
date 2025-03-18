// Variables to cache the data
let standardsFetched = false;
let standardsCache = [];
let divisionsFetched = false;
let divisionsCache = [];
let divisionsFetchedSection;
let divisionsFetchedClass;

// Function to display standard suggestions
function displayStandardSuggestions() {
    const standardInput = document.getElementById('update_packagestandard');
    const standardSuggestionsContainer = document.getElementById('update_packagestandardSuggestions');
    const sectionInput = document.getElementById('dropdown1').value.trim();

    standardSuggestionsContainer.style.display = "block";
    const query = standardInput.value.toLowerCase().trim();
    standardSuggestionsContainer.innerHTML = '';

    if (!sectionInput) {
        standardSuggestionsContainer.innerHTML = '<div class="suggestion-item no-results">Please select a section first</div>';
        return;
    }

    if (!standardsFetched) {
        showLoading(standardSuggestionsContainer);

        fetch(`/get-distinct-class?section=${sectionInput}`)
            .then(response => response.json())
            .then(data => {
                standardsCache = data.map(item => item.Standard);
                standardsFetched = true;
                filterAndDisplayStandards(query, standardSuggestionsContainer);
            })
            .catch(error => console.error('Error fetching standards:', error));
    } else {
        filterAndDisplayStandards(query, standardSuggestionsContainer);
    }
}

// Function to filter and display standards
function filterAndDisplayStandards(query, suggestionsContainer) {
    const uniqueStandards = new Set();
    const filteredStandards = standardsCache.filter(standard => {
        const normalizedStandard = standard.toLowerCase();
        if (normalizedStandard.startsWith(query) && !uniqueStandards.has(normalizedStandard)) {
            uniqueStandards.add(normalizedStandard);
            return true;
        }
        return false;
    });

    suggestionsContainer.innerHTML = '';

    if (filteredStandards.length > 0) {
        filteredStandards.forEach(standard => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = standard;
            suggestionItem.dataset.value = standard;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            const standardInput = document.getElementById('update_packagestandard');
            standardInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";

            // Clear divisions field when the standard changes
            clearDivisions();
            handleClassOrDivisionInput(); // Call this to filter table when suggestion is selected
        });
    });
}

// Function to show a loading message
function showLoading(container) {
    container.innerHTML = '<div class="suggestion-item loading">Loading...</div>';
}

// Function to show no results message
function showNoResults(container) {
    container.innerHTML = '<div class="suggestion-item no-results">No results found</div>';
}

// Function to clear the suggestions and fetch new data
function handleDropdownChange() {
    const standardSuggestionsContainer = document.getElementById('update_packagestandardSuggestions');
    const standardInput = document.getElementById('update_packagestandard');
    const divisionInput = document.getElementById('update_packagesDivision');
    const searchInput = document.getElementById('update_packagesearchStudentInput');

    // Clear search, class, and division inputs
    searchInput.value = '';
    standardInput.value = '';
    divisionInput.value = '';

    // Clear cached data and suggestions containers
    standardsCache = [];
    standardsFetched = false;
    standardSuggestionsContainer.innerHTML = '';
    standardSuggestionsContainer.style.display = 'none';

    clearDivisions();
    fetchStudentDetails(document.getElementById('dropdown1').value); // Update table based on the dropdown value
}

// Function to display division suggestions
function displayDivisionSuggestions() {
    const divisionInput = document.getElementById('update_packagesDivision');
    const divisionSuggestionsContainer = document.getElementById('update_packageDivisionSuggestions');
    const sectionInput = document.getElementById('dropdown1').value.trim();
    const classInput = document.getElementById('update_packagestandard').value.trim();

    divisionSuggestionsContainer.style.display = "block";
    const query = divisionInput.value.toLowerCase().trim();
    divisionSuggestionsContainer.innerHTML = '';

    if (!sectionInput || !classInput) {
        divisionSuggestionsContainer.innerHTML = '<div class="suggestion-item no-results">Please select a section and class first</div>';
        return;
    }

    if (!divisionsFetched || sectionInput !== divisionsFetchedSection || classInput !== divisionsFetchedClass) {
        divisionsFetchedSection = sectionInput;
        divisionsFetchedClass = classInput;
        showLoading(divisionSuggestionsContainer);

        fetch(`/get-distinct-division-for-class?section=${sectionInput}&class=${classInput}`)
            .then(response => response.json())
            .then(data => {
                divisionsCache = data.map(item => item.Division);
                divisionsFetched = true;
                filterAndDisplayDivisions(query, divisionSuggestionsContainer);
            })
            .catch(error => console.error('Error fetching divisions:', error));
    } else {
        filterAndDisplayDivisions(query, divisionSuggestionsContainer);
    }
}

// Function to filter and display divisions
function filterAndDisplayDivisions(query, suggestionsContainer) {
    const uniqueDivisions = new Set();
    const filteredDivisions = divisionsCache.filter(division => {
        const normalizedDivision = division.toLowerCase();
        if (normalizedDivision.startsWith(query) && !uniqueDivisions.has(normalizedDivision)) {
            uniqueDivisions.add(normalizedDivision);
            return true;
        }
        return false;
    });

    suggestionsContainer.innerHTML = '';

    if (filteredDivisions.length > 0) {
        filteredDivisions.forEach(division => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = division;
            suggestionItem.dataset.value = division;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            const divisionInput = document.getElementById('update_packagesDivision');
            divisionInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";
            handleClassOrDivisionInput(); // Call this to filter table when suggestion is selected
        });
    });
}

// Function to clear the divisions field and its suggestions
function clearDivisions() {
    const divisionInput = document.getElementById('update_packagesDivision');
    const divisionSuggestionsContainer = document.getElementById('update_packageDivisionSuggestions');

    divisionInput.value = '';
    divisionSuggestionsContainer.innerHTML = '';
    divisionSuggestionsContainer.style.display = 'none';

    divisionsFetched = false;
    divisionsCache = [];
}

// Initialization of standard suggestion box and dropdown change event
document.addEventListener("DOMContentLoaded", function () {
    const standardInput = document.getElementById('update_packagestandard');
    const standardSuggestionsContainer = document.getElementById('update_packagestandardSuggestions');
    const dropdown1 = document.getElementById('dropdown1');
    const divisionInput = document.getElementById('update_packagesDivision');
    const divisionSuggestionsContainer = document.getElementById('update_packageDivisionSuggestions');

    standardInput.addEventListener('input', displayStandardSuggestions);
    standardInput.addEventListener('focus', displayStandardSuggestions);
    standardInput.addEventListener('click', displayStandardSuggestions);
    
    divisionInput.addEventListener('input', displayDivisionSuggestions);
    divisionInput.addEventListener('focus', displayDivisionSuggestions);
    divisionInput.addEventListener('click', displayDivisionSuggestions);

    dropdown1.addEventListener('change', handleDropdownChange);

    document.addEventListener('click', function (event) {
        if (!standardSuggestionsContainer.contains(event.target) && !standardInput.contains(event.target)) {
            standardSuggestionsContainer.style.display = "none";
        }
        if (!divisionSuggestionsContainer.contains(event.target) && !divisionInput.contains(event.target)) {
            divisionSuggestionsContainer.style.display = "none";
        }
    });

    // Initial fetch to populate the table based on default dropdown value
    fetchStudentDetails(dropdown1.value);
});


//////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////// POPULATE PACKAGE UPDATE TABLE //////////////////////

// Function to fetch student details based on section
function fetchStudentDetails(section) {
    const updatePackageTableBody = document.getElementById('updatePackageTableBody');
    // Fetch the student details from the backend
    fetch(`/get-student-details-for-package-update?section=${section}`)
        .then(response => response.json())
        .then(data => {
            updatePackageTableBody.innerHTML = '';
            
            if (data.length > 0) {
                data.forEach(student => {
                    const tr = document.createElement('tr');

                    const selectTd = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    selectTd.appendChild(input);

                    const idTd = document.createElement('td');
                    idTd.textContent = student.student_id;

                    const grnoTd = document.createElement('td');
                    grnoTd.textContent = student.Grno;

                    const nameTd = document.createElement('td');
                    nameTd.textContent = student.Name;

                    const classDivisionTd = document.createElement('td');
                    classDivisionTd.textContent = student.ClassDivision;

                    const packageBreakupTd = document.createElement('td');
                    packageBreakupTd.textContent = student.package_breakup;

                    const totalPackageTd = document.createElement('td');
                    totalPackageTd.textContent = student.total_package;

                    tr.appendChild(selectTd);
                    tr.appendChild(idTd);
                    tr.appendChild(grnoTd);
                    tr.appendChild(nameTd);
                    tr.appendChild(classDivisionTd);
                    tr.appendChild(packageBreakupTd);
                    tr.appendChild(totalPackageTd);

                    updatePackageTableBody.appendChild(tr);
                });
            } else {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 7;
                td.textContent = 'No students found';
                tr.appendChild(td);
                updatePackageTableBody.appendChild(tr);
            }
        })
        .catch(error => {
            console.error('Error fetching student details:', error);
        });
}


///////////////////////////// FILTER TABLE BASED ON SEARCH OR DROPDOWN VALUES ////////////

document.getElementById('update_packagesearchStudentInput').addEventListener('input', handleSearchInput);
document.getElementById('update_packagestandardSuggestions').addEventListener('click', handleSuggestionClick);
document.getElementById('update_packageDivisionSuggestions').addEventListener('click', handleSuggestionClick);

function handleSearchInput() {
    // Clear class and division inputs
    document.getElementById('update_packagestandard').value = '';
    document.getElementById('update_packagesDivision').value = '';

    filterPackageStudents();
}

function handleSuggestionClick(event) {
    if (event.target.classList.contains('suggestion-item')) {
        const targetId = event.target.parentElement.id;
        if (targetId === 'update_packagestandardSuggestions') {
            document.getElementById('update_packagestandard').value = event.target.textContent;
        } else if (targetId === 'update_packageDivisionSuggestions') {
            document.getElementById('update_packagesDivision').value = event.target.textContent;
        }

        handleClassOrDivisionInput(); // Call this to filter table when suggestion is selected
    }
}

function handleClassOrDivisionInput() {
    // Clear search input
    document.getElementById('update_packagesearchStudentInput').value = '';

    filterByClassAndDivision();
}

function filterPackageStudents() {
    const searchInput = document.getElementById('update_packagesearchStudentInput').value.toLowerCase();
    const tableRows = document.querySelectorAll('#updatePackageTableBody tr');
    
    let isNumber = !isNaN(searchInput);
    
    tableRows.forEach(row => {
        let cell;
        if (isNumber) {
            cell = row.cells[2]; // GR Number is in the third cell (index 2)
        } else {
            cell = row.cells[3]; // Name is in the fourth cell (index 3)
        }
        
        if (cell) {
            const cellText = cell.textContent.toLowerCase();
            if (cellText.includes(searchInput)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

function filterByClassAndDivision() {
    const classInput = document.getElementById('update_packagestandard').value.toLowerCase();
    const divisionInput = document.getElementById('update_packagesDivision').value.toLowerCase();
    const tableRows = document.querySelectorAll('#updatePackageTableBody tr');

    tableRows.forEach(row => {
        const standardCell = row.cells[4]; // Standard is in the fifth cell (index 4)

        if (standardCell) {
            const standardText = standardCell.textContent.toLowerCase();
            let matchesClass = classInput ? standardText.includes(classInput) : true;
            let matchesDivision = divisionInput ? standardText.includes(divisionInput) : true;

            if (matchesClass && matchesDivision) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Programmatically set the search input and trigger the filter
function setSearchInput(value) {
    document.getElementById('update_packagesearchStudentInput').value = value;
    handleSearchInput();
}

// Programmatically set class and division inputs and trigger the filter
function setClassAndDivision(classValue, divisionValue) {
    document.getElementById('update_packagestandard').value = classValue;
    document.getElementById('update_packagesDivision').value = divisionValue;
    handleClassOrDivisionInput();
}

////////////////////////// STORE SELECTED STUDENTS //////////////////

// Function to collect selected students' data and show overlay with count
function collectSelectedStudents() {
    const studentForPackageUpdate = []; // Initialize the array to store student data
    const tableRows = document.querySelectorAll('#updatePackageTableBody tr');

    tableRows.forEach(row => {
        const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            const studentData = {
                id: row.cells[1].textContent.trim(),
                grno: row.cells[2].textContent.trim(),
                name: row.cells[3].textContent.trim(),
                standard: row.cells[4].textContent.trim(),
                packageBreakup: row.cells[5].textContent.trim(),
                totalPackage: row.cells[6].textContent.trim()
            };
            studentForPackageUpdate.push(studentData);
        }
    });

    console.log(studentForPackageUpdate); // Log the data to the console for now

    // Display the count of selected students in the new section of the overlay
    const studentCountElement = document.getElementById('studentCount');
    studentCountElement.textContent = `${studentForPackageUpdate.length} students selected`;

}

// Event listener for the Next button
document.getElementById('nextButton').addEventListener('click', collectSelectedStudents);

// Event listener for the Close button
document.getElementById('closeUpdateStudentPackageOverlay').addEventListener('click', function() {
    document.getElementById('updateStudentPackageOverlay').style.display = 'none';
});