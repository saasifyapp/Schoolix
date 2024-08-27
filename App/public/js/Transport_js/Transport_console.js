document.addEventListener('DOMContentLoaded', function () {
    // Main Overlay Elements
    const driverConductorOverlay = document.getElementById('driverConductorOverlay');
    const addDriverOverlay = document.getElementById('addDriverOverlay');
    const searchDriverConductorOverlay = document.getElementById('searchDriverConductorOverlay');

    // Buttons
    const driverConductorButton = document.getElementById('driverConductorButton');
    const addDriverButton = document.getElementById('addDriverButton');
    const searchDriverButton = document.getElementById('searchDriverButton');
    const closeDriverConductorOverlay = document.getElementById('closeDriverConductorOverlay');
    const closeAddDriverOverlay = document.getElementById('closeAddDriverOverlay');
    const closeSearchDriverConductorOverlay = document.getElementById('closeSearchDriverConductorOverlay');

    // Show Driver/Conductor Selection Overlay
    driverConductorButton.addEventListener('click', function () {
        hideOverlay('addDriverOverlay');
        hideOverlay('searchDriverConductorOverlay');
        showOverlay('driverConductorOverlay');
    });

    // Show Add Driver/Conductor Overlay
    addDriverButton.addEventListener('click', function () {
        hideOverlay('driverConductorOverlay');
        hideOverlay('searchDriverConductorOverlay');
        showOverlay('addDriverOverlay');
    });

    // Show Search Driver/Conductor Overlay
    searchDriverButton.addEventListener('click', function () {
        hideOverlay('driverConductorOverlay');
        hideOverlay('addDriverOverlay');
        showOverlay('searchDriverConductorOverlay');
    });

    // Close Add Driver/Conductor Overlay
    closeAddDriverOverlay.addEventListener('click', function () {
        hideOverlay('addDriverOverlay');
    });

    // Close Search Driver/Conductor Overlay
    closeSearchDriverConductorOverlay.addEventListener('click', function () {
        hideOverlay('searchDriverConductorOverlay');
    });

    // Close Driver/Conductor Selection Overlay
    closeDriverConductorOverlay.addEventListener('click', function () {
        hideOverlay('driverConductorOverlay');
    });

    // Utility Functions to Show/Hide Overlays
    function showOverlay(overlayId) {
        document.getElementById(overlayId).style.display = "flex";
    }

    function hideOverlay(overlayId) {
        const overlay = document.getElementById(overlayId);
        overlay.style.display = "none";
    }
});
