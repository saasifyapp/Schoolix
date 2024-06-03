document.addEventListener("DOMContentLoaded", function () {
  // Get all buttons in the cards container
  var buttons = document.querySelectorAll(".cards-container .card button");

  // Loop through each button and add click event listener
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      // Get the parent card element
      var parentCard = button.closest(".card");

      // Check the class of the parent card to determine which overlay to show
      if (parentCard.classList.contains("add-vendor")) {
        // Show the add vendor overlay
        document.getElementById("addVendorOverlay").style.display = "block";
        refreshData();
      } else if (parentCard.classList.contains("add-book")) {
        // Show the add books overlay
        document.getElementById("addBooksOverlay").style.display = "block";
        refreshbooksData();
      } else if (parentCard.classList.contains("add-uniform")) {
        // Show the add uniform overlay
        document.getElementById("addUniformOverlay").style.display = "block";
        refreshUniformsData();
      } else if (parentCard.classList.contains("purchase-reports")) {
        // Show the purchase reports overlay
        document.getElementById("purchaseReportsOverlay").style.display =
          "block";
        // refreshAllTables();
      } else if (parentCard.classList.contains("generate-invoice")) {
        // Show the purchase reports overlay
        document.getElementById("generateinvoiceOverlay").style.display =
          "block";
      }
    });
  });

  // Close the overlay when clicking on the overlay content area
  
});

// JavaScript function to close the overlay
function closeOverlay(event) {
  var overlay = event.target.closest(".overlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

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
  toast.style.display = 'block';

  // Remove the toast after 4 seconds
  setTimeout(function () {
      toast.style.animation = 'slideOutRight 0.5s forwards';
      toast.addEventListener('animationend', function () {
          toast.remove();
      });
  }, 4000);
}

document.getElementById("logoutButton").addEventListener("click", function () {
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
        }
      })
      .catch((error) => console.error("Error during logout:", error));
  }
});

// Function to show the loading animation
function showLoadingAnimation() {
  var loadingOverlay = document.getElementById("loadingOverlayinventory");
  loadingOverlay.style.backgroundColor = "#25b09b"; // Change background color to green
  document.body.classList.add("blur");
}

// Function to hide the loading animation
function hideLoadingAnimation() {
  var loadingOverlay = document.getElementById("loadingOverlayinventory");
  loadingOverlay.style.display = "none"; // Hide the loading overlay
  document.body.classList.remove("blur");
}

// Show loading animation when the window starts loading
window.addEventListener("load", function () {
  hideLoadingAnimation(); // Hide loading animation when page is fully loaded
});

// Hide loading animation when the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
  showLoadingAnimation(); // Show loading animation when page starts loading
});


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

