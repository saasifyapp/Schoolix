////Loading Animation
function showVendorLoadingAnimation () {
    console.log("show")
    document.getElementById('loadingOverlayVendor').style.display = 'flex';
}

function hideVendorLoadingAnimation() {
    console.log("hide")
    document.getElementById('loadingOverlayVendor').style.display = 'none';
}

//Submitting vendor data
document.addEventListener("DOMContentLoaded", function () {
    // Get the form element
    const form = document.getElementById('vendorForm');

    // Add submit event listener to the form
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission
        showVendorLoadingAnimation (); 
        // Get the vendor name and amount paid from the form
        const vendorNameInput = document.getElementById('vendorName');
        const vendorFor = document.getElementById('vendorFor').value;
        const amountPaidInput = document.getElementById('amountPaid');
        const vendorName = vendorNameInput.value;
        const amountPaid = parseFloat(amountPaidInput.value);

        // Prepare the data to send in the request body
        const data = {
            vendorName: vendorName,
            vendorFor: vendorFor,
            amountPaid: amountPaid
        };

        // Make a POST request to the endpoint
        await fetch('/inventory/purchase/add_vendor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text);
                    });
                }
                hideVendorLoadingAnimation();
                // Clear input fields after successful submission
                form.reset();
            })
            .then(data => {
                hideVendorLoadingAnimation();
                console.log('Vendor added successfully');
                showToast(`${vendorName} added successfully`);
                refreshData();
                // You can update the UI or do something else here after successful submission
                populateBooksVendorDropdown();
                populateUniformVendorDropdown();
            })
            .catch(error => {
                refreshData();
                if (error.message === 'Vendor name already exists') {
                    hideVendorLoadingAnimation();
                    showToast(`${vendorName} is already added`, 'red');
                } else {
                    hideVendorLoadingAnimation();
                    showToast('Error while submitting vendor');
                }
                console.error('Error:', error);
                // Handle errors here, like displaying an error message to the user
            });
    });
});

//refresh data
async function refreshData() {
    showVendorLoadingAnimation ();
    document.getElementById('searchField').value = '';
    await fetch('/inventory/vendors')
        .then(response => response.json())
        .then(data => displayVendors(data))
        .catch(error => {
            console.error('Error:', error);
            showToast('Error fetching vendors. Please try again.', true);
            hideVendorLoadingAnimation(); 
        });
}

