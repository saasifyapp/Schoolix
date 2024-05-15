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
                    refreshbooksData();
                    // You can update the UI or do something else here after successful submission
                })
                .catch(error => {
                    refreshbooksData();
                    console.error('Error adding book:', error);
                    // Handle errors here, like displaying an error message to the user
                });
        });
    }
});




// JavaScript for populating vendor dropdown
document.addEventListener("DOMContentLoaded", function () {
    // Fetch vendors from the server
    fetch('/inventory/vendors')
        .then(response => response.json())
        .then(data => {
            // Populate the vendor dropdown with fetched data
            const vendorDropdown = document.getElementById('vendor');
            data.forEach(vendor => {
                const option = document.createElement('option');
                option.textContent = vendor.vendor_name; // Assuming vendor_name is the display value
                vendorDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching vendors:', error);
            // Optionally, you can display an error message to the user
        });
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
    // bookTableBody.innerHTML = ''; 

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

// Call refreshData initially to fetch and display book data when the page is loaded
refreshbooksData();
