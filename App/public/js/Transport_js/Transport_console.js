document.addEventListener('DOMContentLoaded', function () {
    // Main Overlay Elements
    const driverConductorOverlay = document.getElementById('driverConductorOverlay');
    const addDriverOverlay = document.getElementById('addDriverOverlay');
    const searchDriverConductorOverlay = document.getElementById('searchDriverConductorOverlay');
    const routesShiftsOverlay = document.getElementById('routesShiftsOverlay');
    const manageRoutesOverlay = document.getElementById('manageRoutesOverlay');
    const manageShiftsOverlay = document.getElementById('manageShiftsOverlay'); // Add for Manage Shifts

    // Buttons
    const driverConductorButton = document.getElementById('driverConductorButton');
    const addDriverButton = document.getElementById('addDriverButton');
    const searchDriverButton = document.getElementById('searchDriverButton');
    const closeDriverConductorOverlay = document.getElementById('closeDriverConductorOverlay');
    const closeAddDriverOverlay = document.getElementById('closeAddDriverOverlay');
    const closeSearchDriverConductorOverlay = document.getElementById('closeSearchDriverConductorOverlay');
    const routesShiftsButton = document.getElementById('routesShiftsButton');
    const closeRoutesShiftsOverlay = document.getElementById('closeRoutesShiftsOverlay');
    const manageRoutesButton = document.getElementById('manageRoutesButton');
    const closeManageRoutesOverlay = document.getElementById('closeManageRoutesOverlay');
    const manageShiftsButton = document.getElementById('manageShiftsButton'); // Add for Manage Shifts
    const closeManageShiftsOverlay = document.getElementById('closeManageShiftsOverlay'); // Add for Manage Shifts

    // Show Driver/Conductor Selection Overlay
    driverConductorButton.addEventListener('click', function () {
        hideOverlay('addDriverOverlay');
        hideOverlay('searchDriverConductorOverlay');
        hideOverlay('routesShiftsOverlay');
        hideOverlay('manageRoutesOverlay');
        hideOverlay('manageShiftsOverlay'); // Hide Manage Shifts
        showOverlay('driverConductorOverlay');
    });

    // Show Add Driver/Conductor Overlay
    addDriverButton.addEventListener('click', function () {
        hideOverlay('driverConductorOverlay');
        hideOverlay('searchDriverConductorOverlay');
        hideOverlay('routesShiftsOverlay');
        hideOverlay('manageRoutesOverlay');
        hideOverlay('manageShiftsOverlay'); // Hide Manage Shifts
        showOverlay('addDriverOverlay');
    });

    // Show Search Driver/Conductor Overlay
    searchDriverButton.addEventListener('click', function () {
        hideOverlay('driverConductorOverlay');
        hideOverlay('addDriverOverlay');
        hideOverlay('routesShiftsOverlay');
        hideOverlay('manageRoutesOverlay');
        hideOverlay('manageShiftsOverlay'); // Hide Manage Shifts
        showOverlay('searchDriverConductorOverlay');
    });

    // Show Routes and Shifts Overlay
    routesShiftsButton.addEventListener('click', function () {
        hideOverlay('driverConductorOverlay');
        hideOverlay('addDriverOverlay');
        hideOverlay('searchDriverConductorOverlay');
        hideOverlay('manageRoutesOverlay');
        hideOverlay('manageShiftsOverlay'); // Hide Manage Shifts
        showOverlay('routesShiftsOverlay');
    });

    // Show Manage Routes Overlay
    manageRoutesButton.addEventListener('click', function () {
        hideOverlay('driverConductorOverlay');
        hideOverlay('addDriverOverlay');
        hideOverlay('searchDriverConductorOverlay');
        hideOverlay('routesShiftsOverlay');
        hideOverlay('manageShiftsOverlay'); // Hide Manage Shifts
        showOverlay('manageRoutesOverlay');
    });

    // Show Manage Shifts Overlay
    manageShiftsButton.addEventListener('click', function () {
        hideOverlay('driverConductorOverlay');
        hideOverlay('addDriverOverlay');
        hideOverlay('searchDriverConductorOverlay');
        hideOverlay('routesShiftsOverlay');
        hideOverlay('manageRoutesOverlay'); // Hide Manage Routes
        showOverlay('manageShiftsOverlay');
    });

    // Close Driver/Conductor Overlay
    closeDriverConductorOverlay.addEventListener('click', function () {
        hideOverlay('driverConductorOverlay');
    });

    // Close Add Driver/Conductor Overlay
    closeAddDriverOverlay.addEventListener('click', function () {
        hideOverlay('addDriverOverlay');
    });

    // Close Search Driver/Conductor Overlay
    closeSearchDriverConductorOverlay.addEventListener('click', function () {
        hideOverlay('searchDriverConductorOverlay');
    });

    // Close Routes and Shifts Overlay
    closeRoutesShiftsOverlay.addEventListener('click', function () {
        hideOverlay('routesShiftsOverlay');
    });

    // Close Manage Routes Overlay
    closeManageRoutesOverlay.addEventListener('click', function () {
        hideOverlay('manageRoutesOverlay');
    });

    // Close Manage Shifts Overlay
    closeManageShiftsOverlay.addEventListener('click', function () {
        hideOverlay('manageShiftsOverlay');
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
