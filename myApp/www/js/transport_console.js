document.addEventListener('deviceready', function() {
    console.log("Device is ready");

    const locationModal = document.getElementById('locationModal');
    const enableLocationBtn = document.getElementById('enableLocationBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Check location permissions and status on load
    checkLocationPermissionsAndServices();

    enableLocationBtn.addEventListener('click', function() {
        console.log("Enable Location button clicked");
        cordova.plugins.diagnostic.switchToLocationSettings();
        hideLocationSettingsPrompt();
    });

    cancelBtn.addEventListener('click', function() {
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
        cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
            if (enabled) {
                console.log("Location services are enabled");
                // Placeholder for further logic
            } else {
                console.log("Location services are disabled, showing prompt...");
                showLocationSettingsPrompt();
            }
        }, function(error) {
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
});