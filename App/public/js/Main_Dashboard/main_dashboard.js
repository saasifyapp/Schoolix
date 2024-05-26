const body = document.querySelector("body");
const darkLight = document.querySelector("#darkLight");
const sidebar = document.querySelector(".sidebar");
const submenuItems = document.querySelectorAll(".submenu_item");
const sidebarOpen = document.querySelector("#sidebarOpen");
const sidebarClose = document.querySelector(".collapse_sidebar");
const sidebarExpand = document.querySelector(".expand_sidebar");
sidebarOpen.addEventListener("click", () => sidebar.classList.toggle("close"));


// darkLight.addEventListener("click", () => {
//     body.classList.toggle("dark");
//     if (body.classList.contains("dark")) {
//         document.setI
//         darkLight.classList.replace("bx-sun", "bx-moon");
//     } else {
//         darkLight.classList.replace("bx-moon", "bx-sun");
//     }
// });

submenuItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        item.classList.toggle("show_submenu");
        submenuItems.forEach((item2, index2) => {
            if (index !== index2) {
                item2.classList.remove("show_submenu");
            }
        });
    });
});

if (window.innerWidth < 768) {
    sidebar.classList.add("close");
} else {
    sidebar.classList.remove("close");
}

// ////// FUNCTION TO DISPLAY DYNAMIC USERNAME ON DASHBOARD //////////(NO USE AS OF NOW)

// function decodeURIComponentSafe(encodedURIComponent) {
//     try {
//         return decodeURIComponent(encodedURIComponent);
//     } catch (e) {
//         // If decoding fails, return the original string
//         return encodedURIComponent;
//     }
// }


// // Function to get a cookie by name and log its value to the console
// function getAndDisplayCookieValue(cookieName, elementId) {
//     const cookies = document.cookie.split(';');
//     for (let cookie of cookies) {
//         const [name, value] = cookie.trim().split('=');
//         if (name === cookieName) {
//             const decodedValue = decodeURIComponentSafe(value);
//             const element = document.getElementById(elementId);
//             if (element) {
//                 element.textContent = `${decodedValue}`;
//             } else {
//                 console.error(`Element with id '${elementId}' not found`);
//             }
//             return;
//         }
//     }
//     console.log(`Cookie '${cookieName}' not found`);
// }

// // Call the function to get and display the value of the cookie named 'schoolName' in the HTML element with id 'user_name'
// getAndDisplayCookieValue('schoolName', 'user_name');



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
            const logoSrc = `images/logo/${userId}.png`; // Adjust the path if necessary
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




//////////////// SIGNOUT FUNCTION /////////////

// function logout() {
//     // Make an AJAX request to logout route
//     fetch('/logout', {
//         method: 'GET',
//         credentials: 'same-origin' // Send cookies with the request
//     })
//         .then(response => {
//             if (response.ok) {
//                 // Clear session or token used for authentication on the server side
//                 // Redirect to homepage or login page
//                 window.location.href = '/';
//             } else {
//                 console.error('Logout failed');
//             }
//         })
//         .catch(error => console.error('Error during logout:', error));
// }

// Event listener for popstate event
window.addEventListener('popstate', function (event) {
    const currentState = history.state;
    if (currentState && currentState.loggedOut) {
        // If the user is logged out, prevent navigating back
        history.forward();
        history.back();
    } else {
        // If the user is logged in, prompt for logout confirmation
        const confirmation = confirm(`Are you sure you want to logout ?`);
        if (confirmation) {
            // Make an AJAX request to logout route
            fetch('/logout', {
                method: 'GET',
                credentials: 'same-origin' // Send cookies with the request
            })
                .then(response => {
                    if (response.ok) {
                        // Clear session or token used for authentication on the server side
                        // Redirect to homepage or login page
                        window.location.href = '/';
                    } else {
                        console.error('Logout failed');
                    }
                })
                .catch(error => console.error('Error during logout:', error));
            // Replace the current history state with a logged-out state
            history.replaceState({ loggedOut: true }, null, window.location.href);
        } else {
            // Restore the previous history state to prevent navigating back
            history.pushState({ loggedOut: false }, null, window.location.href);
        }
    }
});

