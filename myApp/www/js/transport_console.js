document.addEventListener('deviceready', function () {
    console.log("Device is ready");

    const locationModal = document.getElementById('locationModal');
    const enableLocationBtn = document.getElementById('enableLocationBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Check location permissions and status on load
    checkLocationPermissionsAndServices();

    enableLocationBtn.addEventListener('click', function () {
        console.log("Enable Location button clicked");
        cordova.plugins.diagnostic.switchToLocationSettings();
        hideLocationSettingsPrompt();
    });

    cancelBtn.addEventListener('click', function () {
        console.log("Cancel button clicked");
        hideLocationSettingsPrompt();
        redirectToLogin();
    });

    function checkLocationPermissionsAndServices() {
        const permissions = cordova.plugins.permissions;
        const requiredPermissions = [
            permissions.ACCESS_FINE_LOCATION,
            permissions.ACCESS_COARSE_LOCATION
        ];

        console.log("Checking permissions...");
        permissions.checkPermission(requiredPermissions, (status) => {
            console.log("Permissions status:", status);
            if (!status.hasPermission) {
                console.log("Permissions not granted, requesting permissions...");
                permissions.requestPermissions(requiredPermissions, (status) => {
                    if (!status.hasPermission) {
                        alert("Permission denied. The app needs location permissions to function properly.");
                        redirectToLogin();
                    } else {
                        checkLocationServices();
                    }
                }, (error) => {
                    console.error("Error requesting permissions", error);
                    redirectToLogin();
                });
            } else {
                checkLocationServices();
            }
        }, (error) => {
            console.error("Error checking permissions", error);
            redirectToLogin();
        });
    }

    function checkLocationServices() {
        console.log("Checking location services...");
        cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
            if (enabled) {
                console.log("Location services are enabled");
                onDeviceReady(); // Call the existing onDeviceReady function
            } else {
                console.log("Location services are disabled, showing prompt...");
                showLocationSettingsPrompt();
            }
        }, function (error) {
            console.error("The following error occurred: " + error);
            redirectToLogin();
        });
    }

    function showLocationSettingsPrompt() {
        console.log("Showing location settings prompt");
        locationModal.style.display = 'flex';
    }

    function hideLocationSettingsPrompt() {
        console.log("Hiding location settings prompt");
        locationModal.style.display = 'none';
    }

    function redirectToLogin() {
        console.log("Redirecting to login page");
        window.location.href = './index.html'; // Adjust the path as needed
    }

    // Existing onDeviceReady function
    onDeviceReady();
});

// Existing onDeviceReady function
function onDeviceReady() {
    console.log("Device is ready");

    if (typeof cordova !== 'undefined') {
        const permissions = cordova.plugins.permissions;
        const requiredPermissions = [
            permissions.ACCESS_FINE_LOCATION,
            permissions.ACCESS_COARSE_LOCATION
        ];

        permissions.checkPermission(requiredPermissions, (status) => {
            console.log("Checking permissions");
            if (!status.hasPermission) {
                console.log("Permissions not granted, requesting permissions");
                permissions.requestPermissions(requiredPermissions, (status) => {
                    if (!status.hasPermission) {
                        alert("Permission denied. The app needs location permissions to function properly.");
                    } else {
                        console.log("Permissions granted");
                        checkLocationServices();
                    }
                }, (error) => {
                    console.error("Error requesting permissions", error);
                });
            } else {
                console.log("Permissions already granted");
                checkLocationServices();
            }
        }, (error) => {
            console.error("Error checking permissions", error);
        });
    } else {
        checkLocationServices();
    }
}

function checkLocationServices() {
    cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
        if (enabled) {
            initializeApp();
        } else {
            showLocationSettingsPrompt();
        }
    }, function (error) {
        console.error("The following error occurred: " + error);
    });
}

function showLocationSettingsPrompt() {
    alert("Location services are disabled. Please enable them to use this app.");
    cordova.plugins.diagnostic.switchToLocationSettings();
}

