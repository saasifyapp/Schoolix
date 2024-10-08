document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');

    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/android-login', {
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

                // Store credentials in session storage
                sessionStorage.setItem('token', data.accessToken);
                sessionStorage.setItem('refreshToken', data.refreshToken);
                sessionStorage.setItem('dbCredentials', JSON.stringify(data.dbCredentials));
                sessionStorage.setItem('driverName', username);

                const userType = data.type;

                // Redirect to the appropriate console based on user type
                if (userType === 'driver' || userType === 'conductor') {
                    window.location.href = './transport_console.html';
                } else if (userType === 'teacher') {
                    window.location.href = './teacher_console.html';
                } else if (userType === 'student') {
                    window.location.href = './student_console.html';
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert(error.message);
            }
        });
    }
});