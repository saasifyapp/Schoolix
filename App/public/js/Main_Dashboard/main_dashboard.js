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
  const cookies = document.cookie.split(";");
  let username;
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
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
      const userId = username.toLowerCase().replace(/\s+/g, "_"); // Convert username to lowercase and replace spaces with underscores
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
displayUserInfo("schoolName", "user_name", "logo");

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
window.addEventListener("popstate", function (event) {
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
      fetch("/logout", {
        method: "GET",
        credentials: "same-origin", // Send cookies with the request
      })
        .then((response) => {
          if (response.ok) {
            // Clear session or token used for authentication on the server side
            // Redirect to homepage or login page
            window.location.href = "/";
          } else {
            console.error("Logout failed");
          }
        })
        .catch((error) => console.error("Error during logout:", error));
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

document
  .getElementById("logoutbtn")
  .addEventListener("click", function (event) {
    // Prevent the default action of the click event
    event.preventDefault();

    // Make an AJAX request to logout route
    const confirmation = confirm(`Are you sure you want to logout ?`);
    if (confirmation) {
      fetch("/logout", {
        method: "GET",
        credentials: "same-origin", // Send cookies with the request
      })
        .then((response) => {
          if (response.ok) {
            // Redirect to homepage or login page
            window.location.href = "/";
          } else {
            console.error("Logout failed");
            // showToast('Logout failed');
          }
        })
        .catch((error) => console.error("Error during logout:", error));
    }
  });

///////////////////STAY TUNED ALERT  /////////////////

function staytuned() {
  alert("Feature Yet to be released! Stay Tuned!");
}

///////////////////////////////////////// GET VALUES FOR PREADMISSION CONSOLE ON DASHBOARD ////////////////////////////

// Get Library Details //
fetch("/main_dashboard_library_data")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    // Update counts with the fetched data
    document.getElementById('totalBooksCount').textContent = data.totalBooks;
    document.getElementById('memberCount').textContent = data.memberCount;
    document.getElementById('booksIssuedCount').textContent = data.booksIssued;
    document.getElementById('booksAvailableCount').textContent = data.booksAvailable;
    document.getElementById('outstandingBooksCount').textContent = data.outstandingBooks;
    document.getElementById('booksIssuedTodayCount').textContent = data.booksIssuedToday;
    document.getElementById('booksReturnedTodayCount').textContent = data.booksReturnedToday;
    document.getElementById('penaltiesCollectedCount').textContent = data.penaltiesCollected;
  })
  .catch((error) => {
    console.error("Error fetching counts:", error);

    // Display error messages if needed
    document.getElementById('totalBooksCount').textContent = 'Error';
    document.getElementById('memberCount').textContent = 'Error';
    document.getElementById('booksIssuedCount').textContent = 'Error';
    document.getElementById('booksAvailableCount').textContent = 'Error';
    document.getElementById('outstandingBooksCount').textContent = 'Error';
    document.getElementById('booksIssuedTodayCount').textContent = 'Error';
    document.getElementById('booksReturnedTodayCount').textContent = 'Error';
    document.getElementById('penaltiesCollectedCount').textContent = 'Error';
  });


