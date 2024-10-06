document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const backButton = document.getElementById('back-button');
    const morningShiftButton = document.getElementById('morning-shift');
    const afternoonShiftButton = document.getElementById('afternoon-shift');
    const backToConsoleButton = document.getElementById('back-to-console-button');
    const loginScreen = document.getElementById('login-screen');
    const driverConsole = document.getElementById('driver-console');
    const driverDetailsScreen = document.getElementById('driver-details-screen');
    const detailedDriverList = document.getElementById('detailed-driver-list');
    const driverName = document.getElementById('driver-name');
    const vehicleNo = document.getElementById('vehicle-no');
    const vehicleCapacity = document.getElementById('vehicle-capacity');
    const conductorName = document.getElementById('conductor-name');

    let token = null;
    let refreshToken = null;
    let dbCredentials = null;

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
                    if (data.message === 'No database details found for the school. Please contact the admin.') {
                        alert('Unauthorized Login. Please contact the school admin.');
                    } else {
                        alert(data.message || 'Login failed');
                    }
                    return;
                }

                token = data.accessToken;
                refreshToken = data.refreshToken;
                dbCredentials = data.dbCredentials;

                loginScreen.classList.add('hidden');
                driverConsole.classList.remove('hidden');
            } catch (error) {
                console.error('Error during login:', error);
                alert(error.message);
            }
        });
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            driverConsole.classList.add('hidden');
            loginScreen.classList.remove('hidden');
        });
    }

    if (backToConsoleButton) {
        backToConsoleButton.addEventListener('click', () => {
            driverDetailsScreen.classList.add('hidden');
            driverConsole.classList.remove('hidden');
        });
    }

    if (morningShiftButton) {
        morningShiftButton.addEventListener('click', () => {
            fetchDriverDetails();
            driverConsole.classList.add('hidden');
            driverDetailsScreen.classList.remove('hidden');
        });
    }

    if (afternoonShiftButton) {
        afternoonShiftButton.addEventListener('click', () => {
            fetchDriverDetails();
            driverConsole.classList.add('hidden');
            driverDetailsScreen.classList.remove('hidden');
        });
    }

    const fetchDriverDetails = async () => {
        try {
            let response = await fetch('http://localhost:3000/android/driver-details', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'db-host': dbCredentials.host,
                    'db-user': dbCredentials.user,
                    'db-password': dbCredentials.password,
                    'db-database': dbCredentials.database
                }
            });

            if (response.status === 401) {
                const refreshResponse = await fetch('http://localhost:3000/refresh-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: refreshToken })
                });

                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    token = refreshData.accessToken;

                    response = await fetch('http://localhost:3000/android/driver-details', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'db-host': dbCredentials.host,
                            'db-user': dbCredentials.user,
                            'db-password': dbCredentials.password,
                            'db-database': dbCredentials.database
                        }
                    });
                } else {
                    alert('Session expired. Please log in again.');
                    return;
                }
            }

            if (!response.ok) {
                throw new Error('Failed to fetch driver details');
            }

            const data = await response.json();
            displayDriverDetails(data);
        } catch (error) {
            console.error('Error fetching driver details:', error);
            alert('Error fetching driver details');
        }
    };

    const displayDriverDetails = (data) => {
        detailedDriverList.innerHTML = '';
        data.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="item-content">
                    <p>Name: ${item.name}</p>
                    <p>Contact: ${item.contact}</p>
                    <p>Vehicle No: ${item.vehicle_no}</p>
                </div>
                <div class="button-group">
                    <button class="add-button">Add</button>
                    <button class="delete-button">Delete</button>
                </div>
            `;
            detailedDriverList.appendChild(listItem);

            listItem.querySelector('.add-button').addEventListener('click', () => {
                alert(`Add button clicked for ${item.name}`);
            });

            listItem.querySelector('.delete-button').addEventListener('click', () => {
                alert(`Delete button clicked for ${item.name}`);
            });
        });

        // Update the driver details card
        if (data.length > 0) {
            const firstDriver = data[0];
            driverName.textContent = firstDriver.name;
            vehicleNo.textContent = firstDriver.vehicle_no;
            vehicleCapacity.textContent = firstDriver.vehicle_capacity || 'N/A';
            conductorName.textContent = firstDriver.conductor_name || 'N/A';
        }
    };
});