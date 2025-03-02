////Loading Animation
function showUniformLoadingAnimation() {
    console.log("show")
    document.getElementById('loadingOverlayuniform').style.display = 'flex';
}

function hideUniformLoadingAnimation() {
    console.log("hide")
    document.getElementById('loadingOverlayuniform').style.display = 'none';
}


/*
function calculateUniformPurchasePrice() {
    const sellingPrice = parseFloat(document.getElementById('uniform_sellingPrice').value);
    const marginPercentage = parseFloat(document.getElementById('uniform_margin').value);

    if (!isNaN(sellingPrice) && !isNaN(marginPercentage) && document.getElementById('uniform_sellingPrice').value !== '' && document.getElementById('uniform_margin').value !== '') {
        const marginAmount = (marginPercentage / 100) * sellingPrice;
        const purchasePrice = sellingPrice - marginAmount;

        document.getElementById('uniform_purchasePrice').value = purchasePrice.toFixed(2);
    } else {
        document.getElementById('uniform_purchasePrice').value = '';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('uniform_sellingPrice').addEventListener('input', calculateUniformPurchasePrice);
    document.getElementById('uniform_margin').addEventListener('input', calculateUniformPurchasePrice);
}); */

document.addEventListener("DOMContentLoaded", function () {

    // Get the form element
    const uniformForm = document.getElementById('addUniformForm');
    const univendorSelect = document.getElementById("univendor");


    uniformForm.addEventListener('submit', async function (event) {
        
        event.preventDefault();
        // Get the uniform item and size from the form
        const uniformItem = document.getElementById('uniformItem').value;
        const sizeOfItem = document.getElementById('sizeOfItem').value;

        // Validate uniform item and size for commas
        if (uniformItem.includes(',') || sizeOfItem.includes(',')) {
            showToast('Uniform name and size should not contain a comma', 'red');
            return;
        }
        showUniformLoadingAnimation();
        const formData = new FormData(event.target);
        const jsonData = {};
        formData.forEach((value, key) => {
            switch (key) {
                case 'uniform_sellingPrice':
                    jsonData['selling_price'] = value;
                    break;
                case 'uniform_purchasePrice':
                    jsonData['purchase_price'] = value;
                    break;
                // Add cases for other keys as needed
                default:
                    jsonData[key] = value;
            }
        });
        await fetch('/inventory/purchase/add_uniforms', {
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
                hideUniformLoadingAnimation();
                // Clear input fields after successful submission
                uniformForm.reset();
                univendorSelect.selectedIndex = 0;
            })
            .then(data => {
                hideUniformLoadingAnimation();
                console.log('Uniform added successfully');
                showToast(`${jsonData.uniform_item} of size ${jsonData.size_of_item} added successfully`);
                refreshData();
                refreshUniformsData();

                // populateUniformsVendorDropdown() // Uncomment this if you have a function to populate uniform vendor dropdown
                // You can update the UI or do something else here after successful submission
            })
            .catch(error => {
                hideUniformLoadingAnimation();
                refreshUniformsData();
                if (error.message === 'Uniform item with this size already exists') {
                    hideUniformLoadingAnimation();
                    showToast(`${jsonData.uniform_item} of size ${jsonData.size_of_item} is already added`, 'red');
                } else {
                    hideUniformLoadingAnimation();
                    showToast('Uniform added failed', 'red');
                }
                console.error('Error:', error);
                // Handle errors here, like displaying an error message to the user
            });
    });
    uniformForm.addEventListener('reset', function () {
        const univendorSelect = document.getElementById("univendor");
        univendorSelect.selectedIndex = 0; // Assuming the placeholder is the first option
    });
});


// Function to populate vendor dropdowns
async function populateUniformVendorDropdown() {
    // Fetch vendors from the server
    await fetch('/inventory/uniform_vendor')
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
    populateUniformVendorDropdown();
});

// Function to refresh and display uniform data
async function refreshUniformsData() {
    showUniformLoadingAnimation();
    document.getElementById('uniformsearchField').value = '';
    await fetch('/inventory/uniforms')
        .then(response => response.json())
        .then(data => displayUniforms(data))
        .catch(error => {
            console.error('Error fetching uniforms:', error);
            hideUniformLoadingAnimation();
        });
}