// Get Students COunts
fetch("/student_counts")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    // Extract values from the data
    const totalStudents = data.primary_totalStudents;
    const maleStudents = data.primary_maleStudents;
    const femaleStudents = data.primary_femaleStudents;

    const  pre_primary_totalStudents = data. pre_primary_totalStudents;
    const  pre_primary_maleStudents = data. pre_primary_maleStudents;
    const  pre_primary_femaleStudents = data. pre_primary_femaleStudents;

    console.log(pre_primary_totalStudents,pre_primary_maleStudents,pre_primary_femaleStudents)

    // Calculate percentages
    const malePercentage = (maleStudents / totalStudents) * 100;
    const femalePercentage = 100 - malePercentage;

    // Update the Male/Female pie chart
    document.querySelector('.male_female_graph .chart').style.background = 
      `conic-gradient(#82afe3 ${malePercentage}%, #8cefda ${malePercentage}%)`;

    // Update the labels
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('maleCount').textContent = maleStudents;
    document.getElementById('femaleCount').textContent = femaleStudents;

    // For the Fee Status chart (assuming similar data structure for demonstration)
    // Replace with actual fee data if available
    const paidFees = data.paidFees;
    const unpaidFees = data.unpaidFees;
    const totalFees = paidFees + unpaidFees;
    const paidPercentage = (paidFees / totalFees) * 100;
    const unpaidPercentage = 100 - paidPercentage;

    // Update the Fee Status pie chart
    document.querySelector('.fee_status .chart').style.background = 
      `conic-gradient(#4CAF50 ${paidPercentage}%, #F44336 ${paidPercentage}%)`;

    // Update the labels
    document.getElementById('feeStatusTotal').textContent = totalFees;
    document.getElementById('paidCount').textContent = paidFees;
    document.getElementById('unpaidCount').textContent = unpaidFees;

  })
  .catch((error) => {
    console.error("Error fetching student counts:", error);

    // Update UI to show error message
    document.getElementById('totalStudents').textContent = 'Error';
    document.getElementById('maleCount').textContent = 'Error';
    document.getElementById('femaleCount').textContent = 'Error';
    document.getElementById('feeStatusTotal').textContent = 'Error';
    document.getElementById('paidCount').textContent = 'Error';
    document.getElementById('unpaidCount').textContent = 'Error';
  });


// Function to handle password for PURCHASE console

function handlePurchaseClick(event) {
  event.preventDefault();

  // Show custom prompt
  const overlay = document.getElementById("passwordPromptOverlay");
  overlay.style.display = "flex";

  // Focus the password input field automatically
  const passwordInput = document.getElementById("passwordPromptInput");
  passwordInput.focus();

  // Function to handle password verification
  function verifyPassword() {
    const password = document.getElementById("passwordPromptInput").value;

    // Check if password is correct
    if (password === "admin@inv") {
      // Redirect to the purchase route
      window.location.href = "/inventory/purchase";
    } else {
      // Show an error message or handle incorrect password
      // alert('Incorrect password!');
      showToast("Invalid password", true);
      document.getElementById("passwordPromptInput").value = "";
    }

    // Hide custom prompt and clear the input
    // overlay.style.display = 'none';
  }

  // Handle OK button click
  document.getElementById("passwordPromptOk").onclick = verifyPassword;

  // Handle Enter key press in the password input field
  document.getElementById("passwordPromptInput").onkeypress = function (event) {
    if (event.key === "Enter") {
      verifyPassword();
    }
  };

  // Handle Cancel button click
  document.getElementById("passwordPromptCancel").onclick = function () {
    // Hide custom prompt and clear the input
    overlay.style.display = "none";
    document.getElementById("passwordPromptInput").value = "";
  };
}

// Add event listener to the Purchase link
const purchaseLink = document.getElementById("purchaseLink");
purchaseLink.addEventListener("click", handlePurchaseClick);

// Function to display toast message
function showToast(message, isError) {
  const toastContainer = document.getElementById("toast-container");

  // Create a new toast element
  const toast = document.createElement("div");
  toast.classList.add("toast");
  if (isError) {
    toast.classList.add("error");
  }
  toast.textContent = message;

  // Append the toast to the container
  toastContainer.appendChild(toast);

  // Show the toast
  toast.style.display = "block";

  // Remove the toast after 4 seconds
  setTimeout(function () {
    toast.style.animation = "slideOutRight 0.5s forwards";
    toast.addEventListener("animationend", function () {
      toast.remove();
    });
  }, 4000);
}

/*
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
*/

/* Pause animation when tab becomes hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Tab is hidden, cancel animation
        if (animationFrameId) {
            window.cancelAnimationFrame(animationFrameId);
        }
    } else {
        // Tab is visible again, resume animation
        updateCountWithAnimation('registeredStudentsCount', /* valueCallback );
        updateCountWithAnimation('admittedStudentsCount', /* valueCallback );
        updateCountWithAnimation('registeredTeachersCount', /* valueCallback );
        updateCountWithAnimation('admittedTeachersCount', /* valueCallback );
    }
}); 
*/

/*
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
}*/
