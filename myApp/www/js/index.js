document.addEventListener('DOMContentLoaded', () => {
    // Function to check if a session is already active
    function checkSession() {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (token && userType) {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            if (currentTime < tokenPayload.exp) {
                // Token is still valid, redirect based on user type
                redirectToConsole(userType);
                return true;
            } else {
                // Token has expired, clear local storage
                localStorage.clear();
            }
        }
        return false;
    }
  
    // Function to redirect based on user type
    function redirectToConsole(userType) {
        if (userType === 'driver' || userType === 'conductor') {
            window.location.href = './transport_console.html';
        } else if (userType === 'teacher') {
            window.location.href = './teacher_console.html';
        } else if (userType === 'student') {
            window.location.href = './student_console.html';
        }
    }

    // Check if a session is already active
    if (!checkSession()) {
        const loginButton = document.getElementById('login-button');

        if (loginButton) {
            loginButton.addEventListener('click', async (event) => {
                event.preventDefault(); // Prevent form submission

                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                // Check if username or password is empty
                if (!username || !password) {
                    alert('Please enter both username and password.');
                    return;
                }

                try {
                    const response = await fetch('https://schoolix.saasifyapp.com/android-login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username, password })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        if (data.message === 'Unauthorized Login. Please contact the school admin.') {
                            alert('Unauthorized Login. Please contact the school admin.');
                        } else if (data.message === 'No database details found for the school. Please contact the admin.') {
                            alert('Unauthorized Login. Please contact the school admin.');
                        } else {
                            alert(data.message || 'Login failed');
                        }
                        return;
                    }

                    // Store credentials and session details in local storage
                    localStorage.setItem('token', data.accessToken);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    localStorage.setItem('dbCredentials', JSON.stringify(data.dbCredentials));
                    localStorage.setItem('driverName', data.name); // Store the original name
                    localStorage.setItem('userType', data.type); // Store the user type

                    // Redirect to the appropriate console based on user type
                    redirectToConsole(data.type);
                } catch (error) {
                    console.error('Error during login:', error);
                    alert('An error occurred during login. Please try again.');
                }
            });
        }
    }
});

// Function to toggle password visibility
function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password i');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}