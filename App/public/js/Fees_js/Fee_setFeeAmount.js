// Define all input elements and other variables at the beginning 
const categoryNameInput = document.getElementById('setFeeAmount_categoryName');
const categorySuggestionsContainer = document.getElementById('categorySuggestions');
const classGradeInput = document.getElementById('classGrade');
const gradeSuggestionsContainer = document.getElementById('gradeSuggestions');
const allGradesRadio = document.getElementById('allGrades');
const amountInput = document.getElementById('amount');
const setFeeAmountForm = document.getElementById('setFeeAmountForm');
const searchFeeBar = document.getElementById('searchFeeStructureBar');
const refreshFeeButton = document.getElementById('refreshFeeStructureButton');

const categoryIdInput = document.createElement('input'); // Hidden input for category ID
categoryIdInput.type = 'hidden';
categoryIdInput.name = 'categoryId';
setFeeAmountForm.appendChild(categoryIdInput);

let allCategories = []; // To store all categories
let allGrades = []; // To store all grades

// Function to refresh the fee categories and update the table
function fetchFeeStructures() {
    refreshFeeStructures();
}

let feeStructuresData = []; // This will store the fetched data locally

// Function to refresh fee structures (fetch data and store locally)
function refreshFeeStructures() {
    fetch('/getFeeStructures')
        .then(response => response.json())
        .then(data => {
            feeStructuresData = data;  // Store the fetched data locally
            displayFeeStructures(feeStructuresData);  // Call the display function to populate the table
        })
        .catch(error => {
            console.error('Error fetching fee structures:', error);
        });
}

// Function to display fee structures in the table
function displayFeeStructures(data) {
    const tableBody = document.getElementById('feeStructuresTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No Data Found</td></tr>';
    } else {
        data.forEach(structure => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${structure.structure_id}</td>
                <td>${structure.category_name}</td>
                <td>${structure.class_grade}</td>
                <td>${structure.amount}</td>
                <td>
                    <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                        <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                            onclick="editFeeStructure('${structure.structure_id}')"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Edit</span>
                        </button>
                        <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                            onclick="confirmDeleteFeeStructure('${structure.structure_id}', '${structure.category_name}', '${structure.class_grade}')"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Delete</span>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Function to open the Edit Fee Structure Popup and populate the fields
function editFeeStructure(structure_id) {
    // Find the fee structure from the locally stored data
    const feeStructure = feeStructuresData.find(structure => structure.structure_id == structure_id);

    if (feeStructure) {
        // Display the popup and the overlay
        document.getElementById('editFeeAmountBackgroundOverlay').style.display = 'block';
        document.getElementById('editFeeAmountPopup').style.display = 'block';

        // Apply the blur effect to the background overlay
        document.getElementById('editFeeAmountBackgroundOverlay').style.filter = 'blur(5px)';

        // Clear the fields and add the amount field dynamically
        const feeAmountField = document.createElement('div');
        // feeAmountField.classList.add('form-group');
        feeAmountField.innerHTML = `
        <div class="form-group">
            <label for="editCategoryfeeDisplay" class="form-label">Category:</label>
            <input id="editCategoryfeeDisplay" class="form-control" style="text-align: center;" value="${feeStructure.category_name}" readonly></input>
        </div>
        <div class="form-group">
            <label for="editAmount" class="form-label">Amount:</label>
            <input type="number" id="editAmount" class="form-control" value="${feeStructure.amount}" required>
        </div>
        `;
        document.getElementById('editFeeAmountFields').innerHTML = ''; // Clear existing fields
        document.getElementById('editFeeAmountFields').appendChild(feeAmountField);

        // Save the structure id in a hidden field for use when saving
        document.getElementById('editFeeAmountForm').setAttribute('data-structure-id', feeStructure.structure_id);
    } else {
        alert("Fee structure not found!");
    }
}

// Function to save the updated fee amount
function saveFeeAmountDetails() {
    const structure_id = document.getElementById('editFeeAmountForm').getAttribute('data-structure-id');
    const amount = parseFloat(document.getElementById('editAmount').value);

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const updatedFee = {
        structure_id,
        amount
    };

    // Send the updated amount to the server
    fetch('/updateFeeAmount', {
        method: 'PUT', // Ensure this matches your backend method (PUT or POST)
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFee)
    })
        .then(response => response.json())
        .then(data => {
            // Check the success or failure based on the server's response
            if (data.message === 'Fee amount updated successfully') {
                alert("Fee structure updated successfully!");
                // Close the popup
                closeEditFeeAmountPopup();
                // Refresh the table data
                refreshFeeStructures();
            } else {
                alert("Error updating fee structure: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error saving fee structure:", error);
            alert("There was an error updating the fee structure. Please try again later.");
        });
}


// Function to close the Edit Fee Amount Popup
function closeEditFeeAmountPopup() {
    document.getElementById('editFeeAmountBackgroundOverlay').style.display = 'none';
    document.getElementById('editFeeAmountPopup').style.display = 'none';
}



document.addEventListener('DOMContentLoaded', function () {
    // Function to fetch all category suggestions
    function fetchAllCategories() {
        fetch(`/setFee_getCategoryName`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    allCategories = data;
                    displayCategorySuggestions(allCategories); // Display all categories initially
                } else {
                    console.error('Data is not an array:', data);
                }
            })
            .catch((error) => console.error('Error:', error));
    }

    // Function to fetch all grade suggestions
    function fetchAllGrades() {
        fetch(`/setFee_getGrades`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    allGrades = data;
                    displayGradeSuggestions(allGrades); // Display all grades initially
                } else {
                    console.error('Data is not an array:', data);
                }
            })
            .catch((error) => console.error('Error:', error));
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
            categories.forEach((category) => {
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

        if (!Array.isArray(grades) || grades.length === 0) {
            const noResultsItem = document.createElement('div');
            noResultsItem.classList.add('suggestion-item', 'no-results');
            noResultsItem.textContent = 'No results found';
            gradeSuggestionsContainer.appendChild(noResultsItem);
        } else {
            grades.forEach((grade) => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = grade; // Ensure this matches your database field
                gradeSuggestionsContainer.appendChild(suggestionItem);
            });
        }
    }

    // Show all categories when input is focused
    categoryNameInput.addEventListener('focus', function () {
        fetchAllCategories();
    });

    // Show all grades when input is focused
    classGradeInput.addEventListener('focus', function () {
        fetchAllGrades();
    });

    // Update category suggestions when user types
    categoryNameInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const filteredCategories = allCategories.filter(category =>
            category.category_name.toLowerCase().includes(query)
        );
        displayCategorySuggestions(filteredCategories);
    });

    // Update grade suggestions when user types
    classGradeInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const filteredGrades = allGrades.filter(grade =>
            grade.toLowerCase().includes(query)
        );
        displayGradeSuggestions(filteredGrades);
    });

    // Handle category suggestion click
    categorySuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedCategory = event.target;
            categoryNameInput.value = selectedCategory.textContent;
            categoryIdInput.value = selectedCategory.dataset.categoryId; // Set category ID
            categorySuggestionsContainer.style.display = 'none'; // Hide suggestions container
            categorySuggestionsContainer.innerHTML = '';
        }
    });

    // Handle grade suggestion click
    gradeSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedGrade = event.target;
            classGradeInput.value = selectedGrade.textContent;
            gradeSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            gradeSuggestionsContainer.innerHTML = '';
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
    });






    // Handle form submission
    setFeeAmountForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        const categoryId = categoryIdInput.value;
        const categoryName = categoryNameInput.value;
        const classGrade = allGradesRadio.checked ? 'All Grades' : classGradeInput.value; // Use 'All Grades' if radio is checked
        const amount = amountInput.value;

        const formData = {
            categoryId: categoryId,
            categoryName: categoryName,
            classGrade: classGrade,
            amount: amount
        };

        fetch('/setFeeAmount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        html: `<b>${categoryName}</b> for grade <b>${classGrade}</b> is successfully set with amount <b>${amount}</b>.`
                    }).then(() => {
                        // Reset the form after the alert is closed
                        setFeeAmountForm.reset();
                        categoryIdInput.value = '';
                        allGradesRadio.checked = false;
                        classGradeInput.disabled = false;
                        allGradesRadio.disabled = false;

                        // Fetch and update the fee structures table
                        fetchFeeStructures();
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while adding the fee structure.'
                });
            });
    });

    // Add event listener to the search input for fee amount
    searchFeeBar.addEventListener('input', function () {
        const filter = searchFeeBar.value.toLowerCase();
        const tableBody = document.getElementById('feeStructuresTableBody');
        const rows = tableBody.getElementsByTagName('tr');

        let found = false;
        Array.from(rows).forEach(row => {
            const categoryNameCell = row.getElementsByTagName('td')[1];
            if (categoryNameCell) {
                const categoryName = categoryNameCell.textContent || categoryNameCell.innerText;
                if (categoryName.toLowerCase().indexOf(filter) > -1) {
                    row.style.display = '';
                    found = true;
                } else {
                    row.style.display = 'none';
                }
            }
        });

        // Show "No Fee found" if no rows match the search
        if (!found) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No Fee found</td></tr>';
        }
    });

    // Add event listener to the refresh button for fee amount
    refreshFeeButton.addEventListener('click', function () {
        fetchFeeStructures();
    });

    // Fetch and display fee structures when the overlay is opened
    fetchFeeStructures();
});