function displayVendors(data) {
    const vendorTableBody = document.getElementById('vendorTableBody');
    vendorTableBody.innerHTML = ''; // Clear previous data

    try {
        // Reverse the data array
        data.reverse();

        if (data.length === 0) {
            hideVendorLoadingAnimation();
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = '<td colspan="9">No results found</td>';
            vendorTableBody.appendChild(noResultsRow);
        } else {
            data.forEach(vendor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${vendor.vendor_name}</td>
                    <td>${vendor.vendorFor}</td>
                    <!--<td>${vendor.net_payable}</td>-->
                    <td>${vendor.paid_till_now}</td>
                    <!--<td>${vendor.balance}</td>-->
                    <td>
                        <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                            <button style="background-color: transparent;
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
                            onclick="updateVendor('${vendor.vendor_name}')"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                <img src="../images/update_vendor.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                <span style="margin-right: 10px;">Pay Vendor</span>
                            </button>
                            <button style="background-color: transparent;
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
                            onclick="deleteVendor('${vendor.vendor_name}')"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                                <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                                <span style="margin-right: 10px;">Delete</span>
                            </button>
                        </div>
                    </td>
                `;
                vendorTableBody.appendChild(row);
            });
        }
        hideVendorLoadingAnimation();

    } catch (error) {
        hideVendorLoadingAnimation();
        console.error('Error displaying vendors:', error);
        // Handle error if needed
    }
}


async function deleteVendor(vendorName) {
    const confirmation = confirm(`Are you sure you want to delete the vendor "${vendorName}"?`);
    if (confirmation) {
        showVendorLoadingAnimation ();
        await fetch(`/inventory/vendors/${encodeURIComponent(vendorName)}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete vendor.');
                }
                hideVendorLoadingAnimation();
            })
            .then(data => {
                hideVendorLoadingAnimation();
                refreshData();
                showToast(`${vendorName} deleted successfully`,false); // Show success toast
                populateBooksVendorDropdown();
                populateUniformVendorDropdown();
                // Refresh data after deleting the vendor
            })
            .catch(error => {
                hideVendorLoadingAnimation();
                console.error('Error deleting vendor:', error);
                refreshData();
                showToast('An error occurred while deleting the vendor.', true); // Show error toast
            });
    }
}
async function updateVendor(vendorName) {
    try {
        const response = await fetch(`/inventory/vendors/${encodeURIComponent(vendorName)}/paid_till_now`);
        if (!response.ok) {
            throw new Error('Failed to retrieve vendor details.');
        }
        
        const data = await response.json();
        let existingPaidAmount = parseFloat(data.paid_till_now) || 0;
        let net_payable = parseFloat(data.net_payable) || 0;
        let initialBalance = parseFloat(data.balance) || 0;
        let newPaidAmount = 0;

        // Create custom prompt
        const customPrompt = document.createElement('div');
        customPrompt.classList.add('custom-prompt');
        
        const updatePromptContent = () => {
            customPrompt.innerHTML = `
                <div class="prompt-content">
                    <h2>${vendorName}</h2>
                    <p>Net Payable: ${net_payable.toFixed(2)}</p>
                    <p>Paid Till Now: ${existingPaidAmount.toFixed(2)}</p>
                    <p>New Amount Paid:</p>
                    <input type="number" step="0.01" id="newPaidAmountInput" min="0">
                    <p id="totalPaid">Total Paid: ${existingPaidAmount.toFixed(2)}</p>
                    <p id="balance">Balance: ${initialBalance.toFixed(2)}</p>
                    <button id="confirmButton" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                        <img src="../images/conform.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                        <span style="margin-right: 10px;">Confirm</span>
                    </button>
                    <button id="cancelButton" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;" onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
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
            // Get the new paid amount from the input field
            newPaidAmount = parseFloat(customPrompt.querySelector('#newPaidAmountInput').value) || 0;

            // Calculate total paid amount
            const totalPaid = existingPaidAmount + newPaidAmount;

            // Calculate new balance
            let balance = net_payable - totalPaid;

            // Update the vendor details on the server
            updateVendorPaidAmount(vendorName, totalPaid, balance);

            // Remove the prompt
            customPrompt.remove();
        });

        // Add event listener to input field for updating total paid amount and balance
        const newPaidAmountInput = customPrompt.querySelector('#newPaidAmountInput');
        newPaidAmountInput.addEventListener('input', () => {
            newPaidAmount = parseFloat(newPaidAmountInput.value) || 0;
            const totalPaid = existingPaidAmount + newPaidAmount;
            const totalPaidElement = customPrompt.querySelector('#totalPaid');
            totalPaidElement.textContent = `Total Paid: ${totalPaid.toFixed(2)}`;

            // Update balance
            let balance = net_payable - totalPaid;
            const balanceElement = customPrompt.querySelector('#balance');
            balanceElement.textContent = `Balance: ${balance.toFixed(2)}`;
        });

        // Add event listener to cancel button
        const cancelButton = customPrompt.querySelector('#cancelButton');
        cancelButton.addEventListener('click', () => {
            // Remove the prompt
            customPrompt.remove();
        });
    } catch (error) {
        console.error('Error retrieving vendor details:', error);
        // Handle error if needed
    }
}

// Function to update vendor details on the server
async function updateVendorPaidAmount(vendorName, totalPaid, balance) {
    try {
        const response = await fetch(`/inventory/vendors/${encodeURIComponent(vendorName)}/paid_till_now`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paid_till_now: totalPaid.toFixed(2), balance: balance.toFixed(2) })
        });

        if (!response.ok) {
            throw new Error('Failed to update vendor details.');
        }

        console.log('Vendor details updated successfully.');
        showToast(`${vendorName} updated successfully`);
        refreshData(); // Assuming you have a function to refresh data
    } catch (error) {
        console.error('Error updating vendor details:', error);
        showToast(`Failed to update ${vendorName}`, 'red');
        // Handle error if needed
    }
}


// Function to handle searching vendor details
async function searchVendorDetails() {
    const searchTerm = document.getElementById('searchField').value.trim();

    if (!searchTerm) {
        if (searchField !== document.activeElement) {
            showToast('Please enter a search term.', true);
        }
        refreshData();
        return;
    }


    // Fetch data from the server based on the search term
    await fetch(`/inventory/vendors/search?search=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {

            const vendorTableBody = document.getElementById('vendorTableBody');
            vendorTableBody.innerHTML = ''; // Clear previous data

            if (data.length === 0) {
                // If no results found, display a message
                const noResultsRow = document.createElement('tr');
                noResultsRow.innerHTML = '<td colspan="6">No results found</td>';
                vendorTableBody.appendChild(noResultsRow);
            } else {
                // Append vendor data to the table
                data.forEach(vendor => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${vendor.vendor_name}</td>
                        <td>${vendor.vendorFor}</td>
                        <!--<td>${vendor.net_payable}</td>-->
                        <td>${vendor.paid_till_now}</td>
                        <!--<td>${vendor.balance}</td>-->
                        <td>
    <div class="button-container"style="display: flex; justify-content: center; gap: 20px;">
        <button style="background-color: transparent;
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
        onclick="updateVendor('${vendor.vendor_name}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="../images/update_vendor.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Pay Vendor</span>
        </button>
        <button style="background-color: transparent;
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
        onclick="deleteVendor('${vendor.vendor_name}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
            <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
            <span style="margin-right: 10px;">Delete</span>
        </button>
    </div>
</td>
                    `;
                    vendorTableBody.appendChild(row);
                });
            }
            // addFadeUpAnimation();
            // hideVendorLoadingAnimation(); 
        })
        .catch(error => {
            console.error('Error:', error);
            // hideVendorLoadingAnimation(); 
        });
}

refreshData();


