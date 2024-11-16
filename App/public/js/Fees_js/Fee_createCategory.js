document.addEventListener('DOMContentLoaded', function () {
    // Get the form element
    const createCategoryForm = document.querySelector('#createCategoryForm');

    // Handle form submission
    createCategoryForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission
        showFeeLoader();

        // Get form data
        const categoryName = capitalizeName(formatInput(document.getElementById('categoryName').value));
        const categoryDescription = document.getElementById('categoryDescription').value;

        // Create data object
        const data = {
            category_name: categoryName,
            description: categoryDescription
        };

        // Send data to the server
        fetch('/createFeeCategory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    // Return the response JSON to extract the error message
                    hideFeeLoader();
                    return response.json().then(errorData => {
                        throw new Error(errorData.error);
                    });
                }
                return response.json();
            })
            .then(data => {
                hideFeeLoader();
                console.log('Success:', data);
                // Clear the form inputs
                document.getElementById('categoryName').value = '';
                document.getElementById('categoryDescription').value = '';

                // Show SweetAlert notification with category name
                Swal.fire({
                    title: 'Success!',
                    html: `Category '<strong>${categoryName}</strong>' created successfully!`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                // Fetch and update the fee categories table
                fetchFeeCategories();
            })
            .catch(error => {
                hideFeeLoader();
                console.error('Error:', error);
                let errorMessage = `An error occurred: ${error.message}`;
                if (error.message.includes("Category name already exists")) {
                    errorMessage = `Category with name '<strong>${categoryName}</strong>' already exists`;
                }

                // Show SweetAlert notification with error message
                Swal.fire({
                    title: 'Error',
                    html: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            });
    });

    // Add event listener to the search input
    const searchBar = document.getElementById('searchBar');
    searchBar.addEventListener('input', function () {
        const filter = searchBar.value.toLowerCase();
        const tableBody = document.getElementById('feeCategoriesTableBody');
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

        // Show "No Fee Category found" if no rows match the search
        if (!found) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No Fee Category found</td></tr>';
        }
    });

    // Add event listener to the refresh button
    const refreshButton = document.getElementById('refreshButton');
    refreshButton.addEventListener('click', function () {
        fetchFeeCategories();
    });

    // Fetch and display fee categories when the overlay is opened
    fetchFeeCategories();
});

// Local object to store fee category data
const feeCategoryData = {};

// Function to fetch fee categories from the server
function fetchFeeCategories() {
    fetch('/getFeeCategories')
        .then(response => response.json())
        .then(data => {
            // Store the data in the local object
            data.forEach(category => {
                feeCategoryData[category.category_id] = category;
            });

            // Call the display function to update the UI
            displayFeeCategoryData();
        })
        .catch(error => {
            console.error('Error fetching fee categories:', error);
        });
}

