document.addEventListener('DOMContentLoaded', function () {
    const routeInput = document.getElementById('allocate_inputRoute');
    const routeSuggestionsContainer = document.getElementById('allocate_routeSuggestions');
    const routeDetailContainer = document.getElementById('allocate_routeDetail');

    const shiftInput = document.getElementById('allocate_inputShift');
    const shiftSuggestionsContainer = document.getElementById('allocate_shiftSuggestions');
    const shiftDetailContainer = document.getElementById('allocate_shiftDetail');

    const vehicleInput = document.getElementById('allocate_inputVehicle');
    const vehicleSuggestionsContainer = document.getElementById('allocate_vehicleSuggestions');
    const vehicleDetailContainer = document.getElementById('allocate_vehicleDetail');

    const studentDetailsContainer = document.getElementById('allocate_studentDetails');
    const allocateButton = document.getElementById('allocate_getDetailsButton');
    const scheduleTableBody = document.getElementById('allocate_scheduleTableBody');


    let selectedRouteDetail = '';
    let selectedShiftDetail = '';
    let studentCount = 0;
    let selectedVehicleCapacity = 0;

    routeInput.addEventListener('input', function () {
        const query = this.value;
        if (query.length > 0) {
            fetch(`/allocate_getRouteDetails`)
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
        if (query.length > 0) {
            fetch(`/allocate_getShiftDetails`)
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
        if (query.length > 0) {
            fetch(`/allocate_getVehicleDetails?q=${query}`)
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
                            suggestionItem.textContent = `${driver.vehicle_no} | ${driver.driver_name}`;
                            suggestionItem.dataset.driverName = driver.driver_name || 'N/A';
                            suggestionItem.dataset.vehicleNo = driver.vehicle_no || 'N/A';
                            suggestionItem.dataset.vehicleCapacity = driver.vehicle_capacity || 'N/A';
                            suggestionItem.dataset.conductorName = driver.conductor_name || 'N/A';
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
            if (selectedShiftDetail) {
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
            if (selectedRouteDetail) {
                fetchStudentCount(selectedRouteDetail, selectedShiftDetail);
            }
        }
    });

    vehicleSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedDriver = event.target;
            vehicleInput.value = selectedDriver.dataset.vehicleNo;
            selectedVehicleCapacity = parseInt(selectedDriver.dataset.vehicleCapacity, 10);
            vehicleDetailContainer.innerHTML = `
                <strong>Driver Name:</strong> ${selectedDriver.dataset.driverName}<br>
                <strong>Vehicle No:</strong> ${selectedDriver.dataset.vehicleNo}<br>
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

    function fetchStudentCount(routeStops, shiftClasses) {
        fetch(`/allocate_getStudentCount?routeStops=${encodeURIComponent(routeStops)}&shiftClasses=${encodeURIComponent(shiftClasses)}`)
            .then(response => response.json())
            .then(data => {
                studentCount = data.studentCount;
                studentDetailsContainer.innerHTML = `
                    <strong>Student Count:</strong> ${data.studentCount}
                `;
            })
            .catch(error => console.error('Error fetching student count:', error));
    }

    // BUS TAGGING FUNCTIONALITY //
    allocateButton.addEventListener('click', function () {
        if (!selectedRouteDetail || !selectedShiftDetail || !vehicleInput.value) {
            alert('Please select all fields: route, shift, and vehicle.');
            return;
        }

        if (studentCount <= selectedVehicleCapacity) {
            const requestData = {
                vehicleNo: vehicleInput.value,
                routeStops: selectedRouteDetail,
                shiftClasses: selectedShiftDetail,
                vehicleCapacity: selectedVehicleCapacity,
                routeName: routeInput.value, // Assuming routeInput contains the route name
                shiftName: shiftInput.value  // Assuming shiftInput contains the shift name
            };

            // Log the data being sent to the server
            //console.log('Data sent to server:', requestData);

            // Call the new endpoint to tag the bus to all the listed students
            fetch('/allocate_tagStudentsToBus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Success: Bus allocated successfully!');
                    fetchAndDisplayScheduleDetails();
                } else {
                    alert('Error: Failed to allocate bus.');
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert('Error: Student count exceeds vehicle capacity!');
            fetchAndDisplayScheduleDetails();
        }
        
    });
    // Fetch and display the schedule details in the table
    function fetchAndDisplayScheduleDetails() {
        fetch('/allocate_getScheduleDetails')
            .then(response => response.json())
            .then(data => {
                scheduleTableBody.innerHTML = ''; // Clear existing data
                data.forEach(item => {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>${item.vehicle_no}</td>
                        <td>${item.driver_name}</td>
                        <td>${item.route_name}</td>
                        <td>${item.route_stops}</td>
                        <td>${item.shift_name}</td>
                        <td>${item.classes_alloted}</td>
                        <td>${item.available_seats}</td>
                        <td>${item.students_tagged}</td>
                    `;
                    scheduleTableBody.appendChild(newRow);
                });
            })
            .catch(error => console.error('Error fetching schedule details:', error));
    }

    // Initial data fetch for schedule details
    fetchAndDisplayScheduleDetails();
});