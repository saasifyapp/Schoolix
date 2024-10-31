document.addEventListener('deviceready', function () {
    console.log("Device is ready");

    const locationModal = document.getElementById('locationModal');
    const enableLocationBtn = document.getElementById('enableLocationBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Show spinner initially
    const showSpinner = () => {
        const spinnerContainer = document.getElementById('spinnerContainer');
        spinnerContainer.style.display = 'flex'; // Show spinner container
    };

    const hideSpinner = () => {
        const spinnerContainer = document.getElementById('spinnerContainer');
        spinnerContainer.style.display = 'none'; // Hide spinner container
    };

    // Spinner stays active until location permissions and services are checked
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
                initializeApp(); // Call the initializeApp function
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

    const showSpinner = () => {
        const spinnerContainer = document.getElementById('spinnerContainer');
        spinnerContainer.style.display = 'flex'; // Show spinner container
    };

    const hideSpinner = () => {
        const spinnerContainer = document.getElementById('spinnerContainer');
        spinnerContainer.style.display = 'none'; // Hide spinner container
    };

    if (typeof cordova !== 'undefined') {
        const permissions = cordova.plugins.permissions;
        const requiredPermissions = [
            permissions.ACCESS_FINE_LOCATION,
            permissions.ACCESS_COARSE_LOCATION
        ];

        showSpinner(); // Show spinner while checking permissions

        permissions.checkPermission(requiredPermissions, (status) => {
            console.log("Checking permissions");
            if (!status.hasPermission) {
                console.log("Permissions not granted, requesting permissions");
                permissions.requestPermissions(requiredPermissions, (status) => {
                    if (!status.hasPermission) {
                        alert("Permission denied. The app needs location permissions to function properly.");
                        hideSpinner(); // Hide spinner if permissions are not granted
                    } else {
                        console.log("Permissions granted");
                        checkLocationServices();
                    }
                }, (error) => {
                    console.error("Error requesting permissions", error);
                    hideSpinner(); // Hide spinner in case of error
                });
            } else {
                console.log("Permissions already granted");
                checkLocationServices();
            }
        }, (error) => {
            console.error("Error checking permissions", error);
            hideSpinner(); // Hide spinner in case of error
        });
    } else {
        checkLocationServices();
    }
}

function checkLocationServices() {
    console.log("Checking location services...");
    cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
        if (enabled) {
            initializeApp();
        } else {
            showLocationSettingsPrompt();
            hideSpinner(); // Hide spinner if location services are disabled
        }
    }, function (error) {
        console.error("The following error occurred: " + error);
        hideSpinner(); // Hide spinner in case of error
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

function initializeApp() {
    console.log("Initializing app");

    const driverConsole = document.getElementById('driver-console');
    const driverNameField = document.getElementById('driver-name');
    const vehicleNoField = document.getElementById('vehicle-no');
    const vehicleCapacityField = document.getElementById('vehicle-capacity');
    const conductorNameField = document.getElementById('conductor-name');
    const buttonCard = document.querySelector('.button-card');

    // Shift GIFs
    const shiftGifs = {
        'Morning': './img/morning.gif',
        'Afternoon': './img/afternoon.gif'
    };

    let token = localStorage.getItem('token');
    let refreshToken = localStorage.getItem('refreshToken');
    let dbCredentials = JSON.parse(localStorage.getItem('dbCredentials'));
    let driverName = localStorage.getItem('driverName');

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
    
            // Store vehicleNo in local storage
            localStorage.setItem('vehicleNo', details.vehicle_no);
    
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
                    localStorage.setItem('currentShift', shift);
                    window.location.href = './transport_getStudents.html';
                });
                buttonCard.appendChild(shiftButton);
                shiftIndex++;
            });
        } else {
            alert('No details found for the driver.');
        }
    };

    fetchDriverDetails().then(() => {
        startSendingCoordinates(); // Start sending the coordinates every 2 minutes
    });

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
}