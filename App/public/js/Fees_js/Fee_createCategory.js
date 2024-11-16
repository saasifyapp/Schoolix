// Get the form element
const createCategoryForm = document.querySelector('#createCategoryForm');

// Handle form submission
createCategoryForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission
    showFeeLoader();

    // Get form data
    const categoryName = capitalizeName(formatInput(document.getElementById('categoryName').value));
    const categoryDescription = document.getElementById('categoryDescription').value;

    // Validate category name and description
    if (!categoryName || !categoryDescription) {
        hideFeeLoader();
        Swal.fire({
            title: 'Error',
            text: 'Both category name and description are required.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

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
                    throw new Error(errorData.error || 'Something went wrong.');
                });
            }
            return response.json();
        })
        .then(data => {
            hideFeeLoader();

            // Clear the form inputs
            document.getElementById('categoryName').value = '';
            document.getElementById('categoryDescription').value = '';

            // Show SweetAlert notification with category name
            Swal.fire({
                title: 'Success!',
                html: `Category '<strong>${categoryName}</strong>' created successfully!`,
                icon: 'success',
                confirmButtonText: 'OK',
                willClose: () => {
                    // Fetch and update the fee categories table after closing the alert
                    refreshFeeCategories();
                }
            });
        })
        .catch(error => {
            hideFeeLoader();
            console.error('Error:', error);

            // Handle different types of error messages
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

    // Filter the feeCategoryData based on the search input
    const filteredCategories = Object.values(feeCategoryData).filter(category => {
        const categoryName = category.category_name.toLowerCase();
        return categoryName.includes(filter); // Check if the category name matches the filter
    });

    // Call displayFeeCategoryData with filtered or all data based on the search input
    if (filter === '') {
        // If search bar is empty, show all entries
        // displayFeeCategoryData(feeCategoryData);
        refreshFeeCategories();
    } else {
        // Show only filtered entries based on search
        const filteredData = {};
        filteredCategories.forEach(category => {
            filteredData[category.category_id] = category;
        });
        displayFeeCategoryData(filteredData);
    }
});

// Add event listener to the refresh button
const refreshButton = document.getElementById('refreshButton');
refreshButton.addEventListener('click', function () {
    refreshFeeCategories();
});

// Fetch and display fee categories when the overlay is opened
// refreshFeeCategories();


/// Local object to store the fetched fee categories
let feeCategoryData = {};

// Function to fetch fee categories from the server
function refreshFeeCategories() {
    showFeeLoader();
    fetch('/getFeeCategories')
        .then(response => response.json())
        .then(data => {
            // Update the feeCategoryData object with the fetched data
            feeCategoryData = {}; // Clear previous data
            data.forEach(category => {
                feeCategoryData[category.category_id] = category;
            });

            hideFeeLoader();
            // Call the display function with the updated feeCategoryData
            displayFeeCategoryData(feeCategoryData);
        })
        .catch(error => {
            hideFeeLoader();
            console.error('Error fetching fee categories:', error);
        });
}

// Function to display fee categories in the table
function displayFeeCategoryData(feeCategoryData) {
    const tableBody = document.getElementById('feeCategoriesTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    const categories = Object.values(feeCategoryData); // Get the categories from the object
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
//     refreshFeeCategories();
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


async function saveFeeStructureDetails() {
    showFeeLoader();

    // Retrieve input values and format them
    const categoryId = document.getElementById('editCategoryId').value;
    const categoryName = capitalizeName(formatInput(document.getElementById('editCategoryName').value.trim()));
    const categoryDescription = document.getElementById('editCategoryDescription').value.trim();

    // Validate the category name input
    if (!categoryName) {
        hideFeeLoader();
        Swal.fire({
            title: 'Error',
            text: 'Category name is required',
            icon: 'error',
            confirmButtonText: 'OK',
        });
        return;
    }

    // Retrieve the original category data
    const originalCategory = feeCategoryData[categoryId];
    let isDuplicateName = false;
    let isDuplicateDescription = false;

    // Check if the category name was changed and if the new name already exists
    if (categoryName !== originalCategory.category_name) {
        isDuplicateName = Object.values(feeCategoryData).some(
            category => category.category_name === categoryName && category.category_id !== categoryId
        );
        if (isDuplicateName) {
            hideFeeLoader();
            Swal.fire({
                title: 'Error',
                text: 'Category name already exists',
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return;
        }
    }

    // Check if the category description was changed and if it already exists
    if (categoryDescription !== originalCategory.description) {
        isDuplicateDescription = Object.values(feeCategoryData).some(
            category => category.description === categoryDescription && category.category_id !== categoryId
        );
        if (isDuplicateDescription) {
            hideFeeLoader();
            Swal.fire({
                title: 'Error',
                text: 'Category description already exists',
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return;
        }
    }

    // Construct the updated category data
    const updatedCategory = {
        category_name: categoryName,
        description: categoryDescription,
    };

    try {
        // Make the PUT request to update the category
        const response = await fetch(`/editFeeCategory/${categoryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCategory),
        });

        const result = await response.json();

        // Handle response status and update UI accordingly
        if (response.ok) {
            hideFeeLoader();
    
            // Refresh the UI and close the popup
            refreshFeeCategories();
            closeEditFeeStructurePopup();

            // Show a success notification
            Swal.fire({
                title: 'Success',
                html: `Category '<strong>${categoryName}</strong>' updated successfully!`,
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: result.error || 'Failed to update category',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    } catch (error) {
        console.error('Error making PUT request:', error);
        Swal.fire({
            title: 'Error',
            text: 'Failed to update category',
            icon: 'error',
            confirmButtonText: 'OK',
        });
    } finally {
        // Ensure the loader is always hidden
        hideFeeLoader();
    }
}



function confirmDeleteFeeCategory(categoryId, categoryName) {
    // Show SweetAlert confirmation dialog
    Swal.fire({
        title: 'Are you sure?',
        html: `You won't be able to revert this! Deleting category '<strong>${categoryName}</strong>'.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
    }).then(result => {
        if (result.isConfirmed) {
            showFeeLoader();

            // Perform the DELETE request to remove the fee category
            fetch(`/deleteFeeCategory/${categoryId}`, { method: 'DELETE' })
                .then(async response => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error);
                    }
                    return response.json();
                })
                .then(data => {
                    hideFeeLoader();
                    console.log('Success:', data);

                    // Show a success notification
                    Swal.fire({
                        title: 'Deleted!',
                        html: `Category '<strong>${categoryName}</strong>' deleted successfully!`,
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });

                    // Refresh the UI to reflect the deletion
                    refreshFeeCategories();
                })
                .catch(error => {
                    hideFeeLoader();
                    console.error('Error:', error);

                    // Show an error notification
                    Swal.fire({
                        title: 'Error',
                        html: error.message,
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                })
                .finally(() => {
                    // Always hide the loader, even if there's an error
                    hideFeeLoader();
                });
        }
    });
}