// Function to display fee categories in the table
function displayFeeCategoryData() {
    const tableBody = document.getElementById('feeCategoriesTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    const categories = Object.values(feeCategoryData);
    if (categories.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No Data Found</td></tr>';
    } else {
        categories.forEach(category => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${category.category_id}</td>
                <td>${category.category_name}</td>
                <td>${category.description}</td>
                <td>
                    <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                        <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                            onclick="editFeeCategory('${category.category_id}')"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Edit</span>
                        </button>
                        <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                            onclick="confirmDeleteFeeCategory('${category.category_id}', '${category.category_name}')"
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

// // Function to refresh the fee categories and update the table
// function refreshFeeCategories() {
//     fetchFeeCategories();
// }

// Function to display the Edit Fee Structure popup
function editFeeCategory(categoryId) {
    const category = feeCategoryData[categoryId];

    if (!category) {
        alert('Error: Category not found');
        return;
    }

    // Populate the fields with the category data
    // document.getElementById('editCategoryfeeDisplay').innerHTML = category.category_name;
    const feeFieldsContainer = document.getElementById('editFeeFields');
    feeFieldsContainer.innerHTML = `
        <div class="form-group">
            <label for="editCategoryName" class="form-label">Category Name:</label>
            <input type="text" id="editCategoryName" class="form-control" value="${category.category_name}" required>
        </div>
        <div class="form-group">
            <label for="editCategoryDescription" class="form-label">Category Description:</label>
            <textarea id="editCategoryDescription" class="form-control">${category.description || ''}</textarea>
        </div>
    `;

    // Add a hidden input to store the category ID
    const categoryIdInput = document.createElement('input');
    categoryIdInput.type = 'hidden';
    categoryIdInput.id = 'editCategoryId';
    categoryIdInput.value = categoryId;
    feeFieldsContainer.appendChild(categoryIdInput);

    // Show the popup and overlay
    document.getElementById('editFeeStructureOverlay').style.display = 'block';
    document.getElementById('editFeeStructurePopup').style.display = 'block';
}

// Function to close the Edit Fee Structure popup
function closeEditFeeStructurePopup() {
    // Hide the popup and overlay
    document.getElementById('editFeeStructureOverlay').style.display = 'none';
    document.getElementById('editFeeStructurePopup').style.display = 'none';
}



// Function to save the edited fee structure details
async function saveFeeStructureDetails() {
    showFeeLoader();
    const categoryId = document.getElementById('editCategoryId').value;
    const categoryName = capitalizeName(formatInput(document.getElementById('editCategoryName').value.trim()));
    const categoryDescription = document.getElementById('editCategoryDescription').value.trim();

    // Validate the inputs
    if (!categoryName) {
        hideFeeLoader();
        alert('Error: Category name is required');
        return;
    }

    // Fetch the original category data for comparison
    const originalCategory = feeCategoryData[categoryId];
    let isNameExists = false;
    let isDescriptionExists = false;

    // Check if the category name was edited
    if (categoryName !== originalCategory.category_name) {
        isNameExists = Object.values(feeCategoryData).some(
            category => category.category_name === categoryName && category.category_id !== categoryId
        );
        if (isNameExists) {
            hideFeeLoader();
            alert('Error: Category name already exists');
            return;
        }
    }

    // Check if the category description was edited
    if (categoryDescription !== originalCategory.description) {
        isDescriptionExists = Object.values(feeCategoryData).some(
            category => category.description === categoryDescription && category.category_id !== categoryId
        );
        if (isDescriptionExists) {
            hideFeeLoader();
            alert('Error: Category description already exists');
            return;
        }
    }

    // Prepare the data to be sent to the server
    const updatedCategory = {
        category_name: categoryName,
        description: categoryDescription,
    };

    try {
        // Make the PUT request to the server
        const response = await fetch(`/editFeeCategory/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedCategory),
        });
        showFeeLoader();
        const result = await response.json();

        if (response.ok) {
            hideFeeLoader();
            alert('Category updated successfully');

            // Update the local feeCategoryData object
            feeCategoryData[categoryId] = {
                category_id: categoryId,
                category_name: categoryName,
                description: categoryDescription,
            };

            // Refresh the fee categories to update the UI
            refreshFeeCategories();

            // Close the popup
            closeEditFeeStructurePopup();
        } else {
            hideFeeLoader();
            alert(`Error: ${result.error || 'Failed to update category'}`);
        }
    } catch (error) {
        hideFeeLoader();
        console.error('Error making PUT request:', error);
        alert('Error: Failed to update category');
    }
}

// Function to confirm and delete a fee category
function confirmDeleteFeeCategory(categoryId, categoryName) {
    // Show SweetAlert confirmation dialog
    Swal.fire({
        title: 'Are you sure?',
        html: `You won't be able to revert this! Deleting category '<strong>${categoryName}</strong>'.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Show the loader when deletion is confirmed
            showFeeLoader();

            // Perform the DELETE request to delete the fee category
            fetch(`/deleteFeeCategory/${categoryId}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (!response.ok) {
                        hideFeeLoader();
                        return response.json().then(errorData => {
                            throw new Error(errorData.error);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    hideFeeLoader();
                    console.log('Success:', data);

                    // Show SweetAlert notification with category name
                    Swal.fire({
                        title: 'Deleted!',
                        html: `Category '<strong>${categoryName}</strong>' deleted successfully!`,
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });

                    // Fetch and update the fee categories table
                    fetchFeeCategories();
                })
                .catch(error => {
                    hideFeeLoader();
                    console.error('Error:', error);
                    let errorMessage = `${error.message}`;

                    // Show SweetAlert notification with error message
                    Swal.fire({
                        title: 'Error',
                        html: errorMessage,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        }
    });
}
