document.addEventListener('DOMContentLoaded', function () {
    // Suggestion Boxes
    const vehicleNoInput = document.getElementById('vehicleNo');
    const routeInput = document.getElementById('route');
    const shiftInput = document.getElementById('shift');
    const vehicleNoSuggestionBox = document.getElementById('vehicle_no_suggestionbox');
    const routeSuggestionBox = document.getElementById('route_suggestionbox');
    const shiftSuggestionBox = document.getElementById('shift_suggestionbox');

    // Information Boxes
    const vehicleInformationBox = document.getElementById('vehicle_information_box');
    const routeInformationBox = document.getElementById('route_information_box');
    const shiftInformationBox = document.getElementById('shift_information_box');

    // Maps to store details
    const vehicleDetailsMap = new Map();
    const routeDetailsMap = new Map();
    const shiftDetailsMap = new Map();

    // Fetch and populate suggestion boxes
    function fetchAndPopulateSuggestions() {
        // Fetch driver-conductor details
        vehicleNoInput.addEventListener("input", function () {
            const query = this.value;
            if (query.length >= 0) {
                fetch(`/getDriverDetails?q=${query}`)
                    .then((response) => response.json())
                    .then((data) => {
                        vehicleNoSuggestionBox.style.display = "flex"; // Show suggestions container
                        vehicleNoSuggestionBox.innerHTML = "";

                        if (data.length === 0) {
                            const noResultsItem = document.createElement("div");
                            noResultsItem.classList.add("suggestion-item", "no-results");
                            noResultsItem.textContent = "No results found";
                            vehicleNoSuggestionBox.appendChild(noResultsItem);
                        } else {
                            const driverConductorMap = new Map();
                            data.forEach((person) => {
                                const suggestionItem = document.createElement("div");
                                suggestionItem.classList.add("suggestion-item");
                                suggestionItem.textContent = `${person.vehicle_no} | ${person.name}`;
                                suggestionItem.dataset.id = person.vehicle_no; // Use vehicle_no as ID

                                // Store driver and conductor details in a map
                                if (!driverConductorMap.has(person.vehicle_no)) {
                                    driverConductorMap.set(person.vehicle_no, { driver: null, conductor: null });
                                }
                                if (person.driver_conductor_type === 'Driver') {
                                    driverConductorMap.get(person.vehicle_no).driver = person.name;
                                } else if (person.driver_conductor_type === 'Conductor') {
                                    driverConductorMap.get(person.vehicle_no).conductor = person.name;
                                }

                                vehicleNoSuggestionBox.appendChild(suggestionItem);
                            });

                            // Log the driverConductorMap for debugging
                            console.log('Driver-Conductor Map:', driverConductorMap);

                            // Store the combined driver and conductor details
                            driverConductorMap.forEach((value, key) => {
                                vehicleDetailsMap.set(key, value);
                            });

                            // Log the vehicleDetailsMap for debugging
                            console.log('Vehicle Details Map:', vehicleDetailsMap);
                        }
                    })
                    .catch((error) => console.error("Error:", error));
            } else {
                vehicleNoSuggestionBox.style.display = "none"; // Hide suggestions container
                vehicleNoSuggestionBox.innerHTML = "";
            }
        });

        // Fetch route details
        routeInput.addEventListener("input", function () {
            const query = this.value;
            if (query.length >= 0) {
                fetch(`/route-details?q=${query}`)
                    .then((response) => response.json())
                    .then((data) => {
                        routeSuggestionBox.style.display = "flex"; // Show suggestions container
                        routeSuggestionBox.innerHTML = "";

                        if (data.length === 0) {
                            const noResultsItem = document.createElement("div");
                            noResultsItem.classList.add("suggestion-item", "no-results");
                            noResultsItem.textContent = "No results found";
                            routeSuggestionBox.appendChild(noResultsItem);
                        } else {
                            data.forEach((route) => {
                                const suggestionItem = document.createElement("div");
                                suggestionItem.classList.add("suggestion-item");
                                suggestionItem.textContent = route.route_shift_name;
                                suggestionItem.dataset.id = route.route_shift_name; // Use route_shift_name as ID
                                routeDetailsMap.set(route.route_shift_name, route);
                                routeSuggestionBox.appendChild(suggestionItem);
                            });
                        }
                    })
                    .catch((error) => console.error("Error:", error));
            } else {
                routeSuggestionBox.style.display = "none"; // Hide suggestions container
                routeSuggestionBox.innerHTML = "";
            }
        });

        // Fetch shift details
        shiftInput.addEventListener("input", function () {
            const query = this.value;
            if (query.length >= 0) {
                fetch(`/shift-details?q=${query}`)
                    .then((response) => response.json())
                    .then((data) => {
                        shiftSuggestionBox.style.display = "flex"; // Show suggestions container
                        shiftSuggestionBox.innerHTML = "";

                        if (data.length === 0) {
                            const noResultsItem = document.createElement("div");
                            noResultsItem.classList.add("suggestion-item", "no-results");
                            noResultsItem.textContent = "No results found";
                            shiftSuggestionBox.appendChild(noResultsItem);
                        } else {
                            data.forEach((shift) => {
                                const suggestionItem = document.createElement("div");
                                suggestionItem.classList.add("suggestion-item");
                                suggestionItem.textContent = shift.route_shift_name;
                                suggestionItem.dataset.id = shift.route_shift_name; // Use route_shift_name as ID
                                shiftDetailsMap.set(shift.route_shift_name, shift);
                                shiftSuggestionBox.appendChild(suggestionItem);
                            });
                        }
                    })
                    .catch((error) => console.error("Error:", error));
            } else {
                shiftSuggestionBox.style.display = "none"; // Hide suggestions container
                shiftSuggestionBox.innerHTML = "";
            }
        });
    }

    // Event delegation for suggestion item click
    vehicleNoSuggestionBox.addEventListener("click", function (event) {
        if (event.target.classList.contains("suggestion-item")) {
            const selectedId = event.target.dataset.id;
            const selectedDetails = vehicleDetailsMap.get(selectedId);
            vehicleNoInput.value = selectedId;

            // Check and log the properties of the selectedDetails object
            console.log('Selected driver and conductor details:', selectedDetails);

            vehicleInformationBox.innerHTML = `
                <p>Vehicle No: ${selectedId || 'N/A'}</p>
                <p>Driver: ${selectedDetails.driver || 'N/A'}</p>
                <p>Conductor: ${selectedDetails.conductor || 'N/A'}</p>
            `;
            vehicleInformationBox.style.display = "block"; // Show information box
            vehicleNoSuggestionBox.style.display = "none"; // Hide suggestions container
            vehicleNoSuggestionBox.innerHTML = "";
        }
    });

    routeSuggestionBox.addEventListener("click", function (event) {
        if (event.target.classList.contains("suggestion-item")) {
            const selectedId = event.target.dataset.id;
            const selectedDetails = routeDetailsMap.get(selectedId);
            routeInput.value = selectedDetails.route_shift_name;
            routeInformationBox.innerHTML = `
                <p>Route: ${selectedDetails.route_shift_name}</p>
                <p>Stops: ${selectedDetails.route_shift_detail}</p>
            `;
            routeInformationBox.style.display = "block"; // Show information box
            routeSuggestionBox.style.display = "none"; // Hide suggestions container
            routeSuggestionBox.innerHTML = "";
        }
    });

    shiftSuggestionBox.addEventListener("click", function (event) {
        if (event.target.classList.contains("suggestion-item")) {
            const selectedId = event.target.dataset.id;
            const selectedDetails = shiftDetailsMap.get(selectedId);
            shiftInput.value = selectedDetails.route_shift_name;
            shiftInformationBox.innerHTML = `
                <p>Shift: ${selectedDetails.route_shift_name}</p>
                <p>Classes: ${selectedDetails.route_shift_detail}</p>
            `;
            shiftInformationBox.style.display = "block"; // Show information box
            shiftSuggestionBox.style.display = "none"; // Hide suggestions container
            shiftSuggestionBox.innerHTML = "";
        }
    });

    // Hide suggestion box on blur
    document.addEventListener("click", function (event) {
        if (!vehicleNoSuggestionBox.contains(event.target) && !vehicleNoInput.contains(event.target)) {
            vehicleNoSuggestionBox.style.display = "none"; // Hide suggestions container
            vehicleNoSuggestionBox.innerHTML = "";
        }
        if (!routeSuggestionBox.contains(event.target) && !routeInput.contains(event.target)) {
            routeSuggestionBox.style.display = "none"; // Hide suggestions container
            routeSuggestionBox.innerHTML = "";
        }
        if (!shiftSuggestionBox.contains(event.target) && !shiftInput.contains(event.target)) {
            shiftSuggestionBox.style.display = "none"; // Hide suggestions container
            shiftSuggestionBox.innerHTML = "";
        }
    });

    // Fetch and populate suggestions on page load
    fetchAndPopulateSuggestions();

    // Handle form submission
    const manageScheduleForm = document.getElementById('manageScheduleForm');
    manageScheduleForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const vehicleNo = vehicleNoInput.value;
        const driver = vehicleDetailsMap.get(vehicleNo).driver || 'N/A';
        const conductor = vehicleDetailsMap.get(vehicleNo).conductor || 'N/A';
        const route = routeInput.value;
        const shift = shiftInput.value;

        const routeDetails = routeDetailsMap.get(route) || { route_shift_detail: 'N/A' };
        const shiftDetails = shiftDetailsMap.get(shift) || { route_shift_detail: 'N/A' };

        const data = {
            vehicle_no: vehicleNo,
            driver_name: driver,
            conductor_name: conductor,
            route_name: route,
            route_stops: routeDetails.route_shift_detail,
            shift_name: shift,
            classes_alloted: shiftDetails.route_shift_detail
        };

        fetch('/addSchedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    alert(result.error);
                } else {
                    alert(result.message);
                    manageScheduleForm.reset();
                    vehicleInformationBox.style.display = 'none';
                    routeInformationBox.style.display = 'none';
                    shiftInformationBox.style.display = 'none';
                    fetchAndDisplayScheduleDetails(); // Refresh the table after adding a new entry
                }
            })
            .catch(error => console.error('Error:', error));
    });

    // Fetch and display schedule details in the table
    function fetchAndDisplayScheduleDetails() {
        fetch('/getScheduleDetails')
            .then(response => response.json())
            .then(data => {
                const scheduleTableBody = document.getElementById('scheduleTableBody');
                scheduleTableBody.innerHTML = ''; // Clear existing table rows

                // Reverse the array
                data.reverse();

                data.forEach((item) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.vehicle_no}</td>
                        <td>${item.driver_name}</td>
                        <td>${item.conductor_name}</td>
                        <td>${item.route_name}</td>
                        <td>${item.route_stops}</td>
                        <td>${item.shift_name}</td>
                        <td>${item.classes_alloted}</td>
                        <td>
                            <button class="edit-button" data-id="${item.id}">Edit</button>
                            <button class="delete-button" data-id="${item.id}">Delete</button>
                        </td>
                    `;
                    scheduleTableBody.appendChild(row);
                });

                // Add event listeners for edit and delete buttons
                document.querySelectorAll('.edit-button').forEach(button => {
                    button.addEventListener('click', handleEdit);
                });

                document.querySelectorAll('.delete-button').forEach(button => {
                    button.addEventListener('click', handleDelete);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // Handle edit button click
    function handleEdit(event) {
        const id = event.target.dataset.id;
        // Implement edit functionality here
        console.log('Edit button clicked for ID:', id);
    }

    // Handle delete button click
    function handleDelete(event) {
        const id = event.target.dataset.id;
        fetch(`/deleteSchedule/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    alert(result.error);
                } else {
                    alert(result.message);
                    fetchAndDisplayScheduleDetails(); // Refresh the table after deletion
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Initial fetch and display of schedule details
    fetchAndDisplayScheduleDetails();
});