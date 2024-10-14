document.addEventListener('deviceready', onDeviceReady, false);

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
    cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
        if (enabled) {
            console.log("Location services are enabled");
            initializeApp(); // Placeholder for further logic
        } else {
            showLocationSettingsPrompt();
        }
    }, function(error) {
        console.error("The following error occurred: " + error);
    });
}

function showLocationSettingsPrompt() {
    alert("Location services are disabled. Please enable them to use this app.");
    cordova.plugins.diagnostic.switchToLocationSettings();
}

function initializeApp() {
    console.log("Initializing app");
    // Placeholder for further logic
}

// Commented out the rest of the code for now
/*
function fetchDriverDetails() {
    // Function logic here
}

function displayDriverDetails(data) {
    // Function logic here
}

function fetchDriverListForShift(shift) {
    // Function logic here
}

function fetchShiftDetails(shift) {
    // Function logic here
}

function displayShiftDetails(data) {
    // Function logic here
}

function displayDriverList(data) {
    // Function logic here
}

function sendCoordinates(latitude, longitude, driverName, vehicleNumber) {
    // Function logic here
}

function getCurrentLocation() {
    // Function logic here
}

function startSendingCoordinates() {
    // Function logic here
}

function logPickDropEvent(studentName, pickDropLocation, typeOfLog, shift, standard) {
    // Function logic here
}
*/