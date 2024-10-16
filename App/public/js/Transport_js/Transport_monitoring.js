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

    document.getElementById('closeTransportMonitoringOverlay').addEventListener('click', () => {
        transportMonitoringOverlay.style.display = 'none';
    });
});