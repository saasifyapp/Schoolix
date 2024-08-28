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
                            data.forEach((driver) => {
                                const suggestionItem = document.createElement("div");
                                suggestionItem.classList.add("suggestion-item");
                                suggestionItem.textContent = `${driver.vehicle_no} | ${driver.name}`;
                                suggestionItem.dataset.id = driver.vehicle_no; // Use vehicle_no as ID
                                vehicleDetailsMap.set(driver.vehicle_no, driver);
                                vehicleNoSuggestionBox.appendChild(suggestionItem);
                            });
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
            vehicleNoInput.value = selectedDetails.vehicle_no;

            // Check and log the properties of the selectedDetails object
            console.log('Selected driver details properties:', Object.keys(selectedDetails));

            vehicleInformationBox.innerHTML = `
                <p>Driver: ${selectedDetails.name || 'N/A'}</p>
                <p>Vehicle No: ${selectedDetails.vehicle_no || 'N/A'}</p>
                <p>Vehicle Type: ${selectedDetails.vehicle_type || 'N/A'}</p>
                <p>Vehicle Capacity: ${selectedDetails.vehicle_capacity || 'N/A'}</p>
                <p>Contact: ${selectedDetails.contact || 'N/A'}</p>
                <p>Address: ${selectedDetails.address || 'N/A'}</p>
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
});