// Function to display uniforms in the table
function displayUniforms(data) {
    const uniformTableBody = document.getElementById('uniformTableBody');
    uniformTableBody.innerHTML = ''; // Clear existing rows

    try {
        // Reverse the data array
        data.reverse();

        if (data.length === 0) {
            hideUniformLoadingAnimation();
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = '<td colspan="9">No results found</td>';
            uniformTableBody.appendChild(noResultsRow);
        } else {
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
                                onclick="showUniformUpdateModal('${uniform.sr_no}')"
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                <img src="/images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                <span style="margin-right: 10px;">Edit</span>
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
                                onclick="updateUniformItem('${uniform.uniform_item}', '${uniform.size_of_item}')"
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
                                onclick="returnUniform('${uniform.uniform_item}', '${uniform.size_of_item}')"
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
                                onclick="deleteUniform('${uniform.uniform_item}', '${uniform.size_of_item}')"
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                <img src="/images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                <span style="margin-right: 10px;">Delete</span>
                            </button>
                        </div>
                    </td>
                `;
                uniformTableBody.appendChild(row);
            });
        }
        hideUniformLoadingAnimation();
    } catch (error) {
        console.error('Error displaying uniforms:', error);
        hideUniformLoadingAnimation();
    }
}


// Function to handle deleting a uniform
async function deleteUniform(uniformItem, sizeOfItem) {
    const confirmation = confirm(`Are you sure you want to delete the uniform "${uniformItem}" of size "${sizeOfItem}"?`);
    if (confirmation) {
        showUniformLoadingAnimation();
        await fetch(`/inventory/uniforms/${encodeURIComponent(uniformItem)}/${encodeURIComponent(sizeOfItem)}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete uniform.');
                }
                hideUniformLoadingAnimation();
                return response.json();
            })
            .then(data => {
                hideUniformLoadingAnimation();
                console.log('Uniform deleted successfully');
                showToast(`${uniformItem} with size ${sizeOfItem} deleted successfully`); // Show success toast
                refreshUniformsData(); // Refresh uniform data

                populateUniformVendorDropdown()
            })
            .catch(error => {
                hideUniformLoadingAnimation();
                console.error('Error deleting uniform:', error);
                showToast(`Failed to delete ${uniformItem} with size ${sizeOfItem}`, 'red'); // Show success toast

            });
    }
}

