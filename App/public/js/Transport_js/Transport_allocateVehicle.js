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

    function fetchRouteDetails(query = '') {
        fetch(`/allocate_getRouteDetails`)
            .then((response) => response.json())
            .then((data) => {
                routeSuggestionsContainer.style.display = 'flex'; // Show suggestions container
                routeSuggestionsContainer.innerHTML = '';

                const filteredData = query
                    ? data.filter(route => route.route_shift_name.toLowerCase().includes(query.toLowerCase()))
                    : data;

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
    }

    routeInput.addEventListener('focus', function () {
        fetchRouteDetails();
    });

    routeInput.addEventListener('input', function () {
        fetchRouteDetails(this.value);
    });

    function fetchShiftDetails(routeName, query = '') {
        fetch(`/allocate_getShiftDetails?routeName=${encodeURIComponent(routeName)}`)
            .then((response) => response.json())
            .then((data) => {
                shiftSuggestionsContainer.style.display = 'flex'; // Show suggestions container
                shiftSuggestionsContainer.innerHTML = '';

                

                const filteredData = query
                    ? data.filter(shift => shift.route_shift_name.toLowerCase().includes(query.toLowerCase()))
                    : data;

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
    }

    shiftInput.addEventListener('focus', function () {
        if (routeInput.value) {
            fetchShiftDetails(routeInput.value);
        }
    });

    shiftInput.addEventListener('input', function () {
        if (routeInput.value) {
            fetchShiftDetails(routeInput.value, this.value);
        }
    });

    function fetchVehicleDetails(routeName, shiftName, query = '') {
        fetch(`/allocate_getVehicleDetails?q=${encodeURIComponent(query)}&routeName=${encodeURIComponent(routeName)}&shiftName=${encodeURIComponent(shiftName)}`)
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
                        suggestionItem.dataset.availableSeats = driver.available_seats || 0; // Fallback to 0 if null or 0
                        suggestionItem.dataset.conductorName = driver.conductor_name || 'N/A';
                        vehicleSuggestionsContainer.appendChild(suggestionItem);
                    });
                }
            })
            .catch((error) => console.error('Error:', error));
    }

    vehicleInput.addEventListener('focus', function () {
        if (routeInput.value && shiftInput.value) {
            fetchVehicleDetails(routeInput.value, shiftInput.value);
        }
    });

    vehicleInput.addEventListener('input', function () {
        if (routeInput.value && shiftInput.value) {
            fetchVehicleDetails(routeInput.value, shiftInput.value, this.value);
        }
    });

    routeSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedRoute = event.target;
            routeInput.value = selectedRoute.dataset.routeName;
    
            // Populate the route details
            const selectedRouteDetail = {
                routeName: selectedRoute.dataset.routeName || "N/A",
                routeDetail: selectedRoute.dataset.routeDetail || "N/A",
            };
    
            routeDetailContainer.innerHTML = `
                <strong>Route Name:</strong> ${selectedRouteDetail.routeName}<br>
                <strong>Stops:</strong> ${selectedRouteDetail.routeDetail}
            `;
    
            // Show the route detail container
            routeDetailContainer.style.display = 'block';
    
            // Hide suggestions container
            routeSuggestionsContainer.style.display = 'none';
            routeSuggestionsContainer.innerHTML = ''; // Clear suggestions
    
            // Clear shift input and suggestions when a new route is selected
            shiftSuggestionsContainer.innerHTML = '';
            shiftDetailContainer.innerHTML = '';
            selectedShiftDetail = '';
            studentDetailsContainer.innerHTML = '';
            vehicleDetailContainer.innerHTML = '';
            shiftInput.value = '';
            vehicleInput.value = '';
    
            // Fetch student count if both details are available
            if (selectedShiftDetail) {
                fetchStudentCount(selectedRouteDetail.routeDetail, selectedShiftDetail);
            }
        }
    });

    shiftSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedShift = event.target;
    
            // Populate the shift details
            const selectedShiftDetail = {
                shiftName: selectedShift.dataset.shiftName || "N/A",
                shiftDetail: selectedShift.dataset.shiftDetail || "N/A",
            };
    
            // Set input value
            shiftInput.value = selectedShiftDetail.shiftName;
    
            // Update the shift detail container
            shiftDetailContainer.innerHTML = `
                <strong>Shift Name:</strong> ${selectedShiftDetail.shiftName}<br>
                <strong>Classes Alloted:</strong> ${selectedShiftDetail.shiftDetail}
            `;
    
            // Show the shift detail container
            shiftDetailContainer.style.display = 'block';
    
            // Hide suggestions container and clear its contents
            shiftSuggestionsContainer.style.display = 'none';
            shiftSuggestionsContainer.innerHTML = ''; // Clear suggestions
    
            // Clear vehicle input and related container
            clearVehicleInputs();
    
            // Fetch student count if both details are available
            if (selectedRouteDetail) {
                fetchStudentCount(selectedRouteDetail, selectedShiftDetail.shiftDetail);
            }
        }
    });

    vehicleSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedDriver = event.target;
    
            // Populate vehicle details
            const selectedVehicleDetail = {
                driverName: selectedDriver.dataset.driverName || "N/A",
                vehicleNo: selectedDriver.dataset.vehicleNo || "N/A",
                vehicleCapacity: selectedDriver.dataset.vehicleCapacity || "N/A",
                availableSeats: parseInt(selectedDriver.dataset.availableSeats, 10) || 0,
                conductorName: selectedDriver.dataset.conductorName || "N/A"
            };
    
            // Set input value
            vehicleInput.value = selectedVehicleDetail.vehicleNo;
    
            // Update the vehicle detail container
            vehicleDetailContainer.innerHTML = `
                <strong>Driver Name:</strong> ${selectedVehicleDetail.driverName}<br>
                <strong>Vehicle No:</strong> ${selectedVehicleDetail.vehicleNo}<br>
                <strong>Vehicle Capacity:</strong> ${selectedVehicleDetail.vehicleCapacity}<br>
                <strong>Available Seats:</strong> ${selectedVehicleDetail.availableSeats}<br>
                <strong>Conductor Name:</strong> ${selectedVehicleDetail.conductorName}
            `;
    
            // Show the vehicle detail container
            vehicleDetailContainer.style.display = 'block';
    
            // Hide suggestions container and clear its contents
            vehicleSuggestionsContainer.style.display = 'none';
            vehicleSuggestionsContainer.innerHTML = ''; // Clear suggestions
            
            // Store available seats in a global variable
            selectedVehicleCapacity = selectedVehicleDetail.availableSeats;
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


        // Function to reset all inputs
        function resetInputs() {
            routeInput.value = '';
            routeSuggestionsContainer.innerHTML = '';
            routeDetailContainer.innerHTML = '';
    
            shiftInput.value = '';
            shiftSuggestionsContainer.innerHTML = '';
            shiftDetailContainer.innerHTML = '';
    
            vehicleInput.value = '';
            vehicleSuggestionsContainer.innerHTML = '';
            vehicleDetailContainer.innerHTML = '';
    
            studentDetailsContainer.innerHTML = '';
    
            selectedRouteDetail = '';
            selectedShiftDetail = '';
            studentCount = 0;
            selectedVehicleCapacity = 0;
        }

        


    // BUS TAGGING FUNCTIONALITY //

    allocateButton.addEventListener('click', function () {
        if (!selectedRouteDetail || !selectedShiftDetail || !vehicleInput.value) {
            alert('Please select all fields: route, shift, and vehicle.');
            return;
        }
    
        const requestData = {
            routeStops: selectedRouteDetail,
            shiftClasses: selectedShiftDetail,
            vehicleNo: vehicleInput.value,
            availableSeats: selectedVehicleCapacity,
            routeName: routeInput.value,
            shiftName: shiftInput.value,
        };
    
        if (studentCount === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Students Found',
                html: `
                All the students on <strong>${routeInput.value}</strong> route in <strong>${shiftInput.value}</strong> shift are allocated with a vehicle.
            `
            });
            return;
        }

        if (selectedVehicleCapacity === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Available Seats',
                html: `
                The selected vehicle <strong>${vehicleInput.value}</strong> has no available seats.
            `
            });
            return;
        }
    
    
        // Validate if the selected route, shift, and vehicle exist in one row
        fetch('/validate_tagged_routeShiftVehicle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => response.json())
            .then(result => {
                if (!result.success) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid Selection',
                        html: `
                        The selected <strong>Route</strong>, <strong>Shift</strong> and <strong>Vehicle</strong> combination does not exist.
                    `
                    });
                    return;
                }
    
                const driverName = result.driverName;  // Is only found when above validation succeeds //
    
                // Proceed with the existing logic if validation passes
    
                if (studentCount <= selectedVehicleCapacity) {
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
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Allocation Successful',
                                    html: `
                                        <strong>Vehicle:</strong> ${vehicleInput.value} [ ${driverName} ]<br>
                                        is successfully tagged to <strong>${studentCount}</strong> students.
                                    `,
                                }).then(() => {
                                    resetInputs(); // Clear all inputs when user clicks OK
                                });
                                fetchAndDisplayScheduleDetails();
                            } else {
                                alert('Error: Failed to allocate bus.');
                            }
                        })
                        .catch(error => console.error('Error:', error));
                }  else {
                    // Call the new endpoint to handle overflow
                    // Call the new endpoint to handle overflow
fetch('/handle_overflow_students', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
}) 
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const primaryBusCount = result.primaryBus.length;
            const secondaryBusDetails = result.secondaryResult ? result.secondaryResult.secondaryBusDetails : [];

            const primaryBusDetails = `${vehicleInput.value} (${driverName}) - ${primaryBusCount} students`;
            let alertHtml = `
            Due to insufficient availability of seats in <strong>${vehicleInput.value} (${driverName})</strong>, we allocated
            other vehicles running on same route to certain students<br><br>
                <strong>Total Students:</strong> ${studentCount}<br>
                ${primaryBusDetails}<br>
            `;

            secondaryBusDetails.forEach(bus => {
                if (bus.studentCount > 0) {
                    alertHtml += `${bus.vehicleNo} (${bus.driverName}) - ${bus.studentCount} students<br>`;
                }
            });

            if (result.secondaryResult && result.secondaryResult.notEnoughBuses) {
                alertHtml += `<br><strong>Warning:</strong> Not enough buses to allocate all students. ${result.secondaryResult.remainingStudents.length} students could not be allocated.`;
            }

            Swal.fire({
                icon: 'success',
                title: 'Allocation Successful',
                html: alertHtml,
            }).then(() => {
                resetInputs(); // Clear all inputs when user clicks OK
            });

            fetchAndDisplayScheduleDetails();
        } else {
            console.error('Error: Failed to fetch overflow students.');
        }
    })
    .catch(error => console.error('Error:', error));
                }
            })
            .catch(error => console.error('Error:', error));
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
                    <td><button class="detag-button" data-vehicle-no="${item.vehicle_no}" data-route-name="${item.route_name}" data-shift-name="${item.shift_name}" data-classes-alloted="${item.classes_alloted}">Unallocate</button></td>
                `;
                    scheduleTableBody.appendChild(newRow);
                });

                // Add event listeners to the Detag buttons
                document.querySelectorAll('.detag-button').forEach(button => {
                    button.addEventListener('click', function () {
                        const vehicleNo = this.dataset.vehicleNo;
                        const routeName = this.dataset.routeName;
                        const shiftName = this.dataset.shiftName;
                        const classesAlloted = this.dataset.classesAlloted;

                        // Call the detag endpoint
                        detagBus(vehicleNo, routeName, shiftName, classesAlloted);
                    });
                });
            })
            .catch(error => console.error('Error fetching schedule details:', error));
    }

// Function to detag/unallocate a vehicle 

function detagBus(vehicleNo, routeName, shiftName, classesAlloted) {
    // Show a confirmation dialog
    const userConfirmed = window.confirm('Do you really want to detag this bus? This process cannot be undone.');

    if (userConfirmed) {
        // Split the classesAlloted string into an array
        const classesArray = classesAlloted.split(',').map(cls => cls.trim());

        const requestData = { vehicleNo, routeName, shiftName, classesAlloted: classesArray };

        // Log the data being sent to the server
        //console.log('Data sent to server:', requestData);

        fetch('/allocate_detagBus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Unallocation Successful',
                    html: `<strong>Vehicle No:</strong> ${result.vehicle_no} [${result.driver_name}] <br> has been successfully unallocated for <strong>${result.students_detagged}</strong> students.`
                });
                // Refresh the schedule details table
                fetchAndDisplayScheduleDetails();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Detag Failed',
                    text: 'Error: Failed to detag bus.'
                });
            }
        })
        .catch(error => console.error('Error:', error));
    }
}
    // Initial data fetch for schedule details
    fetchAndDisplayScheduleDetails();
});