// Function to delete a fee structure
function deleteFeeStructure(structureId, categoryName, classGrade) {
    fetch(`/deleteFeeStructure/${structureId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);

            // Show SweetAlert notification with fee structure details
            Swal.fire({
                title: 'Deleted!',
                html: `Fee structure for category '<strong>${categoryName}</strong>' and class '<strong>${classGrade}</strong>' deleted successfully!`,
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Fetch and update the fee structures table
            fetchFeeStructures();
        })
        .catch(error => {
            console.error('Error:', error);
            let errorMessage = `An error occurred: ${error.message}`;

            // Show SweetAlert notification with error message
            Swal.fire({
                title: 'Error',
                html: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
}

// Function to confirm deletion of a fee structure
function confirmDeleteFeeStructure(structureId, categoryName, classGrade) {
    Swal.fire({
        title: 'Are you sure?',
        html: `You won't be able to revert this! Deleting fee structure for category '<strong>${categoryName}</strong>' and class '<strong>${classGrade}</strong>'.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteFeeStructure(structureId, categoryName, classGrade);
        }
    });
}

const classGradeInput1 = document.getElementById('classGrade');
const allGradesCheckbox = document.getElementById('allGrades');

// Disable checkbox when input is focused
classGradeInput1.addEventListener('focus', () => {
    allGradesCheckbox.disabled = true;
    allGradesCheckbox.checked = false; // Uncheck when disabled
});

// Enable checkbox when input loses focus, if no value is present
classGradeInput1.addEventListener('blur', () => {
    if (classGradeInput1.value.trim() === '') {
        allGradesCheckbox.disabled = false;
    }
});

// Clear class field and disable it when the checkbox is checked
allGradesCheckbox.addEventListener('change', () => {
    if (allGradesCheckbox.checked) {
        classGradeInput1.value = '';
        classGradeInput1.disabled = true;
    } else {
        classGradeInput1.disabled = false;
    }
});
