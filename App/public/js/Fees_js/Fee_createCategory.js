document.addEventListener('DOMContentLoaded', function () {
    // Get the form element
    const createCategoryForm = document.querySelector('#createCategoryForm');

    // Handle form submission
    createCategoryForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form data
        const categoryName = document.getElementById('categoryName').value;
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
                return response.json().then(errorData => {
                    throw new Error(errorData.error);
                });
            }
            return response.json();
        })
        .then(data => {
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

// Function to fetch fee categories from the server
function fetchFeeCategories() {
    fetch('/getFeeCategories')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('feeCategoriesTableBody');
            tableBody.innerHTML = ''; // Clear existing rows

            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No Data Found</td></tr>';
            } else {
                data.forEach(category => {
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
        })
        .catch(error => {
            console.error('Error fetching fee categories:', error);
        });
}

// Function to delete a fee category
function deleteFeeCategory(categoryId, categoryName) {
    fetch(`/deleteFeeCategory/${categoryId}`, {
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

// Function to confirm deletion of a fee category
function confirmDeleteFeeCategory(categoryId, categoryName) {
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
            deleteFeeCategory(categoryId, categoryName);
        }
    });
}