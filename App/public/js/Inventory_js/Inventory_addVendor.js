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
                vendorNameInput.value = '';
                amountPaidInput.value = '';
                vendorFor.value = 0;
                populateVendorDropdown();
            })
            .then(data => {
                console.log('Vendor added successfully');
                showToast('Vendor added successfully');
                refreshData();
                // You can update the UI or do something else here after successful submission
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
    // showLoadingAnimation();
    fetch('/inventory/vendors')
        .then(response => response.json())
        .then(data => displayVendors(data))
        .catch(error => {
            console.error('Error:', error);
            // showToast('Error fetching vendors. Please try again.', true);
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
                <!--<button style="display: inline-block; margin-right: 5px; width:1rem;" onclick="editVendor('${vendor.vendor_name}', '${vendor.net_payable}', '${vendor.paid_till_now}', '${vendor.balance}')">Edit</button>-->
                <button style="display: inline-block; width:1rem;" onclick="deleteVendor('${vendor.vendor_name}','${vendor.net_payable}', '${vendor.paid_till_now}', '${vendor.balance}')">Delete</button>
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
            populateVendorDropdown();
            // Refresh data after deleting the vendor
        })
        .catch(error => {
            console.error('Error deleting vendor:', error);
            showToast('An error occurred while deleting the vendor.', true); // Show error toast
        });
    }
}


refreshData();
