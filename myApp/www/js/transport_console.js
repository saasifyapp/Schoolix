document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log("Device is ready");

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
                    hideSpinner();
                } else {
                    console.log("Permissions granted");
                    checkLocationServices();
                }
            }, (error) => {
                console.error("Error requesting permissions", error);
                hideSpinner();
            });
        } else {
            console.log("Permissions already granted");
            checkLocationServices();
        }
    }, (error) => {
        console.error("Error checking permissions", error);
        hideSpinner();
    });
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
        hideSpinner();
    });
}

function showLocationSettingsPrompt() {
    alert("Location services are disabled. Please enable them to use this app.");
    cordova.plugins.diagnostic.switchToLocationSettings();
    hideSpinner();
}

function initializeApp() {
    console.log("Initializing app");
    hideSpinner();
    // Placeholder for further logic
}

function showSpinner() {
    const spinnerContainer = document.getElementById('spinnerContainer');
    if (spinnerContainer) {
        spinnerContainer.style.display = 'flex';
    }
}

function hideSpinner() {
    const spinnerContainer = document.getElementById('spinnerContainer');
    if (spinnerContainer) {
        spinnerContainer.style.display = 'none';
    }
}

// Show spinner initially when the app is loading
showSpinner();