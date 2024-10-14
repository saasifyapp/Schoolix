document.addEventListener('deviceready', function() {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationDisplay = document.getElementById('locationDisplay');

    getLocationBtn.addEventListener('click', function() {
        checkLocationServices();
    });

    function checkLocationServices() {
        cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
            if (enabled) {
                getLocation();
            } else {
                showLocationSettingsPrompt();
            }
        }, function(error) {
            console.error("The following error occurred: " + error);
        });
    }

    function getLocation() {
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    }

    function onSuccess(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        locationDisplay.innerHTML = `Latitude: ${latitude}<br>Longitude: ${longitude}`;
    }

    function onError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                locationDisplay.innerHTML = "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                locationDisplay.innerHTML = "Location information is unavailable.";
                showLocationSettingsPrompt();
                break;
            case error.TIMEOUT:
                locationDisplay.innerHTML = "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
                locationDisplay.innerHTML = "An unknown error occurred.";
                break;
        }
    }

    function showLocationSettingsPrompt() {
        locationDisplay.innerHTML += "<br><strong>Please enable location services for this app.</strong>";

        const settingsButton = document.createElement('button');
        settingsButton.innerHTML = "Open Location Settings";
        settingsButton.onclick = function() {
            cordova.plugins.diagnostic.switchToLocationSettings();
        };
        locationDisplay.appendChild(settingsButton);
    }
});