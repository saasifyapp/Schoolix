document.addEventListener("DOMContentLoaded", function () {
    // Get the form element
    const booksform = document.getElementById('addBooksForm');

    // Check if the form exists
    if (booksform) {
        // Add submit event listener to the form
        booksform.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent the default form submission

            // Get the form data using FormData
            const formData = new FormData(booksform);

            // Convert FormData to JSON
            const jsonData = {};
            formData.forEach((value, key) => {
                // Adjust keys to match server-side expectations
                switch (key) {
                    case 'bookTitle':
                        jsonData['title'] = value;
                        break;
                    case 'bookClass':
                        jsonData['class_of_title'] = value;
                        break;
                    case 'purchasePrice':
                        jsonData['purchase_price'] = value;
                        break;
                    case 'sellingPrice':
                        jsonData['selling_price'] = value;
                        break;
                    case 'orderedQuantity':
                        jsonData['ordered_quantity'] = value;
                        break;
                    case 'remainingQuantity':
                        jsonData['remaining_quantity'] = value;
                        break;
                    // Add cases for other keys as needed
                    default:
                        jsonData[key] = value;
                }
            });

            // Make a POST request to the endpoint
            fetch('/inventory/purchase/add_books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    // Clear input fields after successful submission
                    booksform.reset();
                })
                .then(data => {
                    console.log('Book added successfully');
                    showToast('Book added successfully');
                    refreshbooksData();
                    // You can update the UI or do something else here after successful submission
                })
                .catch(error => {
                    refreshbooksData();
                    showToast('Book added failed');
                    console.error('Error adding book:', error);
                    // Handle errors here, like displaying an error message to the user
                });
        });
    }
});




// Function to populate vendor dropdowns
function populateVendorDropdown() {
    // Fetch vendors from the server
    fetch('/inventory/vendors')
        .then(response => response.json())
        .then(data => {
            // Dropdowns to be populated
            const vendorDropdowns = [
                document.getElementById('vendor'),        // For add book
                document.getElementById('univendor'),    // For add uniform
                document.getElementById('editVendor')    // For edit uniform
            ];
            
            // Populate each dropdown
            vendorDropdowns.forEach(dropdown => {
                if (dropdown) {
                    dropdown.innerHTML = ''; // Clear existing options
                    data.forEach(vendor => {
                        const option = document.createElement('option');
                        option.textContent = vendor.vendor_name;
                        dropdown.appendChild(option);
                    });
                }
            });
        })
        .catch(error => {
            console.error('Error fetching vendors:', error);
        });
}


// Call populateVendorDropdown when the page initially loads
document.addEventListener("DOMContentLoaded", function () {
    populateVendorDropdown();
});


// Refresh data function for fetching and displaying books
function refreshbooksData() {
    fetch('/inventory/books')
        .then(response => response.json())
        .then(data => displayBooks(data))
        .catch(error => {
            console.error('Error:', error);
            // Handle error if needed
        });
}

// Function to display book data
function displayBooks(data) {
    const bookTableBody = document.getElementById('booksTable');
    bookTableBody.innerHTML = ''; 

    try {
        data.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.title}</td>
                <td>${book.class_of_title}</td>
                <td>${book.purchase_price}</td>
                <td>${book.selling_price}</td>
                <td>${book.vendor}</td>
                <td>${book.ordered_quantity}</td>
                <td>${book.remaining_quantity}</td>
                <td>
                    <button onclick="updateBook('${book.title}')">Update</button>
                    <button onclick="deleteBook('${book.title}')">Delete</button>
                </td>
            `;
            bookTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error displaying books:', error);
        // Handle error if needed
    }
}

// Function to delete a book
function deleteBook(title) {
    const confirmation = confirm(`Are you sure you want to delete the book "${title}"?`);
    if (confirmation) {
        fetch(`/inventory/books/${encodeURIComponent(title)}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete book.');
                }
            })
            .then(data => {
                showToast('Book deleted successfully.', false); // Show success toast
                refreshbooksData(); // Refresh data after deleting the book
            })
            .catch(error => {
                console.error('Error deleting book:', error);
                showToast('An error occurred while deleting the book.', true); // Show error toast
            });
    }
}

// Function to update ordered quantity of a book with custom prompt
function updateBook(title) {
    // Create custom prompt
    const customPrompt = document.createElement('div');
    customPrompt.classList.add('custom-prompt');
    customPrompt.innerHTML = `
        <div class="prompt-content">
            <label for="newQuantityInput">Enter the new ordered quantity:</label>
            <input type="number" id="newQuantityInput" min="0">
            <button id="confirmButton">Confirm</button>
            <button id="cancelButton">Cancel</button>
        </div>
    `;
    document.body.appendChild(customPrompt);

    // Get input elements
    const newQuantityInput = document.getElementById('newQuantityInput');
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');

    // Event listeners for buttons
    confirmButton.addEventListener('click', () => {
        const newQuantity = newQuantityInput.value.trim();
        if (newQuantity !== '') {
            // Perform update
            fetch(`/inventory/books/${encodeURIComponent(title)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderedQuantity: newQuantity })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update ordered quantity.');
                    }
                })
                .then(data => {
                    showToast('Ordered quantity updated successfully.', false); // Show success toast
                    refreshbooksData(); // Refresh data after updating the book
                    customPrompt.remove(); // Remove custom prompt
                })
                .catch(error => {
                    console.error('Error updating ordered quantity:', error);
                    showToast('An error occurred while updating ordered quantity.', true); // Show error toast
                    customPrompt.remove(); // Remove custom prompt
                });
        } else {
            alert('Please enter a valid quantity.');
        }
    });

    cancelButton.addEventListener('click', () => {
        customPrompt.remove(); // Remove custom prompt
    });
}



// Call refreshData initially to fetch and display book data when the page is loaded
refreshbooksData();
