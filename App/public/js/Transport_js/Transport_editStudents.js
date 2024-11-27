let debounceTimer;

// Function to fetch search suggestions from the endpoint
async function fetchSearchSuggestions(query) {
    try {
        const response = await fetch('/fetch-student-suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching search suggestions:', error);
        return [];
    }
}

// Function to display search suggestions
async function displaySearchSuggestions() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const searchInput = document.getElementById('searchbyNamoeorGr');
        const searchSuggestionsContainer = document.getElementById('searchsuggestions');

        // Show suggestion box
        searchSuggestionsContainer.style.display = "block";
        const query = searchInput.value.trim();  // Treat query as is (text or number)

        if (query === '') {
            searchSuggestionsContainer.innerHTML = '';
            searchSuggestionsContainer.style.display = 'none';
            return; // Exit if query is empty
        }

        // Fetch suggestions from the server
        showLoading(searchSuggestionsContainer);
        const suggestions = await fetchSearchSuggestions(query);
        filterAndDisplaySearchSuggestions(query, suggestions, searchSuggestionsContainer);
    }, 300); // Adjust debounce delay as necessary
}

// Function to filter and display search suggestions
function filterAndDisplaySearchSuggestions(query, suggestions, suggestionsContainer) {
    const isNumericQuery = !isNaN(query);
    const filteredSuggestions = suggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(query.toLowerCase()) || 
        (isNumericQuery && suggestion.gr_no === parseInt(query, 10))
    );
    suggestionsContainer.innerHTML = '';

    if (filteredSuggestions.length > 0) {
        filteredSuggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = `${suggestion.name} (${suggestion.gr_no})`;
            suggestionItem.dataset.value = JSON.stringify(suggestion);  // Store the full suggestion data in a hidden attribute
            suggestionsContainer.appendChild(suggestionItem);
        });

        // Add event listeners for selection
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function () {
                const searchInput = document.getElementById('searchbyNamoeorGr');
                searchInput.value = this.textContent;  // Display the selected value
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'none';

                // Call function to fill form details based on selected suggestion
                fillFormDetails(JSON.parse(this.dataset.value));
            });
        });

    } else {
        showNoResults(suggestionsContainer);
    }
}

// Function to fill form details based on selected suggestion
function fillFormDetails(selectedValue) {
    // Fill form inputs with the selected suggestion data
    document.getElementById('editGrNo').value = selectedValue.gr_no;
    document.getElementById('editStudentName').value = selectedValue.name;
    document.getElementById('editClass').value = selectedValue.standard;
    document.getElementById('editDivision').value = selectedValue.division;
    document.getElementById('editPickDropAddress').value = selectedValue.transport_pickup_drop;
    document.getElementById('editVehicleTagged').value = selectedValue.transport_tagged;
}

// Function to display loading suggestions
function showLoading(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const loadingItem = document.createElement('div');
    loadingItem.classList.add('suggestion-item', 'no-results');
    loadingItem.textContent = 'Loading...';
    suggestionsContainer.appendChild(loadingItem);
    suggestionsContainer.style.display = "block";
}

// Utility function to display no results found message
function showNoResults(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const noResultsItem = document.createElement('div');
    noResultsItem.classList.add('suggestion-item', 'no-results');
    noResultsItem.textContent = 'No results found';
    suggestionsContainer.appendChild(noResultsItem);
}

// Initialization of search suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById('searchbyNamoeorGr');
    const searchSuggestionsContainer = document.getElementById('searchsuggestions');

    // Add event listeners for input, focus, and click events
    searchInput.addEventListener('input', displaySearchSuggestions);
    searchInput.addEventListener('focus', displaySearchSuggestions);
    searchInput.addEventListener('click', displaySearchSuggestions);

    document.addEventListener('click', function (event) {
        if (!searchSuggestionsContainer.contains(event.target) && !searchInput.contains(event.target)) {
            searchSuggestionsContainer.style.display = 'none';
        }
    });
});


////////////////////////////////////// POPULATE VEHICLE SUGGESTIONS //////////////////

// Cache for vehicle running suggestions for edit student overlay
let editVehicleRunningFetched = false;
let editVehicleRunningCache = [];
let selectedDriverName = ''; // Variable to store the driver name

// Function to display vehicle running suggestions for edit student overlay
function displayEditVehicleRunningSuggestions() {
    const vehicleRunningInput = document.getElementById('editVehicleTagged');
    const vehicleRunningSuggestionsContainer = document.getElementById('edit_vehiclesuggestions');

    // Show suggestion box
    vehicleRunningSuggestionsContainer.style.display = "block";
    const query = vehicleRunningInput.value.toLowerCase().trim();

    // Check the value in pickDropAddress before calling the API
    const routeStops = document.getElementById('editPickDropAddress').value.trim();
    const classesAllotted = `${document.getElementById('editClass').value.trim()} ${document.getElementById('editDivision').value.trim()}`;

    if (!routeStops || !classesAllotted) {
        vehicleRunningSuggestionsContainer.innerHTML = '';
        showNoResults(vehicleRunningSuggestionsContainer);
        return;
    }

    if (!editVehicleRunningFetched) {
        showLoading(vehicleRunningSuggestionsContainer);

        fetch('/getVehicleRunning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classesAllotted, routeStops })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    editVehicleRunningCache = data.vehicles;
                    editVehicleRunningFetched = true;
                    filterAndDisplayEditVehicleRunning(query, vehicleRunningSuggestionsContainer, vehicleRunningInput);
                } else {
                    showNoResults(vehicleRunningSuggestionsContainer);
                }
            })
            .catch(error => {
                console.error('Error fetching vehicle data:', error);
                vehicleRunningSuggestionsContainer.style.display = "none";
            });
    } else {
        filterAndDisplayEditVehicleRunning(query, vehicleRunningSuggestionsContainer, vehicleRunningInput);
    }
}

// Function to filter and display vehicle running suggestions for edit student overlay
function filterAndDisplayEditVehicleRunning(query, suggestionsContainer, vehicleRunningInput) {
    const filteredVehicles = editVehicleRunningCache.filter(vehicle =>
        vehicle.vehicle_no.toLowerCase().includes(query) ||
        vehicle.driver_name.toLowerCase().includes(query)
    );
    suggestionsContainer.innerHTML = '';

    if (filteredVehicles.length > 0) {
        filteredVehicles.forEach(vehicle => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = `${vehicle.vehicle_no} | ${vehicle.driver_name}`;
            suggestionItem.dataset.value = vehicle.vehicle_no;
            suggestionItem.dataset.driver = vehicle.driver_name; // Store the driver name in the dataset
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    // Add event listeners for selection
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            vehicleRunningInput.value = this.dataset.value;
            selectedDriverName = this.dataset.driver; // Store the selected driver name
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";
        });
    });
}

// Initialization of vehicle running suggestion box for edit student overlay
document.addEventListener("DOMContentLoaded", function() {
    const vehicleRunningInput = document.getElementById('editVehicleTagged');
    const vehicleRunningSuggestionsContainer = document.getElementById('edit_vehiclesuggestions');

    // Add event listeners for input, focus, and click events
    vehicleRunningInput.addEventListener('input', displayEditVehicleRunningSuggestions);
    vehicleRunningInput.addEventListener('focus', displayEditVehicleRunningSuggestions);
    vehicleRunningInput.addEventListener('click', displayEditVehicleRunningSuggestions);

    document.addEventListener('click', function(event) {
        if (!vehicleRunningSuggestionsContainer.contains(event.target) && !vehicleRunningInput.contains(event.target)) {
            vehicleRunningSuggestionsContainer.style.display = 'none';
        }
    });
});

// Function to handle the update button click
function handleUpdateButtonClick() {
    const grNo = document.getElementById('editGrNo').value.trim();
    const studentName = document.getElementById('editStudentName').value.trim();
    const standard = document.getElementById('editClass').value.trim();
    const division = document.getElementById('editDivision').value.trim();
    const vehicleTagged = document.getElementById('editVehicleTagged').value.trim();

    if (!grNo || !studentName || !standard || !division || !vehicleTagged) {
        Swal.fire({
            icon: 'warning',
            title: 'Incomplete Information',
            text: 'Please fill in all fields before updating.'
        });
        return;
    }

    const payload = {
        grNo,
        studentName,
        standard,
        division,
        vehicleTagged
    };

    fetch('/updateStudentTransport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Update Successful',
                    html: `Transport for student <b>${studentName}</b> updated successfully to <b>${vehicleTagged} | ${selectedDriverName}</b>`
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: 'Failed to update transport tagged: ' + data.message
                });
            }
        })
        .catch(error => {
            console.error('Error updating transport tagged:', error);
            Swal.fire({
                icon: 'error',
                title: 'An Error Occurred',
                text: 'An error occurred while updating transport tagged.'
            });
        });
}

// Add event listener to the update button
document.addEventListener("DOMContentLoaded", function () {
    const updateButton = document.getElementById('updateStudentButton');
    updateButton.addEventListener('click', handleUpdateButtonClick);
});

// Function to display loading suggestions
function showLoading(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const loadingItem = document.createElement('div');
    loadingItem.classList.add('suggestion-item', 'no-results');
    loadingItem.textContent = 'Loading...';
    suggestionsContainer.appendChild(loadingItem);
    suggestionsContainer.style.display = "block";
}

// Utility function to display no results found message
function showNoResults(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const noResultsItem = document.createElement('div');
    noResultsItem.classList.add('suggestion-item', 'no-results');
    noResultsItem.textContent = 'No results found';
    suggestionsContainer.appendChild(noResultsItem);
}