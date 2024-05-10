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


// Flags to track whether alerts have been shown
let alert30SecShown = localStorage.getItem('alert30SecShown') === 'false';
let alert5MinShown = localStorage.getItem('alert5MinShown') === 'false';
let alert15MinShown = localStorage.getItem('alert15MinShown') === 'false';

// Function to clear the interval
function clearCheckInterval() {
    clearInterval(intervalId);
}

function getJWTExpiration() {
    const jwtCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('jwt='));
    if (jwtCookie) {
        const jwt = jwtCookie.split('=')[1];
        const decodedJWT = JSON.parse(atob(jwt.split('.')[1]));
        return decodedJWT.exp * 1000; // Convert expiration time to milliseconds
    }
    return null;
}

// Function to show a toast
function showAlert(message, confirmButton = true) {
    return Swal.fire({
        text: message,
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Yes',
        showCancelButton: true, // Show cancel button
        cancelButtonColor: '#d33',
        cancelButtonText: 'No', // Text for cancel button
        background: '#fff',
        position: 'top-end',
        showConfirmButton: confirmButton, // Show confirm button based on the parameter
        timer: 10000,
        timerProgressBar: true,
        toast: true
    });
}
 
// Function to check JWT expiration periodically
function checkJWTExpiration() {
    const expirationTime = getJWTExpiration();
    if (expirationTime) {
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;

        // 20 seconds before expiration
        // Use showAlert instead of alert and confirm
        if (timeUntilExpiration <=30000 && !alert30SecShown) {
            showAlert("Your session will expire in 30 Sec. We are logging you out!");
            alert30SecShown = true;
            localStorage.setItem('alert30SecShown', 'true');
        }

        if (timeUntilExpiration >= 6900000  && timeUntilExpiration <= 6910000  && !alert5MinShown) {
            showAlert("Your session will expire in 5 Min. Do you want to sign in again?", true)
                .then((result) => {
                    if (result.isConfirmed) {
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
                });
            alert5MinShown = true;
            localStorage.setItem('alert5MinShown', 'true');
        }

        if (timeUntilExpiration >= 6300000  && timeUntilExpiration <= 6310000  && !alert15MinShown) {
            showAlert("Your session will expire in 15 Min. Do you want to sign in again?", true)
                .then((result) => {
                    if (result.isConfirmed) {
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
                });
            alert15MinShown = true;
            localStorage.setItem('alert15MinShown', 'true');
        }

        // At expiration
        if (timeUntilExpiration < 100) {
            // Clear the interval when the JWT expires
            clearCheckInterval();
            // Clear the flags when the JWT expires
            localStorage.removeItem('alert30SecShown');
            localStorage.removeItem('alert5MinShown');
            localStorage.removeItem('alert15MinShown');
            // Reload the page
            window.location.reload();
        }
    }
}

// Call checkJWTExpiration every second
const intervalId = setInterval(checkJWTExpiration, 1000);


