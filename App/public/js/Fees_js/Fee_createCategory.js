document.addEventListener('DOMContentLoaded', function () {
    // Get the form element
    const createCategoryForm = document.querySelector('#create_category_form form');

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
});