


// Sign-out button functionality
document.getElementById('signout-button').addEventListener('click', async function () {
    // Ask for confirmation before signing out
    const confirmation = confirm("Are you sure you want to sign out?");
    if (confirmation) {
        // Get the refresh token from localStorage or sessionStorage
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

        if (refreshToken) {
            try {
                // Call the sign-out endpoint to invalidate the refresh token
                await fetch('https://schoolix.saasifyapp.com//android-signout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: refreshToken })
                });
            } catch (error) {
                console.error('Error signing out:', error);
            }
        }

        // Clear localStorage or sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to the login page
        window.location.href = './index.html';
    }
});