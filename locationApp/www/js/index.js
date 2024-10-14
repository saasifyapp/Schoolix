document.addEventListener('deviceready', function() {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationDisplay = document.getElementById('locationDisplay');

    getLocationBtn.addEventListener('click', function() {
        // First, check if the location services are enabled
        checkLocationEnabled();
    });

    function checkLocationEnabled() {
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
                // Here, you can show a message and suggest opening location settings
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

        // Optionally, you can add a button to open location settings
        const settingsButton = document.createElement('button');
        settingsButton.innerHTML = "Open Location Settings";
        settingsButton.onclick = function() {
            window.cordova.plugins.settings.open("location", function() {
                console.log("Location settings opened successfully");
            }, function() {
                console.log("Failed to open settings");
            });
        };
        locationDisplay.appendChild(settingsButton);
    }
});