// Function to update a uniform item
async function updateUniformItem(uniformItem, sizeOfItem) {
    showUniformLoadingAnimation();
    await fetch(`/inventory/uniforms/${encodeURIComponent(uniformItem)}/${encodeURIComponent(sizeOfItem)}/quantity`)
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
            hideUniformLoadingAnimation();
            // Create custom prompt
            const customPrompt = document.createElement('div');
            customPrompt.classList.add('custom-prompt');
            const updatePromptContent = () => {
                customPrompt.innerHTML = `
                    <div class="prompt-content">
                        <h2>${uniformItem} (${sizeOfItem})</h2>
                        <p>Previously Ordered : ${existingOrderedQuantity}</p>
                        <p>Remaining Quantity : ${remainingQuantity}</p>
                        <p>Enter the new order quantity:</p>                       
                         <div class="form-group">
        <input type="number" class="form-control" id="newQuantityInput" min="0" placeholder=" " required style="width:6rem;">
        <span class="form-control-placeholder">New Order Quantity</span>
    </div>
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
                showUniformLoadingAnimation();
                // Get the new ordered quantity from the input field
                newOrderedQuantity = parseInt(customPrompt.querySelector('#newQuantityInput').value, 10) || 0;

                // Calculate total order amount and new remaining quantity
                const totalOrder = existingOrderedQuantity + newOrderedQuantity;
                const newRemainingQuantity = remainingQuantity + newOrderedQuantity;

                // Update the ordered quantity on the server
                updateUniformOrderedQuantity(uniformItem, sizeOfItem, totalOrder, newRemainingQuantity);

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
            hideUniformLoadingAnimation();
            // Handle error if needed
        });
}

// Function to update ordered quantity on the server
async function updateUniformOrderedQuantity(uniformItem, sizeOfItem, totalOrder, newRemainingQuantity) {
    // showUniformLoadingAnimation();
    await fetch(`/inventory/uniforms/${encodeURIComponent(uniformItem)}/${encodeURIComponent(sizeOfItem)}/quantity`, {
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
            hideUniformLoadingAnimation();
            refreshUniformsData();

            console.log('Quantity updated successfully.');
            showToast(`${uniformItem} with size ${sizeOfItem} restocked successfully`); // Show success toast
            populateUniformVendorDropdown();
            // refreshUniformData(); Uncomment this if you have a function to refresh the uniform data

            // You can perform further actions here, like refreshing the page or updating the UI
        })
        .catch(error => {
            hideUniformLoadingAnimation();
            console.error('Error updating quantity:', error);
            showToast(`Failed to restock ${uniformItem} with size ${sizeOfItem}`, 'red'); // Show success toast
            // Handle error if needed
        });
}


// Function to return a uniform
async function returnUniform(uniformItem, sizeOfItem) {
    showUniformLoadingAnimation();
    let newRemainingQuantity; // Declare newRemainingQuantity here

    await fetch(`/inventory/uniforms/${encodeURIComponent(uniformItem)}/${encodeURIComponent(sizeOfItem)}/quantity`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to retrieve quantity.');
            }
            return response.json();
        })
        .then(data => {
            let remainingQuantity = data.remaining_quantity;
            let returnedQuantity = data.returned_quantity; // Get old returned quantity

            newRemainingQuantity = remainingQuantity; // Initialize newRemainingQuantity here
            hideUniformLoadingAnimation();
            // Create custom prompt
            const customPrompt = document.createElement('div');
            customPrompt.classList.add('custom-prompt');
            customPrompt.classList.add('custom-prompt-return');
            const returnPromptContent = () => {
                customPrompt.innerHTML = `
                    <div class="prompt-content" ">
                        <h2>${uniformItem} (${sizeOfItem})</h2>
                        <p>Remaining Quantity : ${remainingQuantity}</p>
                        <p>Enter the return quantity:</p>                       
                         <div class="form-group">
                        <input type="number" class="form-control wide" id="returnQuantityInput" min="0" placeholder=" " required>
                        <span class="form-control-placeholder">Return Quantity</span>
                        </div>
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
                showUniformLoadingAnimation();
                // Get the return quantity from the input field
                let userReturnedQuantity = parseInt(customPrompt.querySelector('#returnQuantityInput').value, 10) || 0;

                // Add the user entered value to the old returned quantity
                returnedQuantity += userReturnedQuantity;

                // Calculate new remaining quantity
                newRemainingQuantity = remainingQuantity - userReturnedQuantity;

                // Update the remaining quantity and returned quantity on the server
                returnUniformQuantity(uniformItem, sizeOfItem, returnedQuantity, newRemainingQuantity);

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
async function returnUniformQuantity(uniformItem, sizeOfItem, returnedQuantity, newRemainingQuantity) {
    console.log(uniformItem, sizeOfItem, returnedQuantity, newRemainingQuantity)
    // showUniformLoadingAnimation();
    await fetch(`/inventory/return_uniform/${encodeURIComponent(uniformItem)}/${encodeURIComponent(sizeOfItem)}/quantity`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uniform_item: uniformItem, size_of_item: sizeOfItem, remainingQuantity: newRemainingQuantity, returnedQuantity: returnedQuantity })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update quantity.');
            }
            hideUniformLoadingAnimation();
            console.log('Quantity updated successfully.');
            showToast(`${uniformItem} with size ${sizeOfItem} returned successfully`); // Show success toast
            refreshUniformsData();
            populateBooksVendorDropdown()

            // You can perform further actions here, like refreshing the page or updating the UI
        })
        .catch(error => {
            hideUniformLoadingAnimation();
            console.error('Error updating quantity:', error);
            showToast(`Failed to return ${uniformItem} with size ${sizeOfItem}`, 'red'); // Show success toast

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
async function searchUniformDetails() {
    // showLoadingAnimation(); 

    const searchTerm = document.getElementById('uniformsearchField').value.trim();

    // Check if the search term is empty
    if (!searchTerm) {
        if (uniformsearchField !== document.activeElement) {
            showToast('Please enter a search term.', true);
        }
        refreshUniformsData();
        return;
    }

    // Fetch data from the server based on the search term
    await fetch(`/inventory/uniforms/search?search=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            const uniformTableBody = document.getElementById('uniformTableBody');
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
                                onclick="showUniformUpdateModal('${uniform.sr_no}')"
                                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                <img src="/images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                <span style="margin-right: 10px;">Edit</span>
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
        onclick="updateUniformItem('${uniform.uniform_item}', '${uniform.size_of_item}')"
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
        onclick="returnUniform('${uniform.uniform_item}', '${uniform.size_of_item}')"
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
                onclick="deleteUniform('${uniform.uniform_item}', '${uniform.size_of_item}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    <img src="/images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
    <span style="margin-right: 10px;">Delete</span>
</button>
</div>
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


// Function to show modal for updating uniform details
// Function to show modal for updating uniform details
async function showUniformUpdateModal(sr_no) {
    showUniformLoadingAnimation();
    try {
        // Fetch uniform details by sr_no
        const response = await fetch(`/inventory/uniforms/${encodeURIComponent(sr_no)}`);
        if (!response.ok) {
            throw new Error('Failed to retrieve uniform details.');
        }

        const data = await response.json();
        hideUniformLoadingAnimation();
        // Create the custom prompt/modal
        const customPrompt = document.createElement('div');
        customPrompt.classList.add('custom-prompt');

        // Populate the prompt with uniform details
        customPrompt.innerHTML = `
            <div class="prompt-content">
                <h2>Update Uniform Details</h2>
             
               <div class="form-group">
    <input type="text" class="form-control" id="uniformItemInput" value="${data.uniform_item}" required style="width: 6rem; text-align: center;" placeholder=" ">
    <span class="form-control-placeholder">Uniform Item</span>
</div>

             
                <div class="form-group">
    <input type="text" class="form-control" id="sizeOfItemInput" value="${data.size_of_item}" required style="width: 6rem; text-align: center;" placeholder=" ">
    <span class="form-control-placeholder">Size of Item</span>
</div>

               
               <div class="form-group">
    <input type="number" step="0.01" class="form-control" id="purchasePriceInput" value="${data.purchase_price}" required style="width: 6rem; text-align: center;" placeholder=" ">
    <span class="form-control-placeholder">Purchase Price</span>
</div>

               
               <div class="form-group">
    <input type="number" class="form-control" id="sellingPriceInput" value="${data.selling_price}" required style="width: 6rem; text-align: center;" placeholder=" ">
    <span class="form-control-placeholder">Selling Price</span>
</div>

                <button id="saveButton" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
    onclick="saveFunction()"
    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    <img src="../images/conform.png" alt="Save" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
    <span style="margin-right: 10px;">Save</span>
</button>
<button id="cancelButton" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
    onclick="cancelFunction()"
    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    <img src="../images/cancel.png" alt="Cancel" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
    <span style="margin-right: 10px;">Cancel</span>
</button>

          </div>
            </div>
        `;

        document.body.appendChild(customPrompt);

        // Attach event listeners to buttons
        const saveButton = customPrompt.querySelector('#saveButton');
        const cancelButton = customPrompt.querySelector('#cancelButton');

        saveButton.addEventListener('click', async () => {
            customPrompt.remove(); // Remove the modal
            showUniformLoadingAnimation();
            const updatedUniformItem = customPrompt.querySelector('#uniformItemInput').value;
            const updatedSizeOfItem = customPrompt.querySelector('#sizeOfItemInput').value;
            const updatedPurchasePrice = parseFloat(customPrompt.querySelector('#purchasePriceInput').value);
            const updatedSellingPrice = parseFloat(customPrompt.querySelector('#sellingPriceInput').value);

            // Validate if uniform with same details already exists
            if (await isDuplicateUniform(updatedUniformItem, updatedSizeOfItem, updatedPurchasePrice, updatedSellingPrice, sr_no)) {
                hideUniformLoadingAnimation();
                showToast('A uniform with the same item name, size, purchase price, and selling price already exists.', true);
                return;
            }

            // Validate if a uniform with the same item name and size already exists
            const originalUniformItem = data.uniform_item; // assuming data.uniform_item contains the original item name fetched from the server
            const originalSizeOfItem = data.size_of_item; // assuming data.size_of_item contains the original size fetched from the server

            if ((updatedUniformItem !== originalUniformItem || updatedSizeOfItem !== originalSizeOfItem) && await isUniformNameDuplicate(updatedUniformItem, updatedSizeOfItem, sr_no)) {
                hideUniformLoadingAnimation();
                showToast('A uniform with the same item name and size already exists.', true);
                return;
            }

            // customPrompt.remove(); // Remove the modal

            try {
                // Send updated data to server for update
                const response = await fetch(`/inventory/uniforms/${encodeURIComponent(sr_no)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uniform_item: updatedUniformItem,
                        size_of_item: updatedSizeOfItem,
                        purchase_price: updatedPurchasePrice,
                        selling_price: updatedSellingPrice
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update uniform details.');
                }
                hideUniformLoadingAnimation();
                // Handle success (e.g., show toast, refresh data)
                showToast('Uniform details updated successfully', false);
                refreshUniformsData(); // Example function to refresh uniform data
            } catch (error) {
                console.error('Error updating uniform details:', error);
                showToast('Failed to update uniform details', true);
            }
        });

        cancelButton.addEventListener('click', () => {
            customPrompt.remove(); // Remove the modal on cancel
        });

    } catch (error) {
        console.error('Error:', error);
        hideUniformLoadingAnimation();
    }
}