// Push a new state to the history when the page is loaded
window.history.pushState({ loggedOut: false }, null, window.location.href);


document.getElementById('logoutbtn').addEventListener('click', function (event) {

    // Prevent the default action of the click event
    event.preventDefault();


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

});


///////////////////STAY TUNED ALERT  /////////////////

function staytuned() {
    alert("Feature Yet to be released! Stay Tuned!");
}


///////////////////////////////////////// GET VALUES FOR PREADMISSION CONSOLE ON DASHBOARD ////////////////////////////

let animationFrameId; // Declare a variable to store animation frame ID

fetch('/main_dashboard_data')
    .then(response => response.json())
    .then(data => {
        console.log(data); // Log fetched data to check if admittedTeachersCount is included
        // Update HTML with counts for each table
        updateCountWithAnimation('registeredStudentsCount', () => data.pre_adm_registered_students);
        updateCountWithAnimation('admittedStudentsCount', () => data.pre_adm_admitted_students);
        updateCountWithAnimation('registeredTeachersCount', () => data.pre_adm_registered_teachers);
        updateCountWithAnimation('admittedTeachersCount', () => data.pre_adm_admitted_teachers);
    })
    .catch(error => {
        console.error('Error fetching counts:', error);
        // Display error message
        updateCount('registeredStudentsCount', 'Error fetching count');
        updateCount('admittedStudentsCount', 'Error fetching count');
        updateCount('registeredTeachersCount', 'Error fetching count');
        updateCount('admittedTeachersCount', 'Error fetching count');
    });
    
function updateCountWithAnimation(elementId, valueCallback) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0; // Parse as integer, default to 0 if NaN

    let start;

    function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;

        const newValue = valueCallback(); // Fetch updated value

        if (typeof newValue !== 'number' || isNaN(newValue)) {
            // If the fetched value is not a number or NaN, stop animation
            element.textContent = 'Error fetching count';
            return;
        }

        const difference = newValue - currentValue;
        const duration = 2000; // 2 seconds

        // Update count value
        const updatedValue = Math.floor(currentValue + (difference * elapsed) / duration);
        element.textContent = updatedValue;

        if (elapsed < duration) {
            // Continue animation
            animationFrameId = window.requestAnimationFrame(step);
        } else {
            // Animation complete, set final value
            element.textContent = newValue;
        }
    }

    // Start animation
    animationFrameId = window.requestAnimationFrame(step);
}

// Pause animation when tab becomes hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Tab is hidden, cancel animation
        if (animationFrameId) {
            window.cancelAnimationFrame(animationFrameId);
        }
    } else {
        // Tab is visible again, resume animation
        updateCountWithAnimation('registeredStudentsCount', /* valueCallback */);
        updateCountWithAnimation('admittedStudentsCount', /* valueCallback */);
        updateCountWithAnimation('registeredTeachersCount', /* valueCallback */);
        updateCountWithAnimation('admittedTeachersCount', /* valueCallback */);
    }
});

// Function to handle purchase link click
function handlePurchaseClick(event) {
    event.preventDefault(); // Prevent default link behavior

    // Prompt for password
    const password = prompt("Enter password:");

    // Check if password is correct
    if (password === "admin@inv") { // Replace "your_password_here" with the actual password
        // Redirect to the purchase route
        window.location.href = "/inventory/purchase";
    } else {
        // Show an error message or handle incorrect password
        alert("Incorrect password!");
    }
}

// Add event listener to the Purchase link
const purchaseLink = document.getElementById("purchaseLink");
purchaseLink.addEventListener("click", handlePurchaseClick);