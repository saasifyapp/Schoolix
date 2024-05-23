document.addEventListener("DOMContentLoaded", function () {
    // Get all buttons in the cards container
    var buttons = document.querySelectorAll('.cards-container .card button');

    // Loop through each button and add click event listener
    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            // Get the parent card element
            var parentCard = button.closest('.card');
            
            // Check the class of the parent card to determine which overlay to show
            if (parentCard.classList.contains('add-vendor')) {
                // Show the add vendor overlay
                document.getElementById('addVendorOverlay').style.display = 'block';
                refreshData();
            } else if (parentCard.classList.contains('add-book')) {
                // Show the add books overlay
                document.getElementById('addBooksOverlay').style.display = 'block';
                refreshbooksData();
            } else if (parentCard.classList.contains('add-uniform')) {
                // Show the add uniform overlay
                document.getElementById('addUniformOverlay').style.display = 'block';
                refreshUniformsData();
            } else if (parentCard.classList.contains('purchase-reports')) {
                // Show the purchase reports overlay
                document.getElementById('purchaseReportsOverlay').style.display = 'block';
                refreshAllTables();
            }
        });
    });

    // Close the overlay when clicking on the overlay content area
    document.querySelectorAll('.overlay').forEach(function (overlay) {
        overlay.addEventListener('click', function (event) {
            if (event.target === this) {
                this.style.display = 'none';
            }
        });
    });
});

// JavaScript function to close the overlay
function closeOverlay(event) {
    var overlay = event.target.closest('.overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Function to display toast message
function showToast(message, isError) {
    const toast = document.getElementById('toast');
    toast.textContent = message;

    // Set class based on isError flag
    if (isError) {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }

    // Show the toast
    toast.style.display = 'block';

    // Hide the toast after 3 seconds
    setTimeout(function () {
        toast.style.display = 'none';
    }, 3000);
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
