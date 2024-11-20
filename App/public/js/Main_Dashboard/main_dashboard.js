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

// Function to retrieve the value of a cookie by name
function getCookieValue(cookieName) {
  const cookies = document.cookie.split(";");  // Split the cookies by semicolon
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");  // Trim spaces and split each cookie
    if (name === cookieName) {
      return decodeURIComponent(value);  // Decode and return the cookie value
    }
  }
  return null;  // Return null if cookie not found
}

// Example usage
const username = getCookieValue("username");
if (username) {
  console.log("Username from cookie:", username);
} else {
  console.log("Username cookie not found.");
}


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


////////////////// LOCATION FUNCTIONALITY AND AUTO CREATE TABLE ENDPOINTS CALLS ///////////
document.addEventListener('DOMContentLoaded', () => {

    // Call the endpoint to create tables if they do not exist
    fetch('/create_tables')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('Tables created or already exist.');
      } else {
        console.error('Error creating tables:', data.error);
      }
    })
    .catch(error => console.error('Error creating tables:', error));

    
  const locationDropbtn = document.querySelector('.location_dropbtn');
  const locationDropdownContent = document.querySelector('.location_dropdown-content');
  
  // Toggle dropdown visibility on button click
  locationDropbtn.addEventListener('click', () => {
      locationDropdownContent.style.display = locationDropdownContent.style.display === 'block' ? 'none' : 'block';
  });

  // Close dropdown when clicking outside of it
  window.addEventListener('click', (event) => {
      if (!locationDropbtn.contains(event.target) && !locationDropdownContent.contains(event.target)) {
          locationDropdownContent.style.display = 'none';
      }
  });

  // Select the buttons in the dropdown
  const autoDetectLocationButton = document.getElementById('auto_detectLocation');
  const manuallyAddLocationButton = document.getElementById('manually_addLocation');

  // Add event listener to the auto-detect location button
  autoDetectLocationButton.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent default link behavior

      // Call the autoDetectLocation function with the retrieved username
      await autoDetectLocation(username);
  });

  // Add event listener to the manually add location button
  manuallyAddLocationButton.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent default link behavior

      // Show the Swal popup for manually adding location
      const { value: formValues } = await Swal.fire({
          title: 'Manually Add Location',
          html:
            '<input id="swal-input1" class="swal2-input" placeholder="Latitude">' +
            '<input id="swal-input2" class="swal2-input" placeholder="Longitude">',
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'Submit',
          cancelButtonText: 'Close',
          preConfirm: () => {
              return [
                  document.getElementById('swal-input1').value,
                  document.getElementById('swal-input2').value
              ]
          }
      });

      if (formValues) {
          const [latitude, longitude] = formValues;
          if (latitude && longitude) {
              // Call the manualAddLocation function with the user-entered latitude and longitude
              await manualAddLocation(username, latitude, longitude);
          } else {
              Swal.fire({
                  icon: 'error',
                  title: 'Invalid Input',
                  text: 'Please enter both latitude and longitude.',
              });
          }
      }
  });
});

async function autoDetectLocation(loginName) {
  // Check the user's confirmation status
  const statusResponse = await fetch('/check-confirmation-status', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loginName: loginName }),
  });

  const statusData = await statusResponse.json();

  // Check if the user is found and if confirmation is needed
  if (statusData.error) {
      console.error(statusData.error);
      return; // Handle error if user is not found
  }

  // Show the confirmation alert regardless of the confirmed_at_school status
  const result = await Swal.fire({
      title: "Are you at the school's location?",
      text: "Please confirm if you're currently at the school.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, I am',
      cancelButtonText: 'No',
  });

  if (result.isConfirmed) {
      // Get the user's coordinates automatically
      navigator.geolocation.getCurrentPosition(async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          await sendLocationToServer(loginName, latitude, longitude);
      }, (error) => {
          console.error('Error getting location:', error);
          Swal.fire({
              icon: 'error',
              title: 'Location Error',
              text: 'Failed to get your location. Please enable location services and try again.',
          });
      });
  } else {
      await Swal.fire({
          icon: 'info',
          title: 'Location Not Confirmed',
          text: 'Please confirm your location at the next login.',
      });
  }
}

async function manualAddLocation(loginName, latitude, longitude) {
  // Directly send the manually entered coordinates to the server
  await sendLocationToServer(loginName, latitude, longitude);
}

