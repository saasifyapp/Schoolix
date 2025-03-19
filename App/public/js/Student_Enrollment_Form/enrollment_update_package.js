// Variables to cache the data
let standardsFetched = false;
let standardsCache = [];
let divisionsFetched = false;
let divisionsCache = [];
let divisionsFetchedSection;
let divisionsFetchedClass;

//////////*** Function to display standard suggestions*//////////////////////

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

/**
 * Function to filter and display standards
 */
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
            enableCheckboxesIfNecessary(); // Call to enable checkboxes based on inputs
        });
    });
}

/**
 * Function to show a loading message
 */
function showLoading(container) {
    container.innerHTML = '<div class="suggestion-item loading">Loading...</div>';
}

/**
 * Function to show no results message
 */
function showNoResults(container) {
    container.innerHTML = '<div class="suggestion-item no-results">No results found</div>';
}

/**
 * Function to clear the suggestions and fetch new data
 */
function handleDropdownChange() {
    const standardSuggestionsContainer = document.getElementById('update_packagestandardSuggestions');
    const standardInput = document.getElementById('update_packagestandard');
    const divisionInput = document.getElementById('update_packagesDivision');
    const searchInput = document.getElementById('update_packagesearchStudentInput');
    const checkboxes = document.querySelectorAll('.student-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');

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

    // Clear and disable all checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.disabled = true;
    });

    // Disable the select all checkbox
    selectAllCheckbox.checked = false;
    selectAllCheckbox.disabled = true;
}

/**
 * Function to display division suggestions
 */
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

/**
 * Function to filter and display divisions
 */
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
            enableCheckboxesIfNecessary(); // Call to enable checkboxes based on inputs
        });
    });
}

/**
 * Function to clear the divisions field and its suggestions
 */
function clearDivisions() {
    const divisionInput = document.getElementById('update_packagesDivision');
    const divisionSuggestionsContainer = document.getElementById('update_packageDivisionSuggestions');

    divisionInput.value = '';
    divisionSuggestionsContainer.innerHTML = '';
    divisionSuggestionsContainer.style.display = 'none';

    divisionsFetched = false;
    divisionsCache = [];
}

/**
 * Initialization of standard suggestion box and dropdown change event
 */
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



/**
 * Function to fetch student details based on section
 */
function fetchStudentDetails(section) {
    const updatePackageTableBody = document.getElementById('updatePackageTableBody');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');

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
                    input.classList.add('student-checkbox');
                    input.disabled = true; // Initially disable the checkbox

                    // Add event listener for checkbox
                    input.addEventListener('change', function() {
                        if (this.checked) {
                            validateReceiptStatusAndCheck(this, student);
                        }
                        updateHeaderCheckboxState();
                    });
                    selectTd.appendChild(input);

                    const idTd = document.createElement('td');
                    idTd.textContent = student.student_id;

                    const grnoTd = document.createElement('td');
                    grnoTd.textContent = student.Grno;

                    const nameTd = document.createElement('td');
                    nameTd.textContent = student.Name;

                    const standardTd = document.createElement('td');
                    standardTd.textContent = student.ClassDivision;

                    const packageBreakupTd = document.createElement('td');
                    packageBreakupTd.textContent = student.package_breakup;

                    const totalPackageTd = document.createElement('td');
                    totalPackageTd.textContent = student.total_package;

                    tr.appendChild(selectTd);
                    tr.appendChild(idTd);
                    tr.appendChild(grnoTd);
                    tr.appendChild(nameTd);
                    tr.appendChild(standardTd);
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

            enableCheckboxesIfNecessary(); // Enable checkboxes if necessary
        })
        .catch(error => {
            console.error('Error fetching student details:', error);
        });
}

/**
 * Function to update the header checkbox state
 */
function updateHeaderCheckboxState() {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');

    let anyChecked = false;
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            anyChecked = true;
        }
    });

    selectAllCheckbox.disabled = !anyChecked;
    selectAllCheckbox.checked = anyChecked;
}

/**
 * Function to deselect all checkboxes
 */
