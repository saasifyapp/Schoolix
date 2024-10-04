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

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            loginScreen.classList.add('hidden');
            driverConsole.classList.remove('hidden');
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
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const targetUrl = encodeURIComponent('https://schoolix.saasifyapp.com/test_transport_details');
        try {
            const response = await fetch(proxyUrl + targetUrl);
            const data = await response.json();
            const driverData = JSON.parse(data.contents);
            displayDriverDetails(driverData);
        } catch (error) {
            console.error('Error fetching driver details:', error);
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