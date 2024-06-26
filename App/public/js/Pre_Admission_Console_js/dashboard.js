// Function to show the loading animation
function showLoadingAnimation() {
    var loadingOverlay = document.getElementById('loadingOverlay2');
    loadingOverlay.style.backgroundColor = '#25b09b'; // Change background color to green
    document.body.classList.add('blur');
}

// Function to hide the loading animation
function hideLoadingAnimation() {
    var loadingOverlay = document.getElementById('loadingOverlay2');
    loadingOverlay.style.display = 'none'; // Hide the loading overlay
    document.body.classList.remove('blur');
}

// Show loading animation when the window starts loading
window.addEventListener('load', function() {
    hideLoadingAnimation(); // Hide loading animation when page is fully loaded
});

// Hide loading animation when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    showLoadingAnimation(); // Show loading animation when page starts loading
});

  
// Functions to navigate from Dashboard to different activities/pages
function navigate_to_age_calculator() {
    window.location.href = "/pre_adm/age-calculator";
}

function navigateTo_register_student() {
    window.location.href = "/pre_adm/register-student";
}

function navigateTo_search_student() {
    window.location.href = "/pre_adm/search-student";
}

function navigateTo_register_teacher() {
    window.location.href = "/pre_adm/register-teacher";
}

function navigateTo_search_teacher() {
    window.location.href = "/pre_adm/search-teacher";

}

document.getElementById('logoutButton').addEventListener('click', function () {
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
    };
})


////// FUNCTION TO DISPLAY DYNAMIC USERNAME ON DASHBOARD //////////

function decodeURIComponentSafe(encodedURIComponent) {
    try {
        return decodeURIComponent(encodedURIComponent);
    } catch (e) {
        // If decoding fails, return the original string
        return encodedURIComponent;
    }
  }
  
  
  // Function to display dynamic username and logo on dashboard
  function displayUserInfo(cookieName, usernameElementId, logoElementId) {
    const cookies = document.cookie.split(';');
    let username;
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === cookieName) {
            username = decodeURIComponentSafe(value);
            break;
        }
    }
    if (username) {
        const usernameElement = document.getElementById(usernameElementId);
        if (usernameElement) {
            usernameElement.textContent = username;
        } else {
            console.error(`Element with id '${usernameElementId}' not found`);
        }
  
        // Set the logo image dynamically
        const logoElement = document.getElementById(logoElementId);
        if (logoElement) {
            // Assuming the logo filename is the same as the user ID
            const userId = username.toLowerCase().replace(/\s+/g, '_'); // Convert username to lowercase and replace spaces with underscores
            const logoSrc = `../images/logo/${userId}.png`; // Adjust the path if necessary
            logoElement.src = logoSrc;
            logoElement.alt = username; // Set alt text to username
        } else {
            console.error(`Element with id '${logoElementId}' not found`);
        }
    } else {
        console.log(`Cookie '${cookieName}' not found`);
    }
  }
  
  // Call the function to display the dynamic username and logo
  displayUserInfo('schoolName', 'user_name', 'logo');
  
  