function toggleSelectAll(source) {
    if (!source.checked) {
        const checkboxes = document.querySelectorAll('.student-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Disable the header checkbox
        source.disabled = true;
    }
    // Ensure the checks above don't affect `source.checked`
    updateHeaderCheckboxState();
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
    enableCheckboxesIfNecessary(); // Enable checkboxes if search input is used
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
        enableCheckboxesIfNecessary(); // Enable checkboxes if any suggestion is used
    }
}

function handleClassOrDivisionInput() {
    // Clear search input
    document.getElementById('update_packagesearchStudentInput').value = '';

    filterByClassAndDivision();
    enableCheckboxesIfNecessary(); // Enable checkboxes if class or division input is used
}

/**
 * Function to filter package students based on search input
 */
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

/**
 * Function to filter rows by class and division
 */
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

/**
 * Programmatically set the search input and trigger the filter
 */
function setSearchInput(value) {
    document.getElementById('update_packagesearchStudentInput').value = value;
    handleSearchInput();
    enableCheckboxesIfNecessary(); // Enable checkboxes if search input is used
}

/**
 * Programmatically set class and division inputs and trigger the filter
 */
function setClassAndDivision(classValue, divisionValue) {
    document.getElementById('update_packagestandard').value = classValue;
    document.getElementById('update_packagesDivision').value = divisionValue;
    handleClassOrDivisionInput();
    enableCheckboxesIfNecessary(); // Enable checkboxes if class or division input is used
}

/**
 * Function to enable or disable checkboxes based on the inputs
 */
function enableCheckboxesIfNecessary() {
    const searchInput = document.getElementById('update_packagesearchStudentInput').value.trim();
    const standardInput = document.getElementById('update_packagestandard').value.trim();
    const divisionInput = document.getElementById('update_packagesDivision').value.trim();
    const checkboxes = document.querySelectorAll('.student-checkbox');

    const shouldEnable = searchInput || standardInput || divisionInput;

    checkboxes.forEach(checkbox => {
        checkbox.disabled = !shouldEnable;
    });

    document.getElementById('selectAllCheckbox').disabled = !shouldEnable;
}



/////////////////////////// CHECK RECEIPT STATUS ON EACH SELECTION ////////

/**
 * Function to validate receipt status and check the checkbox if validation passes
 */