async function sendLocationToServer(loginName, latitude, longitude) {
  // Send the coordinates to the server and confirm the location
  const response = await fetch('/confirm-location', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          loginName: loginName,
          latitude: latitude,
          longitude: longitude,
      }),
  });

  const data = await response.json();
  if (data.success) {
      await Swal.fire({
          icon: 'success',
          title: 'Location Confirmed',
          text: 'Your location has been confirmed and saved.',
      });
  } else {
      await Swal.fire({
          icon: 'info',
          title: 'Location Already Confirmed',
          text: 'You have already confirmed your location.',
      });
  }
}

///////////////////////////////////////// GET VALUES FOR LIBRARY CONSOLE ON DASHBOARD ////////////////////////////

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
        // Primary Data
        const totalStudents = data.primary_totalStudents;
        const maleStudents = data.primary_maleStudents;
        const femaleStudents = data.primary_femaleStudents;

        // Calculate percentages for primary
        const malePercentage = (maleStudents / totalStudents) * 100;
        const femalePercentage = 100 - malePercentage;

        // Update Primary Pie Chart
        document.querySelector('.male_female_graph .chart').style.background = 
          `conic-gradient(#82afe3 ${malePercentage}%, #8cefda ${malePercentage}%)`;

        // Update Primary Labels
        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('maleCount').textContent = maleStudents;
        document.getElementById('femaleCount').textContent = femaleStudents;

        // Pre-Primary Data
        const prePrimaryTotalStudents = data.pre_primary_totalStudents;
        const prePrimaryMaleStudents = data.pre_primary_maleStudents;
        const prePrimaryFemaleStudents = data.pre_primary_femaleStudents;

        // Calculate percentages for pre-primary
        const prePrimaryMalePercentage = (prePrimaryMaleStudents / prePrimaryTotalStudents) * 100;
        const prePrimaryFemalePercentage = 100 - prePrimaryMalePercentage;

        // Update Pre-Primary Pie Chart
        document.querySelector('.fee_status .chart').style.background = 
          `conic-gradient(#c3ebfa ${prePrimaryMalePercentage}%, #fae27c ${prePrimaryMalePercentage}%)`;

        // Update Pre-Primary Labels
        document.getElementById('prePrimaryTotal').textContent = prePrimaryTotalStudents;
        document.getElementById('prePrimaryMaleCount').textContent = prePrimaryMaleStudents;
        document.getElementById('prePrimaryFemaleCount').textContent = prePrimaryFemaleStudents;
    })
    .catch((error) => {
        console.error("Error fetching student counts:", error);

        // Update UI to show error message for both charts
        document.getElementById('totalStudents').textContent = 'Error';
        document.getElementById('maleCount').textContent = 'Error';
        document.getElementById('femaleCount').textContent = 'Error';

        document.getElementById('prePrimaryTotal').textContent = 'Error';
        document.getElementById('prePrimaryMaleCount').textContent = 'Error';
        document.getElementById('prePrimaryFemaleCount').textContent = 'Error';
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
async function confirmSchoolLocation(loginName) {
  // Check the user's confirmation status
  const statusResponse = await fetch('/check-confirmation-status', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loginName: loginName }),
  });

  const statusData = await statusResponse.json();

  // Check if the user is found and if confirmation is needed
  if (statusData.error) {
      console.error(statusData.error);
      return; // Handle error if user is not found
  }

  // Proceed only if confirmed_at_school is 0
  if (statusData.confirmed_at_school === 0) {
      // Ask the user if they are at the school's location using Swal
      const result = await Swal.fire({
          title: "Are you at the school's location?",
          text: "Please confirm if you're currently at the school.",
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, I am',
          cancelButtonText: 'No',
      });

      // Get the user's coordinates
      navigator.geolocation.getCurrentPosition(async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          if (result.isConfirmed) {
              // Send the coordinates to the server and confirm the location
              const response = await fetch('/confirm-location', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      loginName: loginName,
                      latitude: latitude,
                      longitude: longitude,
                  }),
              });

              const data = await response.json();
              if (data.success) {
                  await Swal.fire({
                      icon: 'success',
                      title: 'Location Confirmed',
                      text: 'Your location has been confirmed and saved.',
                  });
              } else {
                  await Swal.fire({
                      icon: 'info',
                      title: 'Location Already Confirmed',
                      text: 'You have already confirmed your location.',
                  });
              }
          } else {
              await Swal.fire({
                  icon: 'info',
                  title: 'Location Not Confirmed',
                  text: 'Please confirm your location at the next login.',
              });
          }
      }, (error) => {
          console.error('Error getting location:', error);
          Swal.fire({
              icon: 'error',
              title: 'Location Error',
              text: 'Failed to get your location. Please enable location services and try again.',
          });
      });
  } 
}


// Call this function when the user logs in, passing the login name
confirmSchoolLocation(username); // Replace with the actual login name


