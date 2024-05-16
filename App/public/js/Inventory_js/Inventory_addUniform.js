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
                refreshUniformsData()
                // Optionally, refresh data or update UI
            })
            .catch(error => {
                refreshUniformsData()
                console.error('Error adding uniform:', error);
            });
    });
});

//    // Function to populate vendor dropdown
//    document.addEventListener("DOMContentLoaded", function () {
//     fetch('/inventory/vendors')
//         .then(response => response.json())
//         .then(data => {
//             const vendorDropdowns = [document.getElementById('vendor'),document.getElementById('univendor'), document.getElementById('editVendor')];
//             vendorDropdowns.forEach(dropdown => {
//                 data.forEach(vendor => {
//                     const option = document.createElement('option');
//                     option.textContent = vendor.vendor_name;
//                     dropdown.appendChild(option);
//                 });
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching vendors:', error);
//         });

//     // Initial call to fetch and display uniform data
//     refreshUniformsData();
// });

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
                <button onclick="editUniform('${uniform.uniform_item}')">Edit</button>
                <button onclick="deleteUniform('${uniform.uniform_item}')">Delete</button>
            </td>
        `;
        uniformTableBody.appendChild(row);
    });
}

// Function to handle deleting a uniform
function deleteUniform(uniformItem) {
    const confirmation = confirm('Are you sure you want to delete the uniform "${uniformItem}"?');
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
            })
            .catch(error => {
                console.error('Error deleting uniform:', error);
            });
    }
}

// Function to open the Edit Uniform Overlay
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

refreshUniformsData();