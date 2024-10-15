document.addEventListener('deviceready', function() {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationDisplay = document.getElementById('locationDisplay');
    const locationModal = document.getElementById('locationModal');
    const enableLocationBtn = document.getElementById('enableLocationBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    getLocationBtn.addEventListener('click', function() {
        checkLocationServices();
    });

    enableLocationBtn.addEventListener('click', function() {
        cordova.plugins.diagnostic.switchToLocationSettings();
        hideLocationSettingsPrompt();
    });

    cancelBtn.addEventListener('click', function() {
        hideLocationSettingsPrompt();
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
        locationModal.style.display = 'flex';
    }

    function hideLocationSettingsPrompt() {
        locationModal.style.display = 'none';
    }

    // Handle Android back button
    document.addEventListener('backbutton', function(e) {
        e.preventDefault();
        if (window.location.pathname.endsWith('index.html')) {
            navigator.app.exitApp(); // Exit the app if on the login page
        } else {
            window.history.back(); // Navigate back to the previous page
        }
    }, false);
});