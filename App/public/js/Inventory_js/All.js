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