function validateReceiptStatusAndCheck(checkbox, student) {
    const sectionInput = document.getElementById('dropdown1').value.trim();
    const grNo = student.Grno;

    fetch(`/checkOutstandingAndTotalPackage?section=${sectionInput}&grNo=${grNo}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error
                });
                checkbox.checked = false; // Uncheck if there is an error
                return;
            }

            const { current_outstanding, total_package } = data;

            if (data.proceedWithPackageGeneration || current_outstanding === total_package) {
                checkbox.checked = true; // Check the checkbox if valid
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cannot proceed',
                    html: `There is a receipt generated for<br><strong>GR No: ${grNo}</strong><br><strong>Name: ${student.Name}</strong><br><strong>Standard: ${student.ClassDivision}</strong><br><br>Please delete the receipt to edit the package for this specific student.`
                });
                checkbox.checked = false; // Uncheck if not valid
            }
            updateHeaderCheckboxState(); // Update the header checkbox state
        })
        .catch(error => {
            console.error('Error checking outstanding and total package:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error checking outstanding and total package.'
            });
            checkbox.checked = false; // Uncheck in case of error
        });
}


////////////////////////// STORE SELECTED STUDENTS //////////////////

function collectSelectedStudents() {
    let classInput = document.getElementById('update_packagestandard').value.toLowerCase();
    const divisionInput = document.getElementById('update_packagesDivision').value.toLowerCase();
    const searchInput = document.getElementById('update_packagesearchStudentInput').value;

    // Check if either classInput or searchInput has a value
    if (classInput === "" && searchInput === "") {
        // Show alert using Swal2
        Swal.fire({
            title: 'Warning',
            html: 'Please select a <strong>Single student using Search bar</strong> <br> or <br>use <strong>Class Filter for group of students</strong>',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return; // Exit the function
    }

    // Clear existing students fetched
    const studentForPackageUpdate = []; 

    const tableRows = document.querySelectorAll('#updatePackageTableBody tr');
    let initialClass = null;

    tableRows.forEach(row => {
        const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            const studentData = {
                id: row.cells[1].textContent.trim(),
                grno: row.cells[2].textContent.trim(),
                name: row.cells[3].textContent.trim(),
                standard: row.cells[4].textContent.trim().split(' ')[0], // Extract class
                packageBreakup: row.cells[5].textContent.trim(),
                totalPackage: row.cells[6].textContent.trim()
            };

            // Set initial class if not yet set
            if (!initialClass) {
                initialClass = studentData.standard.toLowerCase();
            }

            studentForPackageUpdate.push(studentData);

            // If class value is not set from the input field, extract it from the table row
            if (!classInput) {
                classInput = studentData.standard.toLowerCase();
            }
        }
    });

    // Check if at least one student is selected
    if (studentForPackageUpdate.length === 0) {
        // Show alert using Swal2
        Swal.fire({
            title: 'Warning',
            text: 'Please select at least one student for updating package.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return; // Exit the function
    }

    // Check if all selected students belong to the same class
    if (!studentForPackageUpdate.every(student => student.standard.toLowerCase() === initialClass)) {
        Swal.fire({
            title: 'Warning',
            text: 'All selected students must belong to the same class.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return; // Exit the function if classes don't match
    }

    console.log(studentForPackageUpdate); // Log the data to the console for now

    // Display the count of selected students along with the class they belong to
    const studentCountElement = document.getElementById('studentCount');
    studentCountElement.textContent = `${studentForPackageUpdate.length} students selected from class: ${initialClass.charAt(0).toUpperCase() + initialClass.slice(1)}`;

    // Open the overlay
    document.getElementById('updateStudentPackageOverlay').style.display = 'flex';

    // Store the class in a variable to pass to the endpoint
    window.selectedClass = initialClass;

    // Fetch fee structure for the selected class
    populatePackageTable(window.selectedClass);
}

// Event listener for the Next button
document.getElementById('nextButton').addEventListener('click', collectSelectedStudents);

// Event listener for the Close button
document.getElementById('closeUpdateStudentPackageOverlay').addEventListener('click', function() {
    document.getElementById('updateStudentPackageOverlay').style.display = 'none';
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////// OVERLAY 2 /////////////////////////////////////




///////////////////////////// POPULATE CATEGORY / GRADE / AMPUNT INPUT ///////////////

let allCategories = [];
let allGrades = [];
let allAmounts = [];

// Elements
const categoryNameInput = document.getElementById('categoryNameInput');
const classGradeInput = document.getElementById('classGradeInput');
const amountInput = document.getElementById('amountInput');
const categorySuggestionsContainer = document.getElementById('categorySuggestionsContainer');
const gradeSuggestionsContainer = document.getElementById('gradeSuggestionsContainer');
const amountSuggestionsContainer = document.getElementById('amountSuggestionsContainer');

// Function to fetch all category suggestions
function fetchAllCategories() {
    fetch(`/get-fee-category-for-package-update`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                allCategories = data;
                displayCategorySuggestions(allCategories); // Display all categories initially
            } else {
                console.error('Data is not an array:', data);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to fetch grades based on selected category
function fetchGradesForCategory(categoryId) {
    fetch(`/get-grade-for-category?categoryId=${categoryId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                allGrades = data;
            } else {
                console.error('Data is not an array:', data);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to fetch amounts based on selected category and grade
function fetchAmountsForCategoryAndGrade(categoryId, grade) {
    fetch(`/get-category-grade-amounts?categoryId=${categoryId}&grade=${grade}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                allAmounts = data;
            } else {
                console.error('Data is not an array:', data);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to display category suggestions
function displayCategorySuggestions(categories) {
    categorySuggestionsContainer.style.display = 'block'; // Show suggestions container
    categorySuggestionsContainer.innerHTML = '';

    if (!Array.isArray(categories) || categories.length === 0) {
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.textContent = 'No results found';
        categorySuggestionsContainer.appendChild(noResultsItem);
    } else {
        categories.forEach(category => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = category.category_name;
            suggestionItem.dataset.categoryId = category.category_id; // Store category ID
            categorySuggestionsContainer.appendChild(suggestionItem);
        });
    }
}

// Function to display grade suggestions
function displayGradeSuggestions(grades) {
    gradeSuggestionsContainer.style.display = 'block'; // Show suggestions container
    gradeSuggestionsContainer.innerHTML = '';

    if (categoryNameInput.value.trim() === '') {
        const noCategorySelectedItem = document.createElement('div');
        noCategorySelectedItem.classList.add('suggestion-item', 'no-results');
        noCategorySelectedItem.textContent = 'Please select a category';
        gradeSuggestionsContainer.appendChild(noCategorySelectedItem);
        return;
    }

    if (!Array.isArray(grades) || grades.length === 0) {
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.textContent = 'No results found';
        gradeSuggestionsContainer.appendChild(noResultsItem);
    } else {
        grades.forEach(grade => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = grade.class_grade; // Ensure this matches your database field
            gradeSuggestionsContainer.appendChild(suggestionItem);
        });
    }
}

// Function to display amount suggestions
function displayAmountSuggestions(amounts) {
    amountSuggestionsContainer.style.display = 'block'; // Show suggestions container
    amountSuggestionsContainer.innerHTML = '';

    if (classGradeInput.value.trim() === '') {
        const noGradeSelectedItem = document.createElement('div');
        noGradeSelectedItem.classList.add('suggestion-item', 'no-results');
        noGradeSelectedItem.textContent = 'Please select a grade';
        amountSuggestionsContainer.appendChild(noGradeSelectedItem);
        return;
    }

    if (!Array.isArray(amounts) || amounts.length === 0) {
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.textContent = 'No results found';
        amountSuggestionsContainer.appendChild(noResultsItem);
    } else {
        amounts.forEach(amount => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = amount.amount; // Ensure this matches your database field
            amountSuggestionsContainer.appendChild(suggestionItem);
        });
    }
}

// Show all categories when input is focused or clicked
categoryNameInput.addEventListener('focus', function () {
    if (allCategories.length === 0) {
        fetchAllCategories();
    } else {
        displayCategorySuggestions(allCategories);
    }
});
categoryNameInput.addEventListener('click', function () {
    if (allCategories.length === 0) {
        fetchAllCategories();
    } else {
        displayCategorySuggestions(allCategories);
    }
});

// Update category suggestions when user types
categoryNameInput.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const filteredCategories = allCategories.filter(category =>
        category.category_name.toLowerCase().includes(query)
    );
    displayCategorySuggestions(filteredCategories);
});

// Handle category suggestion click
categorySuggestionsContainer.addEventListener('click', function (event) {
    if (event.target.classList.contains('suggestion-item')) {
        const selectedCategory = event.target;
        categoryNameInput.value = selectedCategory.textContent;
        categoryNameInput.dataset.categoryId = selectedCategory.dataset.categoryId; // Set category ID
        
        // Clear grade and amount inputs and suggestions
        classGradeInput.value = '';
        amountInput.value = '';
        allGrades = [];
        allAmounts = [];
        gradeSuggestionsContainer.innerHTML = '';
        amountSuggestionsContainer.innerHTML = '';

        // Fetch grades for the selected category without displaying them yet
        fetchGradesForCategory(selectedCategory.dataset.categoryId);
        
        categorySuggestionsContainer.style.display = 'none'; // Hide suggestions container
        categorySuggestionsContainer.innerHTML = '';
    }
});

// Show grades when input is focused or clicked
classGradeInput.addEventListener('focus', function () {
    displayGradeSuggestions(allGrades);
});
classGradeInput.addEventListener('click', function () {
    displayGradeSuggestions(allGrades);
});

// Update grade suggestions when user types
classGradeInput.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const filteredGrades = allGrades.filter(grade =>
        grade.class_grade.toLowerCase().includes(query)
    );
    displayGradeSuggestions(filteredGrades);
});

// Handle grade suggestion click
gradeSuggestionsContainer.addEventListener('click', function (event) {
    if (event.target.classList.contains('suggestion-item')) {
        const selectedGrade = event.target;
        classGradeInput.value = selectedGrade.textContent;
        
        // Clear amount input and suggestions
        amountInput.value = '';
        allAmounts = [];
        amountSuggestionsContainer.innerHTML = '';

        // Fetch amounts for the selected category and grade without displaying them yet
        const selectedCategoryId = categoryNameInput.dataset.categoryId;
        const selectedGradeText = classGradeInput.value;
        fetchAmountsForCategoryAndGrade(selectedCategoryId, selectedGradeText);
        
        gradeSuggestionsContainer.style.display = 'none'; // Hide suggestions container
        gradeSuggestionsContainer.innerHTML = '';
    }
});

// Show amounts when input is focused or clicked
amountInput.addEventListener('focus', function () {
    displayAmountSuggestions(allAmounts);
});
amountInput.addEventListener('click', function () {
    displayAmountSuggestions(allAmounts);
});

// Update amount suggestions when user types (if needed)
amountInput.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const filteredAmounts = allAmounts.filter(amount =>
        amount.amount.toLowerCase().includes(query)
    );
    displayAmountSuggestions(filteredAmounts);
});

// Handle amount suggestion click
amountSuggestionsContainer.addEventListener('click', function (event) {
    if (event.target.classList.contains('suggestion-item')) {
        const selectedAmount = event.target;
        amountInput.value = selectedAmount.textContent;
        amountSuggestionsContainer.style.display = 'none'; // Hide suggestions container
        amountSuggestionsContainer.innerHTML = '';
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', function (event) {
    if (!categorySuggestionsContainer.contains(event.target) && !categoryNameInput.contains(event.target)) {
        categorySuggestionsContainer.style.display = 'none'; // Hide suggestions container
        categorySuggestionsContainer.innerHTML = '';
    }
    if (!gradeSuggestionsContainer.contains(event.target) && !classGradeInput.contains(event.target)) {
        gradeSuggestionsContainer.style.display = 'none'; // Hide suggestions container
        gradeSuggestionsContainer.innerHTML = '';
    }
    if (!amountSuggestionsContainer.contains(event.target) && !amountInput.contains(event.target)) {
        amountSuggestionsContainer.style.display = 'none'; // Hide suggestions container
        amountSuggestionsContainer.innerHTML = '';
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////// ADD PACKAGE FUNCTIONALITY ///////////////////////

// Function to update the total amount row dynamically based on the current table data
function updateTotalAmount() {
    const packageTable = document.getElementById("packageTable").querySelector("tbody");
    let totalAmount = 0;

    // Sum all the amounts from the table rows
    packageTable.querySelectorAll('tr').forEach(row => {
        if(!row.classList.contains('total-row')) {
            const amountCell = row.cells[2];
            totalAmount += parseFloat(amountCell.textContent);
        }
    });

    // Remove existing total row if it exists
    const existingTotalRow = packageTable.querySelector('.total-row');
    if (existingTotalRow) {
        existingTotalRow.remove();
    }

    // Create and append the new total row
    const totalRow = document.createElement('tr');
    totalRow.style.fontWeight = 'bold';
    totalRow.classList.add('total-row');

    const totalCategoryCell = document.createElement('td');
    totalCategoryCell.textContent = 'Total Package';

    const totalAmountCell = document.createElement('td');
    totalAmountCell.textContent = totalAmount.toFixed(2);
    totalAmountCell.colSpan = 2;
    
    totalRow.appendChild(totalCategoryCell);
    totalRow.appendChild(totalAmountCell);

    const emptyCell = document.createElement('td');
    totalRow.appendChild(emptyCell);

    packageTable.appendChild(totalRow);
}

// Event listener for the Add to Package button
document.getElementById('addToPackage').addEventListener('click', function () {
    const categoryInput = document.getElementById('categoryNameInput').value.trim();
    const gradeInput = document.getElementById('classGradeInput').value.trim();
    const amountInput = document.getElementById('amountInput').value.trim();

    // Validate inputs
    if (!categoryInput || !gradeInput || !amountInput) {
        Swal.fire({
            title: 'Error',
            text: 'Please enter Category, Grade, and Amount',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Package Table
    const packageTable = document.getElementById("packageTable").querySelector("tbody");

    // Check if the same category with the same grade and amount already exists
    const rows = packageTable.querySelectorAll('tr');
    for (const row of rows) {
        const rowCategory = row.cells[0].textContent.trim();
        const rowGrade = row.cells[1].textContent.trim();
        const rowAmount = row.cells[2].textContent.trim();

        if (rowCategory === categoryInput && rowGrade === gradeInput && rowAmount === amountInput) {
            Swal.fire({
                title: 'Warning',
                text: 'Component already exists in the package',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }
    }

    // Create a new row
    const newRow = document.createElement('tr');

    // Add Category Cell
    const categoryCell = document.createElement('td');
    categoryCell.textContent = categoryInput;
    newRow.appendChild(categoryCell);

    // Add Grade Cell
    const gradeCell = document.createElement('td');
    gradeCell.textContent = gradeInput;
    newRow.appendChild(gradeCell);

    // Add Amount Cell
    const amountCell = document.createElement('td');
    amountCell.textContent = amountInput;
    newRow.appendChild(amountCell);

    // Remove action button
    const actionCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function () {
        newRow.remove();
        updateTotalAmount();
    });
    actionCell.appendChild(removeButton);
    newRow.appendChild(actionCell);

    // Append the new row to the table
    packageTable.appendChild(newRow);

    // Update the total amount
    updateTotalAmount();
});


////////////////////////////// POPULATE PACKAGE TABLE /////////////////

// Function to populate the package table
function populatePackageTable(selectedClass) {
    const packageTable = document.getElementById("packageTable").querySelector("tbody");
    fetch(`/get-all-grade-fee-structure?class=${selectedClass}`)
        .then(response => response.json())
        .then(data => {
            packageTable.innerHTML = ''; // Clear existing rows
            
            let totalAmount = 0; // Initialize total amount

            data.forEach(feeStructure => {
                const row = document.createElement('tr');
                
                const categoryCell = document.createElement('td');
                categoryCell.textContent = feeStructure.category_name;
                
                const gradeCell = document.createElement('td');
                gradeCell.textContent = feeStructure.class_grade;

                const amountCell = document.createElement('td');
                amountCell.textContent = feeStructure.amount;

                // Sum up the amounts
                totalAmount += parseFloat(feeStructure.amount);

                row.appendChild(categoryCell);
                row.appendChild(gradeCell);
                row.appendChild(amountCell);

                // Add only if the grade is not 'All Grades'
                if (feeStructure.class_grade.toLowerCase() !== 'all grades') {
                    const actionCell = document.createElement('td');
                    const removeButton = document.createElement('button');
                    removeButton.textContent = 'Remove';
                    removeButton.addEventListener('click', () => {
                        row.remove();
                        updateTotalAmount();
                    });
                    actionCell.appendChild(removeButton);
                    row.appendChild(actionCell);
                } else {
                    // Add an empty cell for consistency
                    const emptyCell = document.createElement('td');
                    row.appendChild(emptyCell);
                }

                packageTable.appendChild(row);
            });

            // Add total amount row
            updateTotalAmount();
        })
        .catch(error => console.error('Error fetching fee structures:', error));
}

document.addEventListener("DOMContentLoaded", function () {
    // Get the selected class from the input field
    const selectedClass = document.getElementById('update_packagestandard').value;

    // Log the selected class to the console
    //console.log('Selected class:', selectedClass);

    // Populate the package table on page load
    populatePackageTable(selectedClass);
});


/////////////////////////////// UPDATE PACKAGE //////////////////

