document.addEventListener('DOMContentLoaded', function () {
    const typeSelect = document.getElementById('type');
    const dynamicFields = document.getElementById('dynamicFields');
    const addDriverForm = document.getElementById('addDriverForm');

    typeSelect.addEventListener('change', function () {
        dynamicFields.innerHTML = ''; // Clear existing fields

        if (this.value === 'driver') {
            dynamicFields.innerHTML = `
                <div class="form-group">
                    <input type="text" class="form-control" id="vehicle_no" placeholder=" " maxlength="13">
                    <span class="form-control-placeholder">Vehicle Number</span>
                </div>
                <div class="form-group">
                    <select id="vehicle_type" class="form-control">
                        <option value="">Select Vehicle Type</option>
                        <option value="bus">Bus</option>
                        <option value="van">Van</option>
                        <option value="car">Car</option>
                        <option value="other">Other</option>
                    </select>
                    <span class="form-control-placeholder">Vehicle Type</span>
                </div>
                <div class="form-group">
                    <input type="number" class="form-control" id="vehicle_capacity" placeholder=" ">
                    <span class="form-control-placeholder">Capacity</span>
                </div>
            `;

            const vehicleNoInput = document.getElementById('vehicle_no');
            vehicleNoInput.addEventListener('input', function () {
                this.value = formatVehicleNumber(this.value);
            });
        } else if (this.value === 'conductor') {
            dynamicFields.innerHTML = `
                <div class="form-group">
                    <input type="text" class="form-control" id="vehicle_no" placeholder=" " maxlength="13">
                    <span class="form-control-placeholder">Vehicle Number</span>
                </div>
                <div id="suggestions" class="suggestions"></div>
            `;

            const vehicleNoInput = document.getElementById('vehicle_no');
            const suggestionsContainer = document.getElementById('suggestions');

            // Add event listener to format vehicle number
            vehicleNoInput.addEventListener('input', function () {
                this.value = formatVehicleNumber(this.value);
                const query = this.value;
                if (query.length > 1) {
                    fetch(`/getDriverDetails?q=${query}`)
                        .then(response => response.json())
                        .then(data => {
                            suggestionsContainer.style.display = 'flex'; // Show suggestions container
                            suggestionsContainer.innerHTML = '';

                            if (data.length === 0) {
                                const noResultsItem = document.createElement('div');
                                noResultsItem.classList.add('suggestion-item', 'no-results');
                                noResultsItem.textContent = 'No results found';
                                suggestionsContainer.appendChild(noResultsItem);
                            } else {
                                data.forEach(driver => {
                                    const suggestionItem = document.createElement('div');
                                    suggestionItem.classList.add('suggestion-item');
                                    suggestionItem.textContent = `${driver.vehicle_no} | ${driver.name}`;
                                    suggestionItem.dataset.vehicleNo = driver.vehicle_no;
                                    suggestionItem.dataset.name = driver.name;
                                    suggestionsContainer.appendChild(suggestionItem);
                                });
                            }
                        })
                        .catch(error => console.error('Error:', error));
                } else {
                    suggestionsContainer.style.display = 'none'; // Hide suggestions container
                    suggestionsContainer.innerHTML = '';
                }
            });

            suggestionsContainer.addEventListener('click', function (event) {
                if (event.target.classList.contains('suggestion-item')) {
                    const selectedDriver = event.target;
                    vehicleNoInput.value = selectedDriver.dataset.vehicleNo;
                    suggestionsContainer.style.display = 'none'; // Hide suggestions container
                    suggestionsContainer.innerHTML = '';
                }
            });

            document.addEventListener('click', function (event) {
                if (!suggestionsContainer.contains(event.target) && !vehicleNoInput.contains(event.target)) {
                    suggestionsContainer.style.display = 'none'; // Hide suggestions container
                    suggestionsContainer.innerHTML = '';
                }
            });
        }
    });

    // Form submission handler
    addDriverForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            contact: document.getElementById('contact').value,
            address: document.getElementById('address').value,
            type: document.getElementById('type').value,
            vehicle_no: document.getElementById('vehicle_no') ? document.getElementById('vehicle_no').value : null,
            vehicle_type: document.getElementById('type').value === 'driver' ? document.getElementById('vehicle_type').value : null,
            vehicle_capacity: document.getElementById('type').value === 'driver' ? document.getElementById('vehicle_capacity').value : null
        };

        fetch('/addDriverConductor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
                resetForm();
                //hideOverlay('addDriverOverlay');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while submitting the form');
        });
    });

    // Function to reset the form and clear dynamic fields
    function resetForm() {
        addDriverForm.reset(); // Reset the form fields
        dynamicFields.innerHTML = ''; // Clear dynamic fields
        typeSelect.value = ''; // Reset type select
    }

    // Function to format vehicle number
    function formatVehicleNumber(value) {
        // Remove all non-alphanumeric characters except dashes
        value = value.replace(/[^a-zA-Z0-9]/g, '');

        // Automatically insert dashes at the correct positions
        if (value.length >= 2 && value[2] !== '-') value = value.slice(0, 2) + '-' + value.slice(2);
        if (value.length >= 5 && value[5] !== '-') value = value.slice(0, 5) + '-' + value.slice(5);
        if (value.length >= 8 && value[8] !== '-') value = value.slice(0, 8) + '-' + value.slice(8);

        return value.toUpperCase();
    }
});