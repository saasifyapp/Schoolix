document.addEventListener('deviceready', function() {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationDisplay = document.getElementById('locationDisplay');

    getLocationBtn.addEventListener('click', function() {
        checkLocationEnabled();
    });

    function checkLocationEnabled() {
        if (!navigator.geolocation) {
            locationDisplay.innerHTML = "Geolocation is not supported by this browser.";
            return;
        }

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
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.settings) {
                window.cordova.plugins.settings.open("location", function() {
                    console.log("Location settings opened successfully");
                }, function() {
                    console.log("Failed to open settings");
                });
            } else {
                console.log("Settings plugin is not available.");
            }
        };
        locationDisplay.appendChild(settingsButton);
    }
});