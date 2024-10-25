document.addEventListener('DOMContentLoaded', function () {
    // Main Overlay Elements
    const driverConductorOverlay = document.getElementById('driverConductorOverlay');
    const addDriverOverlay = document.getElementById('addDriverOverlay');
    const searchDriverConductorOverlay = document.getElementById('searchDriverConductorOverlay');
    const routesShiftsOverlay = document.getElementById('routesShiftsOverlay');
    const manageRoutesOverlay = document.getElementById('manageRoutesOverlay');
    const manageShiftsOverlay = document.getElementById('manageShiftsOverlay');
    const busAllocationOverlay = document.getElementById('busAllocationOverlay');
    const allocateBusOverlay = document.getElementById('allocateBusOverlay'); // Changed from manageScheduleOverlay
    const tagRouteShiftOverlay = document.getElementById('tagRouteShiftOverlay');
    const listStudentsOverlay = document.getElementById('listStudentsOverlay'); // Changed from listSchedulingOverlay
    const transportMonitoringOverlay = document.getElementById('transportMonitoringOverlay');

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
    const manageShiftsButton = document.getElementById('manageShiftsButton');
    const closeManageShiftsOverlay = document.getElementById('closeManageShiftsOverlay');
    const schedulingButton = document.getElementById('schedulingButton');
    const closeBusAllocationOverlay = document.getElementById('closeBusAllocationOverlay');
    const allocateBus = document.getElementById('allocateBus'); // Add for Manage Schedule
    const closeAllocateBusOverlay = document.getElementById('closeAllocateBusOverlay'); // Changed from closeManageScheduleOverlay
    const tagRouteShiftButton = document.getElementById('tagRouteShiftButton');
    const closeTagRouteShiftOverlay = document.getElementById('closeTagRouteShiftOverlay');
    const closeListStudentsOverlay = document.getElementById('closeListStudentsOverlay'); // Changed from closeListSchedulingOverlay
    const trackingMonitoringButton = document.getElementById('trackingMonitoringButton');
    const closeTransportMonitoringOverlay = document.getElementById('closeTransportMonitoringOverlay');

    // Show Driver/Conductor Selection Overlay
    driverConductorButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('driverConductorOverlay');
    });

    // Show Add Driver/Conductor Overlay
    addDriverButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('addDriverOverlay');
    });

    // Show Search Driver/Conductor Overlay
    searchDriverButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('searchDriverConductorOverlay');
        refreshDriverConductorData();
    });

    // Show Routes and Shifts Overlay
    routesShiftsButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('routesShiftsOverlay');
    });

    // Show Manage Routes Overlay
    manageRoutesButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('manageRoutesOverlay');
        refreshRoutesData();
    });

    // Show Manage Shifts Overlay
    manageShiftsButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('manageShiftsOverlay');
        refreshShiftsData();
    });

    // Show Bus Allocation Overlay
    schedulingButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('busAllocationOverlay');
    });

    // Show Allocate Bus Overlay
    allocateBus.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('allocateBusOverlay');
        fetchAndDisplayScheduleDetails();
    });

    // Show Tag Route Shift Overlay
    tagRouteShiftButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('tagRouteShiftOverlay');
    });


    listStudentsButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('listStudentsOverlay'); // Changed from listSchedulingOverlay
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

    // Close Bus Allocation Overlay
    closeBusAllocationOverlay.addEventListener('click', function () {
        hideOverlay('busAllocationOverlay');
    });

    // Close Allocate Bus Overlay
    closeAllocateBusOverlay.addEventListener('click', function () {
        hideOverlay('allocateBusOverlay');
    });

    // Close Tag Route Shift Overlay
    closeTagRouteShiftOverlay.addEventListener('click', function () {
        hideOverlay('tagRouteShiftOverlay');
    });

    // Close List Students Overlay
    closeListStudentsOverlay.addEventListener('click', function () {
        hideOverlay('listStudentsOverlay'); // Changed from listSchedulingOverlay
    });
    // Show Transport Monitoring Overlay
    trackingMonitoringButton.addEventListener('click', function () {
        hideAllOverlays();
        showOverlay('transportMonitoringOverlay');
    });

    // Close Transport Monitoring Overlay
    closeTransportMonitoringOverlay.addEventListener('click', function () {
        hideOverlay('transportMonitoringOverlay');
    });

    // Utility Functions to Show/Hide Overlays
    function showOverlay(overlayId) {
        console.log(`Showing overlay: ${overlayId}`);
        document.getElementById(overlayId).style.display = "flex";
    }

    function hideOverlay(overlayId) {
        console.log(`Hiding overlay: ${overlayId}`);
        const overlay = document.getElementById(overlayId);
        overlay.style.display = "none";
        resetOverlayContents(overlay);
    }

    function hideAllOverlays() {
        const overlays = [
            'driverConductorOverlay', 'addDriverOverlay', 'searchDriverConductorOverlay',
            'routesShiftsOverlay', 'manageRoutesOverlay', 'manageShiftsOverlay',
            'busAllocationOverlay', 'allocateBusOverlay', 'tagRouteShiftOverlay',
            'listStudentsOverlay', 'transportMonitoringOverlay' // Added transportMonitoringOverlay
        ];
        overlays.forEach(hideOverlay);
    }

    // Function to reset the contents of input fields and suggestion containers
    function resetOverlayContents(overlay) {
        // Clear input fields
        const inputFields = overlay.querySelectorAll('input');
        inputFields.forEach(input => {
            input.value = '';
        });

        // Clear suggestion containers
        const infoContainers = overlay.querySelectorAll('.info-container');
        infoContainers.forEach(container => {
            // container.innerHTML = '';
            container.style.display = 'none'; // Set display to none
        });
    }
});

// Function to show the loading animation
function showTransportLoadingAnimation() {
    var loadingOverlay = document.getElementById("loadingOverlayTransport");
    loadingOverlay.style.display = "flex";
}

// Function to hide the loading animation
function hideTransportLoadingAnimation() {
    var loadingOverlay = document.getElementById("loadingOverlayTransport");
    loadingOverlay.style.display = "none"; // Hide the loading overlay
}