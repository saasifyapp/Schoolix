document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const backButton = document.getElementById('back-button');
    const backToConsoleButton = document.getElementById('back-to-console-button');
    const loginScreen = document.getElementById('login-screen');
    const driverConsole = document.getElementById('driver-console');
    const teacherConsole = document.getElementById('teacher-console');
    const studentConsole = document.getElementById('student-console');
    const driverDetailsScreen = document.getElementById('driver-details-screen');
    const detailedDriverList = document.getElementById('detailed-driver-list');
    const driverNameField = document.getElementById('driver-name');
    const vehicleNoField = document.getElementById('vehicle-no');
    const vehicleCapacityField = document.getElementById('vehicle-capacity');
    const conductorNameField = document.getElementById('conductor-name');
    const buttonCard = document.querySelector('.button-card');

    // Shift GIFs
    const shiftGifs = {
        'Morning': './img/morning.gif',
        'Afternoon': './img/afternoon.gif'
    };

    let token = null;
    let refreshToken = null;
    let dbCredentials = null;
    let userType = null;
    let driverName = null;

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
                userType = data.type;
                driverName = username; // Assuming username is the driver's name

                // Clear previous user data
                clearUserData();

                loginScreen.classList.add('hidden');
                
                // Switch to the appropriate console based on user type
                if (userType === 'driver' || userType === 'conductor') {
                    driverConsole.classList.remove('hidden');
                    await fetchDriverDetails(); // Fetch driver details from the new endpoint
                } else if (userType === 'teacher') {
                    teacherConsole.classList.remove('hidden');
                    refreshTeacherConsole();
                } else if (userType === 'student') {
                    studentConsole.classList.remove('hidden');
                    refreshStudentConsole();
                }
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

    const fetchDriverDetails = async () => {
        try {
            const response = await fetch(`https://schoolix.saasifyapp.com/driver-details?driverName=${driverName}`, {
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

            if (!response.ok) {
                throw new Error('Failed to fetch driver details');
            }

            const data = await response.json();
            console.log(`Fetched ${data.length} item(s)`); // Log the count of items fetched
            displayDriverDetails(data);
        } catch (error) {
            console.error('Error fetching driver details:', error);
            alert('Error fetching driver details');
        }
    };

    const displayDriverDetails = (data) => {
        if (data.length > 0) {
            const details = data[0]; // Use the first entry to populate the fields
            driverNameField.textContent = details.driver_name;
            vehicleNoField.textContent = details.vehicle_no;
            vehicleCapacityField.textContent = details.vehicle_capacity || 'N/A';
            conductorNameField.textContent = details.conductor_name || 'N/A';

            // Clear existing buttons
            buttonCard.innerHTML = '';

            // Determine the shifts available
            const shifts = new Set(data.map(entry => entry.shift_name.trim()));
            console.log('Available shifts:', shifts); // Debugging line

            // Create buttons based on available shifts
            let shiftIndex = 1;
            shifts.forEach(shift => {
                const shiftButton = document.createElement('div');
                shiftButton.classList.add('shift-button');
                shiftButton.innerHTML = `
                    <img src="${shiftGifs[shiftIndex === 1 ? 'Morning' : 'Afternoon']}" alt="Shift GIF" class="shift-gif">
                    <span>${shift} Shift</span>
                `;
                shiftButton.addEventListener('click', () => {
                    fetchDriverListForShift(shift);
                    driverConsole.classList.add('hidden');
                    driverDetailsScreen.classList.remove('hidden');
                });
                buttonCard.appendChild(shiftButton);
                shiftIndex++;
            });
        } else {
            alert('No details found for the driver.');
        }
    };

    const fetchDriverListForShift = async (shift) => {
        try {
            const vehicleNo = vehicleNoField.textContent;
            const shiftName = shift;

            const response = await fetch(`https://schoolix.saasifyapp.com/android/driver-details?vehicleNo=${vehicleNo}&shiftName=${shiftName}`, {
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
                const refreshResponse = await fetch('https://schoolix.saasifyapp.com/refresh-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: refreshToken })
                });

                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    token = refreshData.accessToken;

                    response = await fetch(`https://schoolix.saasifyapp.com/android/driver-details?vehicleNo=${vehicleNo}&shiftName=${shiftName}`, {
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
            console.log(`Fetched ${data.length} item(s)`); // Log the count of items fetched
            displayDriverList(data);
        } catch (error) {
            console.error('Error fetching driver details:', error);
            alert('Error fetching driver details');
        }
    };

    const displayDriverList = (data) => {
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
    };

    const clearUserData = () => {
        // Clear driver details
        detailedDriverList.innerHTML = '';
        driverNameField.textContent = '';
        vehicleNoField.textContent = '';
        vehicleCapacityField.textContent = '';
        conductorNameField.textContent = '';
        buttonCard.innerHTML = ''; // Clear existing buttons

        // Clear other user-specific data if needed
    };

    const refreshDriverConsole = () => {
        // Add logic to refresh driver console content
        console.log('Refreshing Driver Console...');
        // You can add more logic here to refresh specific parts of the driver console if needed
    };

    const refreshTeacherConsole = () => {
        // Add logic to refresh teacher console content
        console.log('Refreshing Teacher Console...');
        // You can add more logic here to refresh specific parts of the teacher console if needed
    };

    const refreshStudentConsole = () => {
        // Add logic to refresh student console content
        console.log('Refreshing Student Console...');
        // You can add more logic here to refresh specific parts of the student console if needed
    };
});