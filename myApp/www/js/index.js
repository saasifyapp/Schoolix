document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');

    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

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

                // Store credentials in session storage
                sessionStorage.setItem('token', data.accessToken);
                sessionStorage.setItem('refreshToken', data.refreshToken);
                sessionStorage.setItem('dbCredentials', JSON.stringify(data.dbCredentials));
                sessionStorage.setItem('driverName', data.name); // Store the original name

                // Store credentials in a file
                document.addEventListener('deviceready', function() {
                    requestStoragePermissions(function() {
                        saveCredentialsToFile(data.accessToken, data.refreshToken, data.dbCredentials);
                    });
                });

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

// Function to request storage permissions
function requestStoragePermissions(callback) {
    const permissions = cordova.plugins.permissions;
    const requiredPermissions = [
        permissions.WRITE_EXTERNAL_STORAGE,
        permissions.READ_EXTERNAL_STORAGE
    ];

    permissions.checkPermission(requiredPermissions, function(status) {
        if (!status.hasPermission) {
            permissions.requestPermissions(requiredPermissions, function(status) {
                if (!status.hasPermission) {
                    console.error('Storage permissions not granted');
                } else {
                    console.log('Storage permissions granted');
                    callback();
                }
            }, function(error) {
                console.error('Error requesting storage permissions', error);
            });
        } else {
            console.log('Storage permissions already granted');
            callback();
        }
    }, function(error) {
        console.error('Error checking storage permissions', error);
    });
}

// Function to save credentials to a file
function saveCredentialsToFile(token, refreshToken, dbCredentials) {
    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
        dir.getFile("credentials.json", { create: true, exclusive: false }, function (fileEntry) {
            writeFile(fileEntry, JSON.stringify({
                token: token,
                refreshToken: refreshToken,
                dbCredentials: dbCredentials
            }));
        });
    });
}

function writeFile(fileEntry, dataObj) {
    fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
        };

        fileWriter.onerror = function(e) {
            console.log("Failed file write: " + e.toString());
        };

        fileWriter.write(dataObj);
    });
}