// Helper function to check for duplicate uniform
async function isDuplicateUniform(uniformItem, sizeOfItem, purchasePrice, sellingPrice, sr_no) {
    try {
        const response = await fetch('/inventory/uniforms');
        if (!response.ok) {
            throw new Error('Failed to fetch uniforms.');
        }

        const uniforms = await response.json();

        return uniforms.some(uniform =>
            uniform.uniform_item.trim().toLowerCase() === uniformItem.trim().toLowerCase() &&
            uniform.size_of_item.trim().toLowerCase() === sizeOfItem.trim().toLowerCase() &&
            uniform.purchase_price === purchasePrice &&
            uniform.selling_price === sellingPrice &&
            uniform.sr_no !== sr_no // Exclude the current uniform being edited
        );
    } catch (error) {
        console.error('Error checking for duplicate uniform:', error);
        return false;
    }
}

// Helper function to check for duplicate uniform name and size
async function isUniformNameDuplicate(uniformItem, sizeOfItem, sr_no) {
    try {
        const response = await fetch('/inventory/uniforms');
        if (!response.ok) {
            throw new Error('Failed to fetch uniforms.');
        }

        const uniforms = await response.json();

        return uniforms.some(uniform =>
            uniform.uniform_item.trim().toLowerCase() === uniformItem.trim().toLowerCase() &&
            uniform.size_of_item.trim().toLowerCase() === sizeOfItem.trim().toLowerCase() &&
            uniform.sr_no !== sr_no // Exclude the current uniform being edited
        );
    } catch (error) {
        console.error('Error checking for duplicate uniform name and size:', error);
        return false;
    }
}


function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');

    let csvContent = '';
    
    const headers = table.querySelectorAll('th');
    const headerData = [];
    headers.forEach(header => {
        headerData.push(`"${header.textContent}"`);
    });
    csvContent += headerData.join(',') + '\n';

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if(cells.length === 0) {
            return; // Skip rows without cells (e.g., header row)
        }
        const rowData = [];
        cells.forEach(cell => {
            rowData.push(`"${cell.textContent}"`);
        });
        csvContent += rowData.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function exportUniformTable() {
    exportTableToCSV('uniformTable', 'Inventory_Uniform_Extract.csv');
}


refreshUniformsData();