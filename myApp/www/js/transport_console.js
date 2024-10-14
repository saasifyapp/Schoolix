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