function initializeApp() {
    console.log("Initializing app");

    const driverConsole = document.getElementById('driver-console');
    const driverDetailsScreen = document.getElementById('driver-details-screen');
    const detailedDriverList = document.getElementById('detailed-driver-list');
    const driverNameField = document.getElementById('driver-name');
    const vehicleNoField = document.getElementById('vehicle-no');
    const vehicleCapacityField = document.getElementById('vehicle-capacity');
    const conductorNameField = document.getElementById('conductor-name');
    const buttonCard = document.querySelector('.button-card');
    const selectedShiftField = document.getElementById('selected-shift');
    const totalStopsField = document.getElementById('total-stops');
    const totalStudentsField = document.getElementById('total-students');
    const searchBar = document.getElementById('search-bar');

    // Shift GIFs
    const shiftGifs = {
        'Morning': './img/morning.gif',
        'Afternoon': './img/afternoon.gif'
    };

    let token = localStorage.getItem('token');
    let refreshToken = localStorage.getItem('refreshToken');
    let dbCredentials = JSON.parse(localStorage.getItem('dbCredentials'));
    let driverName = localStorage.getItem('driverName');
    let routeStops = []; // Store route stops
    let studentsData = []; // Store the fetched students data
    let currentShiftName = ''; // Store the current shift name

    if (!dbCredentials) {
        console.error('Database credentials not found in local storage.');
        alert('Session expired. Please log in again.');
        window.location.href = './index.html';
        return;
    }

    const showSpinner = () => {
        const spinnerContainer = document.getElementById('spinnerContainer');
        spinnerContainer.style.display = 'flex'; // Show spinner container
    };

    const hideSpinner = () => {
        const spinnerContainer = document.getElementById('spinnerContainer');
        spinnerContainer.style.display = 'none'; // Hide spinner container
    };

    const fetchDriverDetails = async () => {
        showSpinner();
        try {
            const response = await fetch(`https://schoolix.saasifyapp.com/android/driver-details?driverName=${driverName}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'db-host': dbCredentials.host,
                    'db-user': dbCredentials.user,
                    'db-password': dbCredentials.password,
                    'db-database': dbCredentials.database
                }
            });

            if (!response.ok) {
                if (response.status === 500 || response.status === 404) {
                    throw new Error('Unauthorized Login. Please contact the school admin.');
                }
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Fetched ${data.length} item(s)`); // Log the count of items fetched
            displayDriverDetails(data);
        } catch (error) {
            console.error('Error fetching driver details:', error);
            alert('Unauthorized Login. Please contact the school admin.');
            window.location.href = './index.html'; // Redirect to the login page
        } finally {
            hideSpinner();
        }
    };

    const displayDriverDetails = (data) => {
        if (data.length > 0) {
            const details = data[0]; // Use the first entry to populate the fields
            driverNameField.textContent = details.driver_name;
            vehicleNoField.textContent = details.vehicle_no;
            vehicleCapacityField.textContent = details.vehicle_capacity || 'N/A';
            conductorNameField.textContent = details.conductor_name || 'N/A';

            // Clear existing buttons
            buttonCard.innerHTML = '';

            // Determine the shifts available
            const shifts = new Set(data.map(entry => entry.shift_name.trim()));
            console.log('Available shifts:', shifts); // Debugging line

            // Create buttons based on available shifts
            let shiftIndex = 1;
            shifts.forEach(shift => {
                const shiftButton = document.createElement('div');
                shiftButton.classList.add('shift-button');
                shiftButton.innerHTML = `
                    <img src="${shiftGifs[shiftIndex === 1 ? 'Morning' : 'Afternoon']}" alt="Shift GIF" class="shift-gif">
                    <span>${shift} Shift</span>
                `;
                shiftButton.addEventListener('click', () => {
                    // Clear previous data and show spinner immediately
                    detailedDriverList.innerHTML = '';
                    showSpinner();
                    searchBar.value = ''; // Clear the search field when switching shifts

                    fetchDriverListForShift(shift).then(() => {
                        fetchShiftDetails(shift); // Fetch shift details after fetching the driver list
                        const driverConsole = document.getElementById('driver-console');
                        const driverDetailsScreen = document.getElementById('driver-details-screen');
                        console.log('driverConsole:', driverConsole);
                        console.log('driverDetailsScreen:', driverDetailsScreen);
                        if (driverConsole && driverDetailsScreen) {
                            driverConsole.classList.add('hidden');
                            driverDetailsScreen.classList.remove('hidden');
                        } else {
                            console.error('driverConsole or driverDetailsScreen element not found');
                        }
                    }).catch(error => {
                        console.error('Error fetching driver list for shift:', error);
                        hideSpinner();
                        alert('Error fetching driver list. Please try again.');
                    });
                });
                buttonCard.appendChild(shiftButton);
                shiftIndex++;
            });
        } else {
            alert('No details found for the driver.');
        }
    };

    const fetchDriverListForShift = async (shift) => {
        try {
            const vehicleNo = vehicleNoField.textContent;
            const shiftName = shift;
    
            console.log(`Fetching driver list for shift: ${shiftName}, vehicleNo: ${vehicleNo}`);
    
            let response = await fetch(`https://schoolix.saasifyapp.com/android/get-student-details?vehicleNo=${vehicleNo}&shiftName=${shiftName}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'db-host': dbCredentials.host,
                    'db-user': dbCredentials.user,
                    'db-password': dbCredentials.password,
                    'db-database': dbCredentials.database
                }
            });
    
            if (response.status === 401) {
                console.log('Token expired. Attempting to refresh token...');
                const refreshResponse = await fetch('https://schoolix.saasifyapp.com/refresh-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: refreshToken })
                });
    
                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    token = refreshData.accessToken;
    
                    console.log('Token refreshed successfully. Retrying fetch for driver list...');
                    response = await fetch(`https://schoolix.saasifyapp.com/android/get-student-details?vehicleNo=${vehicleNo}&shiftName=${shiftName}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'db-host': dbCredentials.host,
                            'db-user': dbCredentials.user,
                            'db-password': dbCredentials.password,
                            'db-database': dbCredentials.database
                        }
                    });
                } else {
                    console.error('Failed to refresh token. Redirecting to login...');
                    alert('Session expired. Please log in again.');
                    window.location.href = './index.html';
                    return;
                }
            }
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch student details. Status: ${response.status}, Error: ${errorText}`);
                throw new Error('Failed to fetch student details');
            }
    
            const data = await response.json();
            console.log(`Fetched ${data.length} item(s)`); // Log the count of items fetched
            studentsData = data; // Store the fetched students data
            displayDriverList(data);
        } catch (error) {
            console.error('Error fetching student details:', error);
            alert('Error fetching student details');
        } finally {
            hideSpinner();
        }
    };

    const fetchShiftDetails = async (shift) => {
        try {
            const response = await fetch(`https://schoolix.saasifyapp.com/android/shift-details?driverName=${driverName}&shiftName=${shift}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'db-host': dbCredentials.host,
                    'db-user': dbCredentials.user,
                    'db-password': dbCredentials.password,
                    'db-database': dbCredentials.database
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch shift details');
            }

            const data = await response.json();
            console.log(`Fetched shift details:`, data); // Log the shift details fetched
            displayShiftDetails(data);
            routeStops = data.route_stops.split(', '); // Store route stops
        } catch (error) {
            console.error('Error fetching shift details:', error);
            alert('Error fetching shift details');
        } finally {
            hideSpinner();
        }
    };

    const displayShiftDetails = (data) => {
        selectedShiftField.textContent = data.shift_name;
        totalStopsField.textContent = data.route_stops_count;
        totalStudentsField.textContent = data.students_tagged;
        currentShiftName = data.shift_name; // Store the current shift name
    };

    const displayDriverList = (data) => {
        // Clear previous list
        detailedDriverList.innerHTML = '';
    
        if (!data || data.length === 0) {
            console.warn('No data available to display.');
            return;
        }
    
        // Group students and teachers by routes
        const groupedByRoute = data.reduce((acc, item) => {
            const route = item.transport_pickup_drop;
            if (!acc[route]) {
                acc[route] = [];
            }
            acc[route].push(item);
            return acc;
        }, {});
    
        // Sort routes based on routeStops order
        const sortedRoutes = Object.keys(groupedByRoute).sort((a, b) => {
            return routeStops.indexOf(a) - routeStops.indexOf(b);
        });
    
        // Colors for different routes
        const routeColors = ['#ffdddd', '#ddffdd', '#ddddff', '#ffffdd', '#ddffff', '#ffddff'];
    
        // Render each route and its students/teachers
        sortedRoutes.forEach((route, index) => {
            // Create a route container
            const routeContainer = document.createElement('div');
            routeContainer.classList.add('route-container');
            routeContainer.style.backgroundColor = routeColors[index % routeColors.length];
    
            // Create a route header with student/teacher count
            const studentCount = groupedByRoute[route].filter(item => item.class !== 'Teacher').length;
            const teacherCount = groupedByRoute[route].filter(item => item.class === 'Teacher').length;
            const routeHeader = document.createElement('h3');
            routeHeader.textContent = `Stop: ${route} | Students: ${studentCount} | Teachers: ${teacherCount}`;
            routeContainer.appendChild(routeHeader);
    
            // Create a list for the students/teachers
            const list = document.createElement('ul');
            list.classList.add('student-list');
    
            // Render students/teachers for this route
            groupedByRoute[route].forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="item-content">
                        <p>Name: ${item.name}</p>
                        <p>Class: ${item.class}</p>
                        <p>Contact: ${item.f_mobile_no}</p>
                        <p>Pickup-Drop: ${item.transport_pickup_drop}</p>
                    </div>
                    <div class="button-group">
                        <button class="not-picked">
                            <img src="./img/not_pick.png" alt="Not Picked">
                            <span>Not Picked</span>
                        </button>
                        <button class="not-dropped">
                            <img src="./img/not_drop.png" alt="Not Dropped">
                            <span>Not Dropped</span>
                        </button>
                        <button class="call-button">
                            <img src="./img/call.png" alt="Call">
                            <span>Call</span>
                        </button>
                    </div>
                `;
                list.appendChild(listItem);
    
                // Event listener for "Not Picked" button
                listItem.querySelector('.not-picked')?.addEventListener('click', async () => {
                    console.log(`Not Picked button clicked for ${item.name}`);
                    const standard = item.class === 'Teacher' ? 'Teacher' : item.class; // Check if class is "Teacher"
                    const result = await logPickDropEvent(item.name, item.transport_pickup_drop, 'not_picked', currentShiftName, standard);
                    if (result === 'exists') {
                        alert('Already marked under not_picked category for today');
                    } else {
                        alert(`${item.name} not picked`);
                    }
                });
    
                // Event listener for "Not Dropped" button
                listItem.querySelector('.not-dropped')?.addEventListener('click', async () => {
                    console.log(`Not Dropped button clicked for ${item.name}`);
                    const standard = item.class === 'Teacher' ? 'Teacher' : item.class; // Check if class is "Teacher"
                    const result = await logPickDropEvent(item.name, item.transport_pickup_drop, 'not_dropped', currentShiftName, standard);
                    if (result === 'exists') {
                        alert('Already marked under not_dropped category for today');
                    } else {
                        alert(`${item.name} not dropped`);
                    }
                });
    
                listItem.querySelector('.call-button')?.addEventListener('click', () => {
                    console.log(`Call button clicked for ${item.name}`);
                    window.location.href = `tel:${item.f_mobile_no}`;
                });
            });
    
            // Append the list to the route container
            routeContainer.appendChild(list);
    
            // Append the route container to the detailed driver list
            detailedDriverList.appendChild(routeContainer);
        });
    };
    

    // Search functionality
    searchBar.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredData = studentsData.filter(student =>
            student.name.toLowerCase().includes(searchTerm) ||
            student.class.toLowerCase().includes(searchTerm) ||
            student.f_mobile_no.toLowerCase().includes(searchTerm) ||
            student.transport_pickup_drop.toLowerCase().includes(searchTerm)
        );
        displayDriverList(filteredData);
    });

    fetchDriverDetails();

    // Function to send coordinates to the database
    const sendCoordinates = async (latitude, longitude, driverName, vehicleNumber) => {
        try {
            const response = await fetch('https://schoolix.saasifyapp.com/android/send-coordinates', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'db-host': dbCredentials.host,
                    'db-user': dbCredentials.user,
                    'db-password': dbCredentials.password,
                    'db-database': dbCredentials.database
                },
                body: JSON.stringify({
                    driverName: driverName,
                    vehicleNumber: vehicleNumber,
                    latitude: latitude,
                    longitude: longitude
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to send coordinates: ${response.status}`);
            }

            const data = await response.json();
            console.log('Coordinates sent successfully:', data);
        } catch (error) {
            console.error('Error sending coordinates:', error);
        }
    };

    // Function to get the current location
    const getCurrentLocation = () => {
        if (typeof cordova !== 'undefined' && cordova.plugins && cordova.plugins.geolocation) {
            cordova.plugins.geolocation.getCurrentPosition(async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                console.log('Coordinates:', latitude, longitude);

                // Assuming you have fetched the driver's details before
                const driverName = driverNameField.textContent;
                const vehicleNumber = vehicleNoField.textContent;

                // Send coordinates to the server
                await sendCoordinates(latitude, longitude, driverName, vehicleNumber);
            }, (error) => {
                console.error('Error getting location:', error);
            }, {
                enableHighAccuracy: true
            });
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                console.log('Coordinates:', latitude, longitude);

                // Assuming you have fetched the driver's details before
                const driverName = driverNameField.textContent;
                const vehicleNumber = vehicleNoField.textContent;

                // Send coordinates to the server
                await sendCoordinates(latitude, longitude, driverName, vehicleNumber);
            }, (error) => {
                console.error('Error getting location:', error);
            }, {
                enableHighAccuracy: true
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    // Function to start sending coordinates every 2 minutes
    const startSendingCoordinates = () => {
        // Call the location function every 2 minutes (120000 milliseconds)
        setInterval(getCurrentLocation, 120000);

        // Trigger it immediately as well
        getCurrentLocation();
    };

    // After successfully fetching driver details, start sending coordinates
    fetchDriverDetails().then(() => {
        startSendingCoordinates(); // Start sending the coordinates every 2 minutes
    });


    const logPickDropEvent = async (studentName, pickDropLocation, typeOfLog, shift, standard) => {
        const vehicleNo = vehicleNoField.textContent;
        const driverName = driverNameField.textContent;

        try {
            const response = await fetch('https://schoolix.saasifyapp.com/android/log-pick-drop-event', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'db-host': dbCredentials.host,
                    'db-user': dbCredentials.user,
                    'db-password': dbCredentials.password,
                    'db-database': dbCredentials.database
                },
                body: JSON.stringify({
                    studentName: studentName,
                    pickDropLocation: pickDropLocation,
                    typeOfLog: typeOfLog,
                    vehicleNo: vehicleNo,
                    driverName: driverName,
                    shift: shift,
                    standard: standard
                }),
            });

            if (response.status === 409) {
                return 'exists';
            }

            if (!response.ok) {
                throw new Error(`Failed to log event: ${response.status}`);
            }

            const data = await response.json();
            console.log('Event logged successfully:', data);
            return 'success';
        } catch (error) {
            console.error('Error logging event:', error);
            return 'error';
        }
    };
}
