document.addEventListener('deviceready', function() {
    const locationModal = document.getElementById('locationModal');
    const enableLocationBtn = document.getElementById('enableLocationBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Check location permissions and status on load
    checkLocationPermissionsAndServices();

    enableLocationBtn.addEventListener('click', function() {
        cordova.plugins.diagnostic.switchToLocationSettings();
        hideLocationSettingsPrompt();
    });

    cancelBtn.addEventListener('click', function() {
        hideLocationSettingsPrompt();
    });

    function checkLocationPermissionsAndServices() {
        const permissions = cordova.plugins.permissions;
        const requiredPermissions = [
            permissions.ACCESS_FINE_LOCATION,
            permissions.ACCESS_COARSE_LOCATION
        ];

        permissions.checkPermission(requiredPermissions, (status) => {
            if (!status.hasPermission) {
                permissions.requestPermissions(requiredPermissions, (status) => {
                    if (!status.hasPermission) {
                        alert("Permission denied. The app needs location permissions to function properly.");
                    } else {
                        checkLocationServices();
                    }
                }, (error) => {
                    console.error("Error requesting permissions", error);
                });
            } else {
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
                // Placeholder for further logic
            } else {
                showLocationSettingsPrompt();
            }
        }, function(error) {
            console.error("The following error occurred: " + error);
        });
    }

    function showLocationSettingsPrompt() {
        locationModal.style.display = 'flex';
    }

    function hideLocationSettingsPrompt() {
        locationModal.style.display = 'none';
    }
});