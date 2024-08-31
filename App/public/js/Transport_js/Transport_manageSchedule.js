
document.addEventListener('DOMContentLoaded', function () {
    const routeInput = document.getElementById('inputRoute');
    const routeSuggestionsContainer = document.getElementById('routeSuggestions');
    const routeDetailContainer = document.getElementById('routeDetail');

    const shiftInput = document.getElementById('inputShift');
    const shiftSuggestionsContainer = document.getElementById('shiftSuggestions');
    const shiftDetailContainer = document.getElementById('shiftDetail');

    const vehicleInput = document.getElementById('inputVehicle');
    const vehicleSuggestionsContainer = document.getElementById('vehicleSuggestions');
    const vehicleDetailContainer = document.getElementById('vehicleDetail');

    const studentDetailsContainer = document.getElementById('studentDetails');
    const getDetailsButton = document.getElementById('getDetailsButton');

    let selectedRouteDetail = '';
    let selectedShiftDetail = '';
    let selectedVehicleDetail = {};
    let studentCount = 0;

    routeInput.addEventListener('input', function () {
        const query = this.value;
        if (query.length >= 0) {
            fetch(`/getRouteDetails`)
                .then((response) => response.json())
                .then((data) => {
                    routeSuggestionsContainer.style.display = 'flex'; // Show suggestions container
                    routeSuggestionsContainer.innerHTML = '';

                    const filteredData = data.filter(route =>
                        route.route_shift_name.toLowerCase().includes(query.toLowerCase())
                    );

                    if (filteredData.length === 0) {
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        routeSuggestionsContainer.appendChild(noResultsItem);
                    } else {
                        filteredData.forEach((route) => {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.classList.add('suggestion-item');
                            suggestionItem.textContent = route.route_shift_name;
                            suggestionItem.dataset.routeName = route.route_shift_name;
                            suggestionItem.dataset.routeDetail = route.route_shift_detail;
                            routeSuggestionsContainer.appendChild(suggestionItem);
                        });
                    }
                })
                .catch((error) => console.error('Error:', error));
        } else {
            routeSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            routeSuggestionsContainer.innerHTML = '';
        }
    });

    shiftInput.addEventListener('input', function () {
        const query = this.value;
        if (query.length >= 0) {
            fetch(`/getShiftDetails`)
                .then((response) => response.json())
                .then((data) => {
                    shiftSuggestionsContainer.style.display = 'flex'; // Show suggestions container
                    shiftSuggestionsContainer.innerHTML = '';

                    const filteredData = data.filter(shift =>
                        shift.route_shift_name.toLowerCase().includes(query.toLowerCase())
                    );

                    if (filteredData.length === 0) {
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        shiftSuggestionsContainer.appendChild(noResultsItem);
                    } else {
                        filteredData.forEach((shift) => {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.classList.add('suggestion-item');
                            suggestionItem.textContent = shift.route_shift_name;
                            suggestionItem.dataset.shiftName = shift.route_shift_name;
                            suggestionItem.dataset.shiftDetail = shift.route_shift_detail;
                            shiftSuggestionsContainer.appendChild(suggestionItem);
                        });
                    }
                })
                .catch((error) => console.error('Error:', error));
        } else {
            shiftSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            shiftSuggestionsContainer.innerHTML = '';
        }
    });

    vehicleInput.addEventListener('input', function () {
        const query = this.value;
        if (query.length >= 0) {
            fetch(`/getVehicleDetails?q=${query}`)
                .then((response) => response.json())
                .then((data) => {
                    vehicleSuggestionsContainer.style.display = 'flex'; // Show suggestions container
                    vehicleSuggestionsContainer.innerHTML = '';

                    if (data.length === 0) {
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        vehicleSuggestionsContainer.appendChild(noResultsItem);
                    } else {
                        data.forEach((driver) => {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.classList.add('suggestion-item');
                            suggestionItem.textContent = `${driver.vehicle_no} | ${driver.name}`;
                            suggestionItem.dataset.driverName = driver.name;
                            suggestionItem.dataset.vehicleNo = driver.vehicle_no;
                            suggestionItem.dataset.vehicleType = driver.vehicle_type;
                            suggestionItem.dataset.vehicleCapacity = driver.vehicle_capacity;
                            suggestionItem.dataset.conductorName = driver.conductor_name;
                            vehicleSuggestionsContainer.appendChild(suggestionItem);
                        });
                    }
                })
                .catch((error) => console.error('Error:', error));
        } else {
            vehicleSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            vehicleSuggestionsContainer.innerHTML = '';
        }
    });

    routeSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedRoute = event.target;
            routeInput.value = selectedRoute.dataset.routeName;
            selectedRouteDetail = selectedRoute.dataset.routeDetail;
            routeDetailContainer.innerHTML = `
                <strong>Route Name:</strong> ${selectedRoute.dataset.routeName}<br>
                <strong>Stops:</strong> ${selectedRoute.dataset.routeDetail}
            `;
            routeSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            routeSuggestionsContainer.innerHTML = '';

            // Fetch student count if both details are available
            if (selectedRouteDetail && selectedShiftDetail) {
                fetchStudentCount(selectedRouteDetail, selectedShiftDetail);
            }
        }
    });

    shiftSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedShift = event.target;
            shiftInput.value = selectedShift.dataset.shiftName;
            selectedShiftDetail = selectedShift.dataset.shiftDetail;
            shiftDetailContainer.innerHTML = `
                <strong>Shift Name:</strong> ${selectedShift.dataset.shiftName}<br>
                <strong>Classes Alloted:</strong> ${selectedShift.dataset.shiftDetail}
            `;
            shiftSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            shiftSuggestionsContainer.innerHTML = '';

            // Fetch student count if both details are available
            if (selectedRouteDetail && selectedShiftDetail) {
                fetchStudentCount(selectedRouteDetail, selectedShiftDetail);
            }
        }
    });

    vehicleSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedDriver = event.target;
            vehicleInput.value = selectedDriver.dataset.vehicleNo;
            selectedVehicleDetail = {
                driverName: selectedDriver.dataset.driverName,
                vehicleNo: selectedDriver.dataset.vehicleNo,
                vehicleType: selectedDriver.dataset.vehicleType,
                vehicleCapacity: selectedDriver.dataset.vehicleCapacity,
                conductorName: selectedDriver.dataset.conductorName
            };
            vehicleDetailContainer.innerHTML = `
                <strong>Driver Name:</strong> ${selectedDriver.dataset.driverName}<br>
                <strong>Vehicle No:</strong> ${selectedDriver.dataset.vehicleNo}<br>
                <strong>Vehicle Type:</strong> ${selectedDriver.dataset.vehicleType}<br>
                <strong>Vehicle Capacity:</strong> ${selectedDriver.dataset.vehicleCapacity}<br>
                <strong>Conductor Name:</strong> ${selectedDriver.dataset.conductorName}
            `;
            vehicleSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            vehicleSuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!routeSuggestionsContainer.contains(event.target) && !routeInput.contains(event.target)) {
            routeSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            routeSuggestionsContainer.innerHTML = '';
        }
        if (!shiftSuggestionsContainer.contains(event.target) && !shiftInput.contains(event.target)) {
            shiftSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            shiftSuggestionsContainer.innerHTML = '';
        }
        if (!vehicleSuggestionsContainer.contains(event.target) && !vehicleInput.contains(event.target)) {
            vehicleSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            vehicleSuggestionsContainer.innerHTML = '';
        }
    });

    getDetailsButton.addEventListener('click', function (event) {
        event.preventDefault();

        // Ensure all details are selected
        if (!selectedRouteDetail || !selectedShiftDetail || !selectedVehicleDetail.vehicleNo) {
            alert('Please select all details before proceeding.');
            return;
        }

        // Check if student count exceeds vehicle capacity
        if (studentCount > selectedVehicleDetail.vehicleCapacity) {
            alert('Student count exceeds vehicle capacity!');
            return;
        }

        // Prepare data to be sent to the server
        const routeName = routeInput.value;
        const shiftName = shiftInput.value;
        const { driverName, vehicleNo, vehicleType, vehicleCapacity, conductorName } = selectedVehicleDetail;

        const data = {
            vehicle_no: vehicleNo,
            driver_name: driverName,
            conductor_name: conductorName,
            route_name: routeName,
            route_stops: selectedRouteDetail,
            shift_name: shiftName,
            classes_alloted: selectedShiftDetail
        };

        // Send data to the server
        fetch('/populateTransportSchedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Transport schedule details added successfully!');
                } else {
                    alert('Failed to add transport schedule details.');
                }
            })
            .catch(error => console.error('Error:', error));
    });

    function fetchStudentCount(stops, classesAlloted) {
        const stopsArray = stops.split(',').map(stop => stop.trim());
        const classesAllotedArray = classesAlloted.split(',').map(cls => cls.trim());

        // Join the stops array into a comma-separated string
        const stopsString = stopsArray.map(stop => `'${stop}'`).join(',');

        // Join the classesAlloted array into a comma-separated string
        const classesAllotedString = classesAllotedArray.map(cls => `'${cls}'`).join(',');

        fetch(`/getStudentCountforTransport?stops=${encodeURIComponent(stopsString)}&classesAlloted=${encodeURIComponent(classesAllotedString)}`)
            .then(response => response.json())
            .then(data => {
                studentCount = data.studentCount; // Save student count
                studentDetailsContainer.innerHTML = `
                    <strong>Student Count:</strong> ${data.studentCount}
                `;
            })
            .catch(error => console.error('Error fetching student count:', error));
    }
});