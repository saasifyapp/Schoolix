//Submitting vendor data
document.addEventListener("DOMContentLoaded", function () {
    // Get the form element
    const form = document.getElementById('vendorForm');

    // Add submit event listener to the form
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the vendor name and amount paid from the form
        const vendorNameInput = document.getElementById('vendorName');
        const vendorFor = document.getElementById('vendorFor').value;
        const amountPaidInput = document.getElementById('amountPaid');
        const vendorName = vendorNameInput.value;
        const amountPaid = parseFloat(amountPaidInput.value);

        console.log(vendorFor)
        // Prepare the data to send in the request body
        const data = {
            vendorName: vendorName,
            vendorFor: vendorFor,
            amountPaid: amountPaid
        };

        // Make a POST request to the endpoint
        fetch('/inventory/purchase/add_vendor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Clear input fields after successful submission
                form.reset();

            })
            .then(data => {
                console.log('Vendor added successfully');
                showToast('Vendor added successfully');
                refreshData();
                // You can update the UI or do something else here after successful submission
                populateBooksVendorDropdown();
                populateUniformVendorDropdown();
            })
            .catch(error => {
                refreshData();
                showToast('Error while submitting vendor');
                console.error('Error adding vendor:', error);
                // Handle errors here, like displaying an error message to the user
            });
    });
});

//refresh data
function refreshData() {
    document.getElementById('searchField').value = '';
    // showLoadingAnimation();
    fetch('/inventory/vendors')
        .then(response => response.json())
        .then(data => displayVendors(data))
        .catch(error => {
            console.error('Error:', error);
            showToast('Error fetching vendors. Please try again.', true);
            // hideLoadingAnimation();
        });
}

function displayVendors(data) {
    const vendorTableBody = document.getElementById('vendorTableBody');
    vendorTableBody.innerHTML = ''; // Clear previous data

    try {
        data.forEach(vendor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vendor.vendor_name}</td>
                <td>${vendor.vendorFor}</td>
                <td>${vendor.net_payable}</td>
                <td>${vendor.paid_till_now}</td>
                <td>${vendor.balance}</td>
                <td>
                <button onclick="updateVendor('${vendor.vendor_name}')">Update</button>
                <button onclick="deleteVendor('${vendor.vendor_name}','${vendor.net_payable}', '${vendor.paid_till_now}', '${vendor.balance}')">Delete</button>
            </td>
            `;
            vendorTableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error displaying vendors:', error);
        // Handle error if needed
    }
}

function deleteVendor(vendorName) {
    const confirmation = confirm(`Are you sure you want to delete the vendor "${vendorName}"?`);
    if (confirmation) {
        fetch(`/inventory/vendors/${encodeURIComponent(vendorName)}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete vendor.');
                }
            })
            .then(data => {
                refreshData();
                showToast('Vendor deleted successfully.', false); // Show success toast
                populateBooksVendorDropdown();
                populateUniformVendorDropdown();
                // Refresh data after deleting the vendor
            })
            .catch(error => {
                console.error('Error deleting vendor:', error);
                refreshData();
                showToast('An error occurred while deleting the vendor.', true); // Show error toast
            });
    }
}

// Function to update a vendors paid amount
function updateVendor(vendorName) {
    fetch(`/inventory/vendors/${encodeURIComponent(vendorName)}/paid_till_now`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to retrieve vendor details.');
            }
            return response.json();
        })
        .then(data => {
            let existingPaidAmount = data.paid_till_now;
            let newPaidAmount = 0;

            // Create custom prompt
            const customPrompt = document.createElement('div');
            customPrompt.classList.add('custom-prompt');
            const updatePromptContent = () => {
                customPrompt.innerHTML = `
                    <div class="prompt-content">
                        <h2>${vendorName}</h2>
                        <p>Paid Till Now : ${existingPaidAmount}</p>
                        <p>New Amount Paid:</p>
                        <input type="number" id="newPaidAmountInput" min="0">
                        <p id="totalPaid">Total Paid : ${existingPaidAmount}</p>
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
                // Get the new paid amount from the input field
                newPaidAmount = parseInt(customPrompt.querySelector('#newPaidAmountInput').value, 10) || 0;

                // Calculate total paid amount
                const totalPaid = existingPaidAmount + newPaidAmount;

                // Update the vendor details on the server
                updateVendorPaidAmount(vendorName, totalPaid);

                // Remove the prompt
                customPrompt.remove();
            });

            // Add event listener to input field for updating total paid amount
            const newPaidAmountInput = customPrompt.querySelector('#newPaidAmountInput');
            newPaidAmountInput.addEventListener('input', () => {
                newPaidAmount = parseInt(newPaidAmountInput.value, 10) || 0;
                const totalPaid = existingPaidAmount + newPaidAmount;
                const totalPaidElement = customPrompt.querySelector('#totalPaid');
                totalPaidElement.textContent = `Total Paid : ${totalPaid}`;
            });

            // Add event listener to cancel button
            const cancelButton = customPrompt.querySelector('#cancelButton');
            cancelButton.addEventListener('click', () => {
                // Remove the prompt
                customPrompt.remove();
            });
        })
        .catch(error => {
            console.error('Error retrieving vendor details:', error);
            // Handle error if needed
        });
}

// Function to update vendor details on the server
function updateVendorPaidAmount(vendorName, totalPaid) {
    console.log(vendorName, totalPaid)

    fetch(`/inventory/vendors/${encodeURIComponent(vendorName)}/paid_till_now`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paid_till_now: totalPaid })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update vendor details.');
            }
            refreshData();
            console.log('Vendor details updated successfully.');
            // You can perform further actions here, like refreshing the page or updating the UI
        })
        .catch(error => {
            console.error('Error updating vendor details:', error);
            // Handle error if needed
        });
}

// Function to handle searching vendor details
function searchVendorDetails() {
    // showLoadingAnimation(); 

    const searchTerm = document.getElementById('searchField').value.trim();

    // Check if the search term is empty
    if (searchTerm === '') {
        showToast('Please enter a search term.', true); // Show error toast
        refreshData(); // Refresh data to show all vendors
        // hideLoadingAnimation();
        return;
    }

    // Fetch data from the server based on the search term
    fetch(`/inventory/vendors/search?search=${encodeURIComponent(searchTerm)}`)
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
                        <td>${vendor.vendor_for}</td>
                        <td>${vendor.net_payable}</td>
                        <td>${vendor.paid_till_now}</td>
                        <td>${vendor.balance}</td>
                        <td style="text-align: center;">
                        <button style="background-color: transparent;
                        border: none;
                        color: white;
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px;
                        transition: transform 0.2s;"
                onclick="updateVendor('${vendor.vendor_name}')"
                onmouseover="this.style.transform='scale(1.3)'"
                onmouseout="this.style.transform='scale(1)'">
            <img src="" alt="Edit" style="width: 20px; height: 20px; border-radius: 20px; margin: 0;">
        </button>
        <button style="background-color: transparent;
                        border: none;
                        color: white;
                        padding: 0;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 14px;
                        cursor: pointer;
                        max-height: 100%;
                        border-radius: 20px;
                        transition: transform 0.2s;"
                onclick="deleteVendor('${vendor.vendor_name}')"
                onmouseover="this.style.transform='scale(1.3)'"
                onmouseout="this.style.transform='scale(1)'">
            <img src="" alt="Delete" style="width: 20px; height: 20px; border-radius: 20px; margin: 0;">
        </button>
    </td>
                        </td>
                    `;
                    vendorTableBody.appendChild(row);
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

refreshData();
