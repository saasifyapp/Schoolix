document.addEventListener('deviceready', function () {
    const driverDetailsScreen = document.getElementById('driver-details-screen');
    const detailedStudentList = document.getElementById('detailed-student-list');
    const selectedShiftField = document.getElementById('selected-shift');
    const totalStopsField = document.getElementById('total-stops');
    const totalStudentsField = document.getElementById('total-students');
    const searchBar = document.getElementById('search-bar');

    let token = localStorage.getItem('token');
    let refreshToken = localStorage.getItem('refreshToken');
    let dbCredentials = JSON.parse(localStorage.getItem('dbCredentials'));
    let driverName = localStorage.getItem('driverName');
    let routeStops = []; // Store route stops
    let studentsData = []; // Store the fetched students data
    let currentShiftName = ''; // Store the current shift name

    if (!dbCredentials) {
        console.error('Database credentials not found in local storage.');
        alert('Session expired. Please log in again.');
        window.location.href = './index.html';
        return;
    }

    const showSpinner = () => {
        const spinnerContainer = document.getElementById('spinnerContainer');
        if (spinnerContainer) {
            spinnerContainer.style.display = 'flex'; // Show spinner container
        }
    };

    const hideSpinner = () => {
        const spinnerContainer = document.getElementById('spinnerContainer');
        if (spinnerContainer) {
            spinnerContainer.style.display = 'none'; // Hide spinner container
        }
    };

    const fetchShiftDetails = async (shift) => {
        showSpinner();
        try {
            const response = await fetch(`https://schoolix.saasifyapp.com/android/shift-details?driverName=${driverName}&shiftName=${shift}`, {
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
                throw new Error('Failed to fetch shift details');
            }

            const data = await response.json();
            console.log(`Fetched shift details:`, data); // Log the shift details fetched
            displayShiftDetails(data);
            routeStops = data.route_stops.split(', '); // Store route stops
        } catch (error) {
            console.error('Error fetching shift details:', error);
            alert('Error fetching shift details');
        } finally {
            hideSpinner();
        }
    };

    const displayShiftDetails = (data) => {
        selectedShiftField.textContent = data.shift_name;
        totalStopsField.textContent = data.route_stops_count;
        totalStudentsField.textContent = data.students_tagged;
        currentShiftName = data.shift_name; // Store the current shift name
    };

    const fetchDriverListForShift = async (shift) => {
        showSpinner();
        try {
            const vehicleNo = localStorage.getItem('vehicleNo');
            const shiftName = shift;

            console.log(`Fetching driver list for shift: ${shiftName}, vehicleNo: ${vehicleNo}`);

            let response = await fetch(`https://schoolix.saasifyapp.com/android/get-student-details?vehicleNo=${vehicleNo}&shiftName=${shiftName}`, {
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
                console.log('Token expired. Attempting to refresh token...');
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

                    console.log('Token refreshed successfully. Retrying fetch for driver list...');
                    response = await fetch(`https://schoolix.saasifyapp.com/android/get-student-details?vehicleNo=${vehicleNo}&shiftName=${shiftName}`, {
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
                    console.error('Failed to refresh token. Redirecting to login...');
                    alert('Session expired. Please log in again.');
                    window.location.href = './index.html';
                    return;
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch student details. Status: ${response.status}, Error: ${errorText}`);
                throw new Error('Failed to fetch student details');
            }

            const data = await response.json();
            console.log(`Fetched ${data.length} item(s)`); // Log the count of items fetched
            studentsData = data; // Store the fetched students data
            displayDriverList(data);
        } catch (error) {
            console.error('Error fetching student details:', error);
            alert('Error fetching student details');
        } finally {
            hideSpinner();
        }
    };

    const displayDriverList = (data) => {
        // Clear previous list
        detailedStudentList.innerHTML = '';

        if (!data || data.length === 0) {
            console.warn('No data available to display.');
            return;
        }

        // Group students and teachers by routes
        const groupedByRoute = data.reduce((acc, item) => {
            const route = item.transport_pickup_drop;
            if (!acc[route]) {
                acc[route] = [];
            }
            acc[route].push(item);
            return acc;
        }, {});

        // Sort routes based on routeStops order
        const sortedRoutes = Object.keys(groupedByRoute).sort((a, b) => {
            return routeStops.indexOf(a) - routeStops.indexOf(b);
        });

        // Colors for different routes
        const routeColors = ['#ffdddd', '#ddffdd', '#ddddff', '#ffffdd', '#ddffff', '#ffddff'];

        // Render each route and its students/teachers
        sortedRoutes.forEach((route, index) => {
            // Create a route container
            const routeContainer = document.createElement('div');
            routeContainer.classList.add('route-container');
            routeContainer.style.backgroundColor = routeColors[index % routeColors.length];
            routeContainer.style.width = '100%'; // Ensure full width

            // Create a route header with student/teacher count
            const studentCount = groupedByRoute[route].filter(item => item.class !== 'Teacher').length;
            const teacherCount = groupedByRoute[route].filter(item => item.class === 'Teacher').length;
            const routeHeader = document.createElement('h4');
            routeHeader.textContent = `Stop: ${route} | Students: ${studentCount} | Teachers: ${teacherCount}`;
            routeContainer.appendChild(routeHeader);

            // Create a list for the students/teachers
            const list = document.createElement('ul');
            list.classList.add('student-list');
            list.style.width = '100%'; // Ensure full width

            // Render students/teachers for this route
            groupedByRoute[route].forEach(item => {
                const listItem = document.createElement('li');
                listItem.style.width = '100%'; // Ensure full width
                listItem.style.margin = '0'; // Remove margin
                listItem.style.boxSizing = 'border-box'; // Include padding and border in the element's total width and height

                listItem.innerHTML = `
                    <div class="item-content" style="width: 100%;">
                        <p class="student-name">Name: ${item.name}</p>
                        <p class="student-class">Class: ${item.class}</p>
                        <p class="student-contact">Contact: ${item.f_mobile_no}</p>
                        <p class="student-pickup-drop">Pickup-Drop: ${item.transport_pickup_drop}</p>
                    </div>
                   <div class="button-group">
    <button class="not-picked">
        <img src="./img/not_pick.png" alt="Not Picked">
        <span>Not Picked</span>
    </button>
    <button class="not-dropped">
        <img src="./img/not_drop.png" alt="Not Dropped">
        <span>Not Dropped</span>
    </button>
    <button class="call-button">
        <img src="./img/call.png" alt="Call">
    </button>
</div>
                `;
                list.appendChild(listItem);

                // Event listener for "Not Picked" button
                listItem.querySelector('.not-picked')?.addEventListener('click', async () => {
                    console.log(`Not Picked button clicked for ${item.name}`);
                    const standard = item.class === 'Teacher' ? 'Teacher' : item.class; // Check if class is "Teacher"
                    const result = await logPickDropEvent(item.name, item.transport_pickup_drop, 'not_picked', currentShiftName, standard);
                    if (result === 'exists') {
                        alert('Already marked under not_picked category for today');
                    } else {
                        alert(`${item.name} not picked`);
                    }
                });

                // Event listener for "Not Dropped" button
                listItem.querySelector('.not-dropped')?.addEventListener('click', async () => {
                    console.log(`Not Dropped button clicked for ${item.name}`);
                    const standard = item.class === 'Teacher' ? 'Teacher' : item.class; // Check if class is "Teacher"
                    const result = await logPickDropEvent(item.name, item.transport_pickup_drop, 'not_dropped', currentShiftName, standard);
                    if (result === 'exists') {
                        alert('Already marked under not_dropped category for today');
                    } else {
                        alert(`${item.name} not dropped`);
                    }
                });

                listItem.querySelector('.call-button')?.addEventListener('click', () => {
                    console.log(`Call button clicked for ${item.name}`);
                    window.location.href = `tel:${item.f_mobile_no}`;
                });
            });

            // Append the list to the route container
            routeContainer.appendChild(list);

            // Append the route container to the detailed student list
            detailedStudentList.appendChild(routeContainer);
        });
    };

    // Search functionality
    searchBar.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredData = studentsData.filter(student =>
            student.name.toLowerCase().includes(searchTerm) ||
            student.class.toLowerCase().includes(searchTerm) ||
            student.f_mobile_no.toLowerCase().includes(searchTerm) ||
            student.transport_pickup_drop.toLowerCase().includes(searchTerm)
        );
        displayDriverList(filteredData);
    });

    const logPickDropEvent = async (studentName, pickDropLocation, typeOfLog, shift, standard) => {
        const vehicleNo = localStorage.getItem('vehicleNo');
        const driverName = localStorage.getItem('driverName');

        try {
            const response = await fetch('https://schoolix.saasifyapp.com/android/log-pick-drop-event', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'db-host': dbCredentials.host,
                    'db-user': dbCredentials.user,
                    'db-password': dbCredentials.password,
                    'db-database': dbCredentials.database
                },
                body: JSON.stringify({
                    studentName: studentName,
                    pickDropLocation: pickDropLocation,
                    typeOfLog: typeOfLog,
                    vehicleNo: vehicleNo,
                    driverName: driverName,
                    shift: shift,
                    standard: standard
                }),
            });

            if (response.status === 409) {
                return 'exists';
            }

            if (!response.ok) {
                throw new Error(`Failed to log event: ${response.status}`);
            }

            const data = await response.json();
            console.log('Event logged successfully:', data);
            return 'success';
        } catch (error) {
            console.error('Error logging event:', error);
            return 'error';
        }
    };

    // Fetch the shift details and driver list for the shift
    const shift = localStorage.getItem('currentShift');
    fetchShiftDetails(shift);
    fetchDriverListForShift(shift);
});