// Function to handle Add Uniform form submission
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
                    throw new Error('Failed to add uniform.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Uniform added successfully');
                uniformForm.reset();
                refreshUniformsData();
                refreshData();
                // Optionally, refresh data or update UI
            })
            .catch(error => {
                refreshUniformsData();
                refreshData();
                console.error('Error adding uniform:', error);
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
            <td>
                <button onclick="updateUniformItem('${uniform.uniform_item}')">Edit</button>
                <button onclick="deleteUniform('${uniform.uniform_item}')">Delete</button>
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

refreshUniformsData();