document.addEventListener('DOMContentLoaded', function() {
    // Custom back button logic
    const backButton = document.getElementById('back-button');
    const backToConsoleButton = document.getElementById('back-to-console-button');

    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = './index.html';
        });
    }

    if (backToConsoleButton) {
        backToConsoleButton.addEventListener('click', () => {
            const driverDetailsScreen = document.getElementById('driver-details-screen');
            const driverConsole = document.getElementById('driver-console');
            const searchBar = document.getElementById('search-bar');
            driverDetailsScreen.classList.add('hidden');
            driverConsole.classList.remove('hidden');
            searchBar.value = ''; // Clear the search field when going back to the console
        });
    }
});

document.addEventListener('deviceready', function() {
    console.log("Device is ready");

    // Handle Android back button
    document.addEventListener('backbutton', function(e) {
        e.preventDefault();
        console.log("Back button pressed");
        // Trigger the custom back button click event
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.click();
        }
    }, false);
});