// Function to delete a cookie by name
function deleteCookie(cookieName) {
    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log(cookieName + ' cookie deleted.');
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = '/'; // Replace 'login.html' with your login page URL
}

// Set up a timer to show a confirmation dialog before deleting the cookie and redirecting to login page when the page becomes inactive
let inactivityTimer;
function handleInactive() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        // Show a confirmation dialog
        if (confirm('You will be logged out due to inactivity. Do you want to continue?')) {
            deleteCookie('jwt');
            console.log('Page inactive, example_cookie cookie deleted.');
            redirectToLogin();
        } else {
            // Reset the timer if the user selects "No"
            handleInactive();
        }
    }, 500000); // Set the inactive time threshold 5mins
}

// Reset the inactivity timer when mouse movement or clicks are detected
document.addEventListener('mousemove', handleInactive);
document.addEventListener('click', handleInactive);

// Start the initial timer
handleInactive();

function logout() {
    // Make an AJAX request to logout route
    const confirmation = confirm(`Are you sure you want to logout ?`);
    if (confirmation) {
        fetch('/logout', {
            method: 'GET',
            credentials: 'same-origin' // Send cookies with the request
        })
            .then(response => {
                if (response.ok) {
                    // Redirect to homepage or login page
                    window.location.href = '/';
                } else {
                    console.error('Logout failed');
                }
            })
            .catch(error => console.error('Error during logout:', error));
    }
}



/////////////////////////////////////////////////////////////

function getJWTExpiration() {
    const jwtCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('jwt='));
    if (jwtCookie) {
        const jwt = jwtCookie.split('=')[1];
        const decodedJWT = JSON.parse(atob(jwt.split('.')[1]));
        return decodedJWT.exp * 1000; // Convert expiration time to milliseconds
    }
    return null;
}


let alert1MinShown = false; // Flag to track whether 1-minute alert has been shown
let alert5MinShown = false; // Flag to track whether 5-minute alert has been shown
let alert15MinShown = false; // Flag to track whether 15-minute alert has been shown

// Function to check JWT expiration periodically
function checkJWTExpiration() {
    const expirationTime = getJWTExpiration();
    if (expirationTime) {
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;

        // 1 minute before expiration
        if (timeUntilExpiration > 7140000 && timeUntilExpiration <= 7200000 && !alert1MinShown) {
            alert("Your session will expire in 1 Minute. We are logging you out!");

            fetch('/logout', {
                method: 'GET',
                credentials: 'same-origin' // Send cookies with the request
            })
                .then(response => {
                    if (response.ok) {
                        // Redirect to homepage or login page
                        window.location.href = '/';
                    } else {
                        console.error('Logout failed');
                    }
                })
                .catch(error => console.error('Error during logout:', error));

            alert1MinShown = true; // Set flag to true to indicate 20-second alert has been shown
        }

       // 5 minutes before expiration
       if (timeUntilExpiration > 7140000 && timeUntilExpiration <= 7260000 && !alert5MinShown) {
            const confirmation = confirm("Your session will expire in 5 Minutes. Do you want to sign in again?");
            if (confirmation) {
                fetch('/logout', {
                    method: 'GET',
                    credentials: 'same-origin' // Send cookies with the request
                })
                    .then(response => {
                        if (response.ok) {
                            // Redirect to homepage or login page
                            window.location.href = '/';
                        } else {
                            console.error('Logout failed');
                        }
                    })
                    .catch(error => console.error('Error during logout:', error));
            }
            alert5MinShown = true; // Set flag to true to indicate 40-second alert has been shown
        }

        // 15 minutes before expiration
        if (timeUntilExpiration > 7140000 && timeUntilExpiration <= 7500000 && !alert15MinShown) {
            const confirmation = confirm("Your session will expire in 15 Mins. Do you want to sign in again?");
            if (confirmation) {
                fetch('/logout', {
                    method: 'GET',
                    credentials: 'same-origin' // Send cookies with the request
                })
                    .then(response => {
                        if (response.ok) {
                            // Redirect to homepage or login page
                            window.location.href = '/';
                        } else {
                            console.error('Logout failed');
                        }
                    })
                    .catch(error => console.error('Error during logout:', error));
            }
            alert15MinShown = true; // Set flag to true to indicate 50-second alert has been shown
        }
    }
}

// Check JWT expiration every minute
setInterval(checkJWTExpiration, 60000);

