document.addEventListener('DOMContentLoaded', function () {
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

document.addEventListener('deviceready', function () {
    console.log("Device is ready");

    // Handle Android back button
    document.addEventListener('backbutton', function (e) {
        e.preventDefault();
        console.log("Back button pressed");
        // Do nothing or show a message if needed
    }, false);
});

// Sign-out button functionality
document.getElementById('signout-button').addEventListener('click', function () {
    // Ask for confirmation before signing out
    const confirmation = confirm("Are you sure you want to sign out?");
    if (confirmation) {
        // Clear localStorage or sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to the login page
        window.location.href = './index.html';
    }
});