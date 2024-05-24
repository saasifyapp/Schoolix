////Loading Animation
function showBooksLoadingAnimation() {
    console.log("show")
    document.getElementById('loadingOverlaybooks').style.display = 'flex';
}

function hideBooksLoadingAnimation() {
    console.log("hide")
    document.getElementById('loadingOverlaybooks').style.display = 'none';
}
document.addEventListener("DOMContentLoaded", function () {
    // Get the form element
    const booksform = document.getElementById('addBooksForm');

    // Check if the form exists
    if (booksform) {
        // Add submit event listener to the form
        booksform.addEventListener('submit', function (event) {
            showBooksLoadingAnimation();
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
                        return response.text().then(text => {
                            throw new Error(text);
                        });
                    }
                    hideBooksLoadingAnimation();
                    // Clear input fields after successful submission
                    booksform.reset();
                })
                .then(data => {
                    hideBooksLoadingAnimation();
                    console.log('Book added successfully');
                    showToast(`${jsonData.title} added successfully`);
                    refreshbooksData();
                    refreshData();
                    populateBooksVendorDropdown()
                    // You can update the UI or do something else here after successful submission
                })
                .catch(error => {
                    hideBooksLoadingAnimation();
                    refreshbooksData();
                    refreshData();
                    if (error.message === 'Book title already exists') {
                        showToast(`${jsonData.title} is already added`, 'red');
                    } else {
                        showToast('Book added failed', 'red');
                    }
                    console.error('Error:', error);
                    // Handle errors here, like displaying an error message to the user
                });
        });
    }
});




