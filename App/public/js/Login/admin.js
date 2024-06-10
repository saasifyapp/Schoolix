document.getElementById('configForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const formData = {
        loginName: document.getElementById('loginName').value,
        loginPassword: document.getElementById('loginPassword').value,
        serverName: document.getElementById('serverName').value,
        databaseUser: document.getElementById('databaseUser').value,
        databasePassword: document.getElementById('databasePassword').value,
        databaseName: document.getElementById('databaseName').value,
        schoolName: document.getElementById('schoolName').value,
    };

    // Send data to the server
    fetch('/submit-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        showToast('Configuration submitted successfully');
    })
    .catch((error) => {
        console.error('Error:', error);
        showToast('Error submitting configuration');
    });
});

// Automatically fill databaseName when databaseUser is typed
document.getElementById('databaseUser').addEventListener('input', function() {
    document.getElementById('databaseName').value = this.value;
});

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
                    showToast('Login Failed');
                }
            })
            .catch(error => console.error('Error during logout:', error));
    }

});

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