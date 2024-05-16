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


// Function to update a book 
function updateBook(title) {
    fetch(`/inventory/books/${encodeURIComponent(title)}/quantity`) // Assuming you have modified the endpoint to retrieve both ordered_quantity and remaining_quantity
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to retrieve quantity.');
            }
            return response.json();
        })
        .then(data => {
            let existingOrderedQuantity = data.ordered_quantity;
            let remainingQuantity = data.remaining_quantity;
            let newOrderedQuantity = 0;

            // Create custom prompt
            const customPrompt = document.createElement('div');
            customPrompt.classList.add('custom-prompt');
            const updatePromptContent = () => {
                customPrompt.innerHTML = `
                    <div class="prompt-content">
                        <h2>Update ${title}</h2>
                        <p>Previously Ordered : ${existingOrderedQuantity}</p>
                        <p>Remaining Quantity : ${remainingQuantity}</p>
                        <p>Enter the new order quantity:</p>
                        <input type="number" id="newQuantityInput" min="0">
                        <p id="totalOrder">Total Order : ${existingOrderedQuantity}</p>
                        <p id="newRemainingQuantity">New Remaining Quantity : ${remainingQuantity}</p>
                        <button id="confirmButton">Confirm</button>
                        <button id="cancelButton">Cancel</button>
                    </div>
                `;
            };
            updatePromptContent();
            document.body.appendChild(customPrompt);

            // Add event listener to confirm button
            const confirmButton = customPrompt.querySelector('#confirmButton');
            confirmButton.addEventListener('click', () => {
                // Get the new ordered quantity from the input field
                newOrderedQuantity = parseInt(customPrompt.querySelector('#newQuantityInput').value, 10) || 0;

                // Calculate total order amount and new remaining quantity
                const totalOrder = existingOrderedQuantity + newOrderedQuantity;
                const newRemainingQuantity = remainingQuantity + newOrderedQuantity;

                // Update the ordered quantity on the server
                updateOrderedQuantity(title, totalOrder, newRemainingQuantity);
                
                // Remove the prompt
                customPrompt.remove();
            });

            // Add event listener to input field for updating total order
            const newQuantityInput = customPrompt.querySelector('#newQuantityInput');
            newQuantityInput.addEventListener('input', () => {
                newOrderedQuantity = parseInt(newQuantityInput.value, 10) || 0; // Ensure zero if input is not a number
                const totalOrder = existingOrderedQuantity + newOrderedQuantity;
                const totalOrderElement = customPrompt.querySelector('#totalOrder');
                totalOrderElement.textContent = `Total Order : ${totalOrder}`;
                
                // Calculate new remaining quantity and display it
                const newRemainingQuantity = remainingQuantity + newOrderedQuantity;
                const newRemainingQuantityElement = customPrompt.querySelector('#newRemainingQuantity');
                newRemainingQuantityElement.textContent = `New Remaining Quantity : ${newRemainingQuantity}`;
            });

            // Add event listener to cancel button
            const cancelButton = customPrompt.querySelector('#cancelButton');
            cancelButton.addEventListener('click', () => {
                // Remove the prompt
                customPrompt.remove();
            });
        })
        .catch(error => {
            console.error('Error retrieving quantity:', error);
            // Handle error if needed
        });
}


// Function to update ordered quantity on the server
function updateOrderedQuantity(title, totalOrder, newRemainingQuantity) {
    fetch(`/inventory/books/${encodeURIComponent(title)}/quantity`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ total_order: totalOrder, remaining_quantity: newRemainingQuantity })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update quantity.');
        }
        console.log('Quantity updated successfully.');
        refreshbooksData();

        // You can perform further actions here, like refreshing the page or updating the UI
    })
    .catch(error => {
        console.error('Error updating quantity:', error);
        // Handle error if needed
    });
}



// Call refreshData initially to fetch and display book data when the page is loaded
refreshbooksData();