// Function to populate vendor dropdowns
function populateBooksVendorDropdown() {
    // Fetch vendors from the server
    fetch('/inventory/books_vendor')
        .then(response => response.json())
        .then(data => {
            // Dropdowns to be populated
            const bookvendorDropdowns = [
                document.getElementById('bookvendor'),        // For add book
                //document.getElementById('editVendor')    // For edit uniform
            ];

            // Populate each dropdown
            bookvendorDropdowns.forEach(dropdown => {
                if (dropdown) {
                    dropdown.innerHTML = ''; // Clear existing options

                    // Create and append the default option
                    const defaultOption = document.createElement('option');
                    defaultOption.textContent = 'Select Vendor';
                    defaultOption.value = '';
                    defaultOption.selected = true;
                    defaultOption.disabled = true;
                    dropdown.appendChild(defaultOption);

                    // Append options fetched from the server
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
    populateBooksVendorDropdown();
});


// Refresh data function for fetching and displaying books
function refreshbooksData() {
    showBooksLoadingAnimation();
    document.getElementById('bookssearchField').value = '';
    fetch('/inventory/books')
        .then(response => response.json())
        .then(data => displayBooks(data))
        .catch(error => {
            console.error('Error:', error);
            // Handle error if needed
            hideBooksLoadingAnimation();
        });

}

// Function to display book data
function displayBooks(data) {
    const bookTableBody = document.getElementById('booksTableBody');
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
                <td>${book.returned_quantity}</td>
                <td>
                <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                <button style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                        margin-bottom: 10px;" /* Added margin bottom for spacing */
                onclick="updateBook('${book.title}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/add_book.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Restock</span>
        </button>
        <button style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                        margin-bottom: 10px;" /* Added margin bottom for spacing */
                onclick="returnBook('${book.title}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/return_book.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Return</span>
        </button>
        <button style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                        margin-bottom: 10px;" /* Added margin bottom for spacing */
                onclick="deleteBook('${book.title}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/delete_vendor.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Delete</span>
        </button>
       </div> 
        
                </td>
            `;
            bookTableBody.appendChild(row);
        });
        hideBooksLoadingAnimation();
    } catch (error) {
        console.error('Error displaying books:', error);
        // Handle error if needed
        hideBooksLoadingAnimation();
    }
}

// Function to delete a book
function deleteBook(title) {
    const confirmation = confirm(`Are you sure you want to delete the book "${title}"?`);
    if (confirmation) {
        showBooksLoadingAnimation();
        fetch(`/inventory/books/${encodeURIComponent(title)}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete book.');
                }
                hideBooksLoadingAnimation();
            })
            .then(data => {
                hideBooksLoadingAnimation();
                showToast(`${title} deleted successfully`); // Show success toast
                refreshbooksData(); // Refresh data after deleting the book
                refreshData();
                populateBooksVendorDropdown();
            })
            .catch(error => {
                hideBooksLoadingAnimation();
                console.error('Error deleting book:', error);
                showToast(` An error occured while deleting ${title}`, true); // Show error toast
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
            let class_of_title = data.class_of_title;
            let newOrderedQuantity = 0;

            // Create custom prompt
            const customPrompt = document.createElement('div');
            customPrompt.classList.add('custom-prompt');
            const updatePromptContent = () => {
                customPrompt.innerHTML = `
                    <div class="prompt-content">
                        <h2>${title} (${class_of_title})</h2>
                        <p>Previously Ordered : ${existingOrderedQuantity}</p>
                        <p>Remaining Quantity : ${remainingQuantity}</p>
                        <p>Enter the new order quantity:</p>
                        <input type="number" id="newQuantityInput" min="0">
                        <p id="totalOrder">Total Order : ${existingOrderedQuantity}</p>
                        <p id="newRemainingQuantity">New Remaining Quantity : ${remainingQuantity}</p>
                        <button id="confirmButton" style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: inline-flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s;
                        margin-bottom: 10px;"                           
                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/conform.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Confirm</span>
                        </button>

                        <button id="cancelButton" style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: inline-flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s;
                        margin-bottom: 10px;"                           
                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/cancel.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Cancel</span>
                        </button>                      
                    
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
                updateBookOrderedQuantity(title, totalOrder, newRemainingQuantity);

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
function updateBookOrderedQuantity(title, totalOrder, newRemainingQuantity) {
showBooksLoadingAnimation();
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
            hideBooksLoadingAnimation();
            console.log('Quantity updated successfully.');
            showToast(`${title} restocked successfully`); // Show success toast
            refreshbooksData();
            refreshData();
            populateBooksVendorDropdown()

            // You can perform further actions here, like refreshing the page or updating the UI
        })
        .catch(error => {
            hideBooksLoadingAnimation();
            console.error('Error updating quantity:', error);
            showToast(`Failed to update ${title}`,'red'); 
            // Handle error if needed
        });
}

// Function to return a book
function returnBook(title) {
    let newRemainingQuantity; // Declare newRemainingQuantity here

    fetch(`/inventory/books/${encodeURIComponent(title)}/quantity`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to retrieve quantity.');
            }
            return response.json();
        })
        .then(data => {
            let remainingQuantity = data.remaining_quantity;
            let class_of_title = data.class_of_title;
            let returnedQuantity = data.returned_quantity;

            newRemainingQuantity = remainingQuantity; // Initialize newRemainingQuantity here

            // Create custom prompt
            const customPrompt = document.createElement('div');
            customPrompt.classList.add('custom-prompt');
            const returnPromptContent = () => {
                customPrompt.innerHTML = `
                    <div class="prompt-content">
                        <h2>${title} (${class_of_title})</h2>
                        <p>Remaining Quantity : ${remainingQuantity}</p>
                        <p>Enter the return quantity:</p>
                        <input type="number" id="returnQuantityInput" min="0">
                        <p id="newRemainingQuantity">New Remaining Quantity : ${newRemainingQuantity}</p>
                        <button id="confirmButton" style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: inline-flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s;
                            margin-bottom: 10px;"                           
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                <img src="../images/conform.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                <span style="margin-right: 10px;">Confirm</span>
                            </button>

                            <button id="cancelButton" style="background-color: transparent;
                            border: none;
                            color: black; /* Change text color to black */
                            padding: 0;
                            text-align: center;
                            text-decoration: none;
                            display: inline-flex; /* Use flex for centering */
                            align-items: center; /* Center vertically */
                            justify-content: center; /* Center horizontally */
                            font-size: 14px;
                            cursor: pointer;
                            max-height: 100%;
                            border-radius: 20px; /* Round corners */
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                            transition: transform 0.2s, box-shadow 0.2s;
                            margin-bottom: 10px;"                           
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                <img src="../images/cancel.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                <span style="margin-right: 10px;">Cancel</span>
                            </button>                      
                        
                    </div>
                `;
            };
            returnPromptContent();
            document.body.appendChild(customPrompt);

            // Add event listener to confirm button
            const confirmButton = customPrompt.querySelector('#confirmButton');
            confirmButton.addEventListener('click', () => {
                // Get the return quantity from the input field
                let userReturnedQuantity = parseInt(customPrompt.querySelector('#returnQuantityInput').value, 10) || 0;

                // Add the user entered value to the old returned quantity
                returnedQuantity += userReturnedQuantity;

                // Calculate new remaining quantity
                newRemainingQuantity = remainingQuantity - userReturnedQuantity;

                // Update the remaining quantity and returned quantity on the server
                returnBookQuantity(title, returnedQuantity, newRemainingQuantity);

                // Remove the prompt
                customPrompt.remove();
            });

            // Add event listener to input field for updating remaining quantity
            const returnQuantityInput = customPrompt.querySelector('#returnQuantityInput');
            returnQuantityInput.addEventListener('input', () => {
                let userReturnedQuantity = parseInt(returnQuantityInput.value, 10) || 0; // Ensure zero if input is not a number

                // Calculate new remaining quantity and display it
                newRemainingQuantity = remainingQuantity - userReturnedQuantity;
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
function returnBookQuantity(title, returnedQuantity, newRemainingQuantity) {
    showBooksLoadingAnimation();
    fetch(`/inventory/return_books/${encodeURIComponent(title)}/quantity`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title, remainingQuantity: newRemainingQuantity, returnedQuantity: returnedQuantity })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update quantity.');
            }
            hideBooksLoadingAnimation();
            console.log('Quantity updated successfully.');
            showToast(`${title} returned successfully`); // Show success toast
            refreshbooksData();
            populateBooksVendorDropdown()

            // You can perform further actions here, like refreshing the page or updating the UI
        })
        .catch(error => {
            console.error('Error updating quantity:', error);
            // Handle error if needed
            hideBooksLoadingAnimation();
        });
}

function searchBookDetails() {
    // showBooksLoadingAnimation(); 

    const searchTerm = document.getElementById('bookssearchField').value.trim();

    // Check if the search term is empty
    
    if (!searchTerm) {
        if (bookssearchField !== document.activeElement) {
            showToast('Please enter a search term.', true);
        }
        refreshbooksData();
        return;
    }

    // Fetch data from the server based on the search term
    fetch(`/inventory/books/search?search=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            const booksTableBody = document.getElementById('booksTableBody');
            booksTableBody.innerHTML = ''; // Clear previous data

            if (data.length === 0) {
                // If no results found, display a message
                const noResultsRow = document.createElement('tr');
                noResultsRow.innerHTML = '<td colspan="9">No results found</td>';
                booksTableBody.appendChild(noResultsRow);
            } else {
                // Append book data to the table
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
                        <td>${book.returned_quantity}</td>
                        <td style="text-align: center;">
                        <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                        <button style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                        margin-bottom: 10px;" /* Added margin bottom for spacing */
                onclick="updateBook('${book.title}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/add_book.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Restock</span>
        </button>
        <button style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                        margin-bottom: 10px;" /* Added margin bottom for spacing */
                onclick="returnBook('${book.title}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/return_book.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Return</span>
        </button>
        <button style="background-color: transparent;
                        border: none;
                        color: black; /* Change text color to black */
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: flex; /* Use flex for centering */
                        align-items: center; /* Center vertically */
                        justify-content: center; /* Center horizontally */
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px; /* Round corners */
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow */
                        transition: transform 0.2s, box-shadow 0.2s; /* Transition for transform and box-shadow */
                        margin-bottom: 10px;" /* Added margin bottom for spacing */
                onclick="deleteBook('${book.title}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/delete_vendor.png" alt="Update" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Delete</span>
        </button>
        </div>
        
                        </td>
                    `;
                    booksTableBody.appendChild(row);
                });
            }
            // addFadeUpAnimation();
            // hideBooksLoadingAnimation(); 
        })
        .catch(error => {
            console.error('Error:', error);
            // hideBooksLoadingAnimation(); 
        });
}

// Call refreshData initially to fetch and display book data when the page is loaded
refreshbooksData();
