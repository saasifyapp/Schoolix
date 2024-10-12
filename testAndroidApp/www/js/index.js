document.addEventListener('deviceready', function() {
    console.log('Device is ready');

    var latitudeElement = document.getElementById('latitude');
    var longitudeElement = document.getElementById('longitude');

    function updateLocation() {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            latitudeElement.textContent = latitude;
            longitudeElement.textContent = longitude;
        }, function(error) {
            console.error('Error getting location: ' + error.message);
        });
    }

    // Update location every 2 seconds
    setInterval(updateLocation, 2000);

    // Initial location update
    updateLocation();
}, false);