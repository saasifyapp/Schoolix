document.addEventListener('DOMContentLoaded', async () => {
    const transportMonitoringOverlay = document.getElementById('transportMonitoringOverlay');
    let map;
    let vehicleMarkers = {}; // Object to store vehicle markers by vehicle number
    let vehicleRoutes = {}; // Object to store routes by vehicle number
    let schoolCoordinates = { latitude: 0, longitude: 0 }; // Placeholder for school coordinates

    // Helper function to read cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Get school name from cookie and decode the URI component
    const schoolName = decodeURIComponent(getCookie('schoolName')) || 'School';

    // Fetch school's location from the server
    async function fetchSchoolLocation() {
        try {
            const response = await fetch('/getSchoolLocation');
            const data = await response.json();
            if (response.ok) {
                schoolCoordinates = { latitude: data.fixed_latitude, longitude: data.fixed_longitude };
            } else {
                console.error('Error fetching school location:', data.error);
            }
        } catch (error) {
            console.error('Error fetching school location:', error);
        }
    }

    await fetchSchoolLocation(); // Fetch school location before initializing the map

    function initializeMap() {
        if (map) {
            map.invalidateSize(); // Ensure map is resized correctly
            return;
        }

        map = L.map('map').setView([schoolCoordinates.latitude, schoolCoordinates.longitude], 15); // Centered on the school

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add school marker
        const schoolIcon = L.icon({
            iconUrl: '/images/schoolIcon.png', // Replace with the path to your school icon
            iconSize: [50, 50],
            iconAnchor: [25, 50],
            popupAnchor: [0, -50]
        });

        const schoolMarker = L.marker([schoolCoordinates.latitude, schoolCoordinates.longitude], { icon: schoolIcon })
            .addTo(map)
            .bindPopup(`<b>${schoolName} Location</b>`);

        // Display school popup on hover
        schoolMarker.on('mouseover', function () {
            this.openPopup();
        });
        schoolMarker.on('mouseout', function () {
            this.closePopup();
        });

        fetchDataAndUpdateMap();
        setInterval(fetchDataAndUpdateMap, 120000); // Fetch and update map every 2 minutes
    }

    async function fetchDataAndUpdateMap() {
        try {
            const response = await fetch('/fetch-all-coordinates');
            const data = await response.json();

            if (response.ok) {
                let bounds = [];

                for (const { latitude, longitude, name, vehicle_no } of data) {
                    const vehicleLatLng = [latitude, longitude];

                    // Fetch locality name using reverse geocoding
                    const localityName = await getLocalityName(latitude, longitude);
                    const popupContent = `<b>${name}</b><br>Vehicle No: ${vehicle_no}<br>Location: ${localityName}`;

                    // Update existing marker or create a new one
                    if (vehicleMarkers[vehicle_no]) {
                        vehicleMarkers[vehicle_no].setLatLng(vehicleLatLng);
                        vehicleMarkers[vehicle_no].getPopup().setContent(popupContent);

                        // Remove existing route
                        if (vehicleRoutes[vehicle_no]) {
                            map.removeControl(vehicleRoutes[vehicle_no]);
                        }
                    } else {
                        const customIcon = L.icon({
                            iconUrl: '/images/busIcon.png',
                            iconSize: [50, 50],
                            iconAnchor: [25, 50],
                            popupAnchor: [0, -50]
                        });

                        const marker = L.marker(vehicleLatLng, { icon: customIcon })
                            .addTo(map)
                            .bindPopup(popupContent);

                        marker.on('mouseover', function () {
                            this.openPopup();
                        });
                        marker.on('mouseout', function () {
                            this.closePopup();
                        });

                        vehicleMarkers[vehicle_no] = marker;
                    }

                    // Create new route
                    const route = L.Routing.control({
                        waypoints: [
                            L.latLng(latitude, longitude),
                            L.latLng(schoolCoordinates.latitude, schoolCoordinates.longitude)
                        ],
                        createMarker: () => { return null; },
                        routeWhileDragging: false,
                        addWaypoints: false,
                        draggableWaypoints: false,
                        lineOptions: {
                            styles: [{ color: '#00008B', weight: 8, opacity: 1.0 }] // Dark blue color
                        },
                        fitSelectedRoutes: false,
                        show: false // Hide the route instructions panel
                    }).addTo(map);

                    vehicleRoutes[vehicle_no] = route;

                    bounds.push(vehicleLatLng);
                }

                // Add school coordinates to bounds
                bounds.push([schoolCoordinates.latitude, schoolCoordinates.longitude]);

                // Center map on the vehicle locations
                if (bounds.length > 0) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } else {
                console.error('Error fetching coordinates:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function getLocalityName(latitude, longitude) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            return data.address.neighbourhood || data.address.suburb || data.address.city || data.address.town || data.address.village || 'Unknown location';
        } catch (error) {
            console.error('Error fetching locality name:', error);
            return 'Unknown location';
        }
    }

    document.getElementById('trackingMonitoringButton').addEventListener('click', () => {
        transportMonitoringOverlay.style.display = 'flex';
        setTimeout(() => {
            initializeMap();
        }, 500);
    });



    ////////////////////////////////////////// EXPORT FUNCTIONALITY //////////////////////////

    document.getElementById('exportPickDropLogs').addEventListener('click', () => {
        // Get the input fields and suggestion containers from the HTML
        const sweetAlertInputs = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
            <div class="form-group" style="width: 80%; margin-bottom: 1rem;">
                <input type="text" id="swalVehicleNo" class="swal2-input" placeholder="Vehicle No" style="width: 100%; text-align: center;">
                <div id="swalVehicleSuggestions" class="suggestions"></div>
            </div>
            <div class="form-group" style="width: 80%; margin-bottom: 1rem;">
                <input type="text" id="swalShiftType" class="swal2-input" placeholder="Shift" style="width: 100%; text-align: center;">
                <div id="swalShiftSuggestions" class="suggestions"></div>
            </div>
        </div>
    `;
    
        // Trigger SweetAlert with input fields and suggestion containers
        Swal.fire({
            title: 'Export Pick-Drop Logs',
            html: sweetAlertInputs,
            showCancelButton: true,
            confirmButtonText: 'Export',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const vehicleNo = Swal.getPopup().querySelector('#swalVehicleNo').value;
                const shiftType = Swal.getPopup().querySelector('#swalShiftType').value;
                if (!vehicleNo || !shiftType) {
                    Swal.showValidationMessage(`Please enter both fields`);
                }
                return { vehicleNo, shiftType };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { vehicleNo, shiftType } = result.value;
                // Handle the export logic here using vehicleNo and shiftType
                exportPickDropLogs(vehicleNo, shiftType);
            }
        });
    
        // Add event listeners for input fields to show suggestions
        const vehicleInput = Swal.getPopup().querySelector('#swalVehicleNo');
        const vehicleSuggestionsContainer = Swal.getPopup().querySelector('#swalVehicleSuggestions');
        const shiftInput = Swal.getPopup().querySelector('#swalShiftType');
        const shiftSuggestionsContainer = Swal.getPopup().querySelector('#swalShiftSuggestions');
    
        vehicleInput.addEventListener('focus', () => fetchVehicleSuggestions('', vehicleSuggestionsContainer));
        vehicleInput.addEventListener('input', () => fetchVehicleSuggestions(vehicleInput.value, vehicleSuggestionsContainer));
        shiftInput.addEventListener('focus', () => fetchShiftSuggestions(vehicleInput.value, shiftSuggestionsContainer));
        shiftInput.addEventListener('input', () => fetchShiftSuggestions(vehicleInput.value, shiftSuggestionsContainer));
    
        // Function to fetch vehicle suggestions
        function fetchVehicleSuggestions(query, suggestionsContainer) {
            fetch(`/listStudents_getVehicleDetails?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    suggestionsContainer.style.display = 'flex'; // Show suggestions container
                    suggestionsContainer.innerHTML = '';
    
                    if (!Array.isArray(data) || data.length === 0) {
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        suggestionsContainer.appendChild(noResultsItem);
                    } else {
                        data.forEach(driver => {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.classList.add('suggestion-item');
                            suggestionItem.textContent = `${driver.vehicle_no} | ${driver.driver_name}`;
                            suggestionItem.dataset.driverName = driver.driver_name || 'N/A';
                            suggestionItem.dataset.vehicleNo = driver.vehicle_no || 'N/A';
                            suggestionsContainer.appendChild(suggestionItem);
                        });
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    
        // Function to fetch shift suggestions
        function fetchShiftSuggestions(vehicleNo, suggestionsContainer) {
            if (vehicleNo.trim() === '') {
                suggestionsContainer.style.display = 'none';
                return;
            }
    
            fetch(`/listStudents_shiftDetails?vehicleNo=${encodeURIComponent(vehicleNo)}`)
                .then(response => response.json())
                .then(data => {
                    suggestionsContainer.style.display = 'flex'; // Show suggestions container
                    suggestionsContainer.innerHTML = '';
    
                    if (!Array.isArray(data) || data.length === 0) {
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        suggestionsContainer.appendChild(noResultsItem);
                    } else {
                        data.forEach(shift => {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.classList.add('suggestion-item');
                            suggestionItem.textContent = shift.shift_name;
                            suggestionItem.dataset.shiftName = shift.shift_name;
                            suggestionItem.dataset.classesAlloted = shift.classes_alloted;
                            suggestionsContainer.appendChild(suggestionItem);
                        });
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    
        // Handle vehicle suggestion click
        vehicleSuggestionsContainer.addEventListener('click', event => {
            if (event.target.classList.contains('suggestion-item')) {
                const selectedDriver = event.target;
                vehicleInput.value = selectedDriver.dataset.vehicleNo;
                vehicleSuggestionsContainer.style.display = 'none'; // Hide suggestions container
                vehicleSuggestionsContainer.innerHTML = '';
            }
        });
    
        // Handle shift suggestion click
        shiftSuggestionsContainer.addEventListener('click', event => {
            if (event.target.classList.contains('suggestion-item')) {
                const selectedShift = event.target;
                shiftInput.value = selectedShift.dataset.shiftName;
                shiftSuggestionsContainer.style.display = 'none'; // Hide suggestions container
                shiftSuggestionsContainer.innerHTML = '';
            }
        });
    
        // Hide suggestions when clicking outside
        document.addEventListener('click', event => {
            if (!vehicleSuggestionsContainer.contains(event.target) && !vehicleInput.contains(event.target)) {
                vehicleSuggestionsContainer.style.display = 'none'; // Hide suggestions container
                vehicleSuggestionsContainer.innerHTML = '';
            }
            if (!shiftSuggestionsContainer.contains(event.target) && !shiftInput.contains(event.target)) {
                shiftSuggestionsContainer.style.display = 'none'; // Hide suggestions container
                shiftSuggestionsContainer.innerHTML = '';
            }
        });
    });
    
    // Function to handle export logic
    function exportPickDropLogs(vehicleNo, shiftType) {
        // Fetch the data from the server
        fetch(`/exportPickDropLogs?vehicleNo=${encodeURIComponent(vehicleNo)}&shiftName=${encodeURIComponent(shiftType)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire('Export Failed', 'There was an error exporting the pick-drop logs.', 'error');
                    return;
                }
    
                // Define the headers
                const headers = ["Student Name", "Pick-Drop Location", "Date of Log", "Type of Log", "Vehicle No", "Driver Name", "Shift", "Standard"];
    
                // Create CSV content
                const csvContent = "data:text/csv;charset=utf-8,"
                    + headers.join(",") + "\n"
                    + data.map(e => Object.values(e).join(",")).join("\n");
    
                const encodedUri = encodeURI(csvContent);
                const fileName = `${vehicleNo}_${shiftType}_logs.csv`;
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", fileName);
                document.body.appendChild(link); // Required for FF
    
                link.click(); // This will download the data file named dynamically
                document.body.removeChild(link);
    
                Swal.fire('Export Successful', 'The pick-drop logs have been exported successfully.', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('Export Failed', 'There was an error exporting the pick-drop logs.', 'error');
            });
    }
    ///////////////////////////////////////////////////


    document.getElementById('closeTransportMonitoringOverlay').addEventListener('click', () => {
        transportMonitoringOverlay.style.display = 'none';
    });
});