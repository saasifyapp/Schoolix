document.addEventListener("DOMContentLoaded", function () {
    // Get the form element
    const uniformForm = document.getElementById('addUniformForm');
    uniformForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });
        fetch('/inventory/purchase/add_uniforms', {
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
                // Clear input fields after successful submission
                uniformForm.reset();
            })
            .then(data => {
                console.log('Uniform added successfully');
                showToast(`${jsonData.uniform_item} of size ${jsonData.size_of_item} added successfully`);
                refreshUniformsData();
                refreshData();
                // populateUniformsVendorDropdown() // Uncomment this if you have a function to populate uniform vendor dropdown
                // You can update the UI or do something else here after successful submission
            })
            .catch(error => {
                refreshUniformsData();
                refreshData();
                if (error.message === 'Uniform item with this size already exists') {
                    showToast(`${jsonData.uniform_item} of size ${jsonData.size_of_item} is already added`, 'red');
                } else {
                    showToast('Uniform added failed', 'red');
                }
                console.error('Error:', error);
                // Handle errors here, like displaying an error message to the user
            });
    });
}); 
// Function to populate vendor dropdowns
function populateUniformVendorDropdown() {
    // Fetch vendors from the server
    fetch('/inventory/uniform_vendor')
        .then(response => response.json())
        .then(data => {
            // Dropdowns to be populated
            const vendorDropdowns = [
                document.getElementById('univendor'),    // For add uniform
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
    populateUniformVendorDropdown();
});

// Function to refresh and display uniform data
function refreshUniformsData() {
    document.getElementById('uniformsearchField').value = '';
    fetch('/inventory/uniforms')
        .then(response => response.json())
        .then(data => displayUniforms(data))
        .catch(error => {
            console.error('Error fetching uniforms:', error);
        });
}

// Function to display uniforms in the table
function displayUniforms(data) {
    const uniformTableBody = document.getElementById('uniformTable');
    uniformTableBody.innerHTML = ''; // Clear existing rows
    data.forEach(uniform => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${uniform.uniform_item}</td>
            <td>${uniform.size_of_item}</td>
            <td>${uniform.purchase_price}</td>
            <td>${uniform.selling_price}</td>
            <td>${uniform.vendor}</td>
            <td>${uniform.ordered_quantity}</td>
            <td>${uniform.remaining_quantity}</td>
            <td>${uniform.returned_quantity}</td>
            <td>
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
        onclick="updateUniformItem('${uniform.uniform_item}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    <img src="/images/add_uniform.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
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
        onclick="returnUniform('${uniform.uniform_item}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    <img src="/images/return_book.png" alt="Return" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
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
        onclick="deleteUniform('${uniform.uniform_item}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    <img src="/images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
    <span style="margin-right: 10px;">Delete</span>
</button>


            </td>
        `;
        uniformTableBody.appendChild(row);
    });
}

// Function to handle deleting a uniform
function deleteUniform(uniformItem) {
    const confirmation = confirm(`Are you sure you want to delete the book "${uniformItem}"?`);
    if (confirmation) {
        fetch(`/inventory/uniforms/${encodeURIComponent(uniformItem)}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete uniform.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Uniform deleted successfully');
                refreshUniformsData(); // Refresh uniform data
                refreshData();
                populateUniformVendorDropdown()
            })
            .catch(error => {
                console.error('Error deleting uniform:', error);
            });
    }
}


// Function to update a uniform item
function updateUniformItem(uniformItem) {
    fetch(`/inventory/uniforms/${encodeURIComponent(uniformItem)}/quantity`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to retrieve quantity.');
            }
            return response.json();
        })
        .then(data => {
            let existingOrderedQuantity = data.ordered_quantity; // changed from data.ordered_quantity
            let remainingQuantity = data.remaining_quantity;
            let size_of_item = data.size_of_item;
            let newOrderedQuantity = 0;

            // Create custom prompt
            const customPrompt = document.createElement('div');
            customPrompt.classList.add('custom-prompt');
            const updatePromptContent = () => {
                customPrompt.innerHTML = `
                    <div class="prompt-content">
                        <h2>${uniformItem} (${size_of_item})</h2>
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
                updateUniformOrderedQuantity(uniformItem, totalOrder, newRemainingQuantity);

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
function updateUniformOrderedQuantity(uniformItem, totalOrder, newRemainingQuantity) {
    fetch(`/inventory/uniforms/${encodeURIComponent(uniformItem)}/quantity`, {
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
            refreshUniformsData();
            refreshData();
            console.log('Quantity updated successfully.');
            populateUniformVendorDropdown();
            // refreshUniformData(); Uncomment this if you have a function to refresh the uniform data

            // You can perform further actions here, like refreshing the page or updating the UI
        })
        .catch(error => {
            console.error('Error updating quantity:', error);
            // Handle error if needed
        });
}


// Function to return a uniform
function returnUniform(uniformItem) {
    let newRemainingQuantity; // Declare newRemainingQuantity here

    fetch(`/inventory/uniforms/${encodeURIComponent(uniformItem)}/quantity`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to retrieve quantity.');
            }
            return response.json();
        })
        .then(data => {
            let remainingQuantity = data.remaining_quantity;
            let size_of_item = data.size_of_item;
            let returnedQuantity = data.returned_quantity; // Get old returned quantity

            newRemainingQuantity = remainingQuantity; // Initialize newRemainingQuantity here

            // Create custom prompt
            const customPrompt = document.createElement('div');
            customPrompt.classList.add('custom-prompt');
            const returnPromptContent = () => {
                customPrompt.innerHTML = `
                    <div class="prompt-content">
                        <h2>${uniformItem} (${size_of_item})</h2>
                        <p>Remaining Quantity : ${remainingQuantity}</p>
                        <p>Enter the return quantity:</p>
                        <input type="number" id="returnQuantityInput" min="0">
                        <p id="newRemainingQuantity">New Remaining Quantity : ${newRemainingQuantity}</p>
                        <button id="confirmButton">Confirm</button>
                        <button id="cancelButton">Cancel</button>
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
                returnUniformQuantity(uniformItem, returnedQuantity, newRemainingQuantity);

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
function returnUniformQuantity(uniformItem, returnedQuantity, newRemainingQuantity) {
    console.log(uniformItem, returnedQuantity, newRemainingQuantity)

    fetch(`/inventory/return_uniform/${encodeURIComponent(uniformItem)}/quantity`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uniform_item: uniformItem, remainingQuantity: newRemainingQuantity, returnedQuantity: returnedQuantity })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update quantity.');
            }
            console.log('Quantity updated successfully.');
            refreshUniformsData();
            populateBooksVendorDropdown()

            // You can perform further actions here, like refreshing the page or updating the UI
        })
        .catch(error => {
            console.error('Error updating quantity:', error);
            // Handle error if needed
        });
}


/* Function to open the Edit Uniform Overlay
function openEditUniformOverlay() {
    document.getElementById('editUniformOverlay').style.display = 'flex';
}

// Function to close the Edit Uniform Overlay
function closeEditUniformOverlay() {
    document.getElementById('editUniformOverlay').style.display = 'none';
}


// Function to handle edit uniform (similar to edit book function)
function editUniform(uniformItem) {
    fetch(`/inventory/uniforms/${encodeURIComponent(uniformItem)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch uniform details.');
            }
            return response.json();
        })
        .then(uniform => {
            document.getElementById('editUniformItem').value = uniform.uniform_item;
            document.getElementById('editSizeOfItem').value = uniform.size_of_item;
            document.getElementById('editPurchasePrice').value = uniform.purchase_price;
            document.getElementById('editSellingPrice').value = uniform.selling_price;
            document.getElementById('editVendor').value = uniform.vendor;
            document.getElementById('editOrderedQuantity').value = uniform.ordered_quantity;
            document.getElementById('editRemainingQuantity').value = uniform.remaining_quantity;

            document.getElementById('editUniformOverlay').style.display = 'flex';
            openEditUniformOverlay();
        })
        .catch(error => {
            console.error('Error fetching uniform details:', error);
        });
}

// Function to handle submit of edit uniform form
function submitEditUniformForm() {
    const form = document.getElementById('editUniformForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });

        fetch('/inventory/uniforms/edit', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update uniform.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Uniform updated successfully');
                document.getElementById('editUniformOverlay').style.display = 'none';
                refreshUniformsData(); // Refresh uniform data
            })
            .catch(error => {
                console.error('Error updating uniform:', error);
            });
    });
}
*/
function searchUniformDetails() {
    // showLoadingAnimation(); 

    const searchTerm = document.getElementById('uniformsearchField').value.trim();

    // Check if the search term is empty
    if (searchTerm === '') {
        showToast('Please enter a search term.', true); // Show error toast
        refreshUniformData(); // Refresh data to show all uniform items
        // hideLoadingAnimation();
        return;
    }

    // Fetch data from the server based on the search term
    fetch(`/inventory/uniforms/search?search=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            const uniformTableBody = document.getElementById('uniformTable');
            uniformTableBody.innerHTML = ''; // Clear previous data

            if (data.length === 0) {
                // If no results found, display a message
                const noResultsRow = document.createElement('tr');
                noResultsRow.innerHTML = '<td colspan="9">No results found</td>';
                uniformTableBody.appendChild(noResultsRow);
            } else {
                // Append uniform data to the table
                data.forEach(uniform => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${uniform.uniform_item}</td>
                        <td>${uniform.size_of_item}</td>
                        <td>${uniform.purchase_price}</td>
                        <td>${uniform.selling_price}</td>
                        <td>${uniform.vendor}</td>
                        <td>${uniform.ordered_quantity}</td>
                        <td>${uniform.remaining_quantity}</td>
                        <td>${uniform.returned_quantity}</td>
                        <td style="text-align: center;">
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
                onclick="updateUniformItem('${uniform.uniform_item}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/add_uniform.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
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
                onclick="returnUniform('${uniform.uniform_item}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/return_book.png" alt="Return" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
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
                onclick="deleteUniform('${uniform.uniform_item}')"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="/images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Delete</span>
        </button>
                        </td>
                    `;
                    uniformTableBody.appendChild(row);
                });
            }
            // addFadeUpAnimation();
            // hideLoadingAnimation(); 
        })
        .catch(error => {
            console.error('Error:', error);
            // hideLoadingAnimation(); 
        });
}

refreshUniformsData();