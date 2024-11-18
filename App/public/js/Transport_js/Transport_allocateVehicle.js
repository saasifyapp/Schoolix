
const routeInputallocate = document.getElementById('allocate_inputRoute');
const routeSuggestionsContainerallocate = document.getElementById('allocate_routeSuggestions');
const routeDetailContainerallocate = document.getElementById('allocate_routeDetail');

const shiftInputallocate = document.getElementById('allocate_inputShift');
const shiftSuggestionsContainerallocate = document.getElementById('allocate_shiftSuggestions');
const shiftDetailContainerallocate = document.getElementById('allocate_shiftDetail');

const vehicleInputallocate = document.getElementById('allocate_inputVehicle');
const vehicleSuggestionsContainerallocate = document.getElementById('allocate_vehicleSuggestions');
const vehicleDetailContainerallocate = document.getElementById('allocate_vehicleDetail');

const studentDetailsContainerallocate = document.getElementById('allocate_studentDetails');
const allocateButton = document.getElementById('allocate_getDetailsButton');
const scheduleTableBody = document.getElementById('allocate_scheduleTableBody');

let allocateselectedRouteDetail = '';
let allocateselectedShiftDetail = '';
let studentCount = 0;
let teacherCount = 0;
let selectedVehicleCapacity = 0;

function fetchRouteDetails(query = '') {
    fetch(`/allocate_getRouteDetails`)
        .then((response) => response.json())
        .then((data) => {
            routeSuggestionsContainerallocate.style.display = 'flex'; // Show suggestions container
            routeSuggestionsContainerallocate.innerHTML = '';

            const filteredData = query
                ? data.filter(route => route.route_shift_name.toLowerCase().includes(query.toLowerCase()))
                : data;

            if (filteredData.length === 0) {
                const noResultsItem = document.createElement('div');
                noResultsItem.classList.add('suggestion-item', 'no-results');
                noResultsItem.textContent = 'No results found';
                routeSuggestionsContainerallocate.appendChild(noResultsItem);
            } else {
                filteredData.forEach((route) => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = route.route_shift_name;
                    suggestionItem.dataset.routeName = route.route_shift_name;
                    suggestionItem.dataset.routeDetail = route.route_shift_detail;
                    routeSuggestionsContainerallocate.appendChild(suggestionItem);
                });
            }
        })
        .catch((error) => console.error('Error:', error));
}

routeInputallocate.addEventListener('focus', function () {
    fetchRouteDetails();
});

routeInputallocate.addEventListener('input', function () {
    fetchRouteDetails(this.value);
});

function fetchShiftDetails(routeName, query = '') {
    fetch(`/allocate_getShiftDetails?routeName=${encodeURIComponent(routeName)}`)
        .then((response) => response.json())
        .then((data) => {
            shiftSuggestionsContainerallocate.style.display = 'flex'; // Show suggestions container
            shiftSuggestionsContainerallocate.innerHTML = '';



            const filteredData = query
                ? data.filter(shift => shift.route_shift_name.toLowerCase().includes(query.toLowerCase()))
                : data;

            if (filteredData.length === 0) {
                const noResultsItem = document.createElement('div');
                noResultsItem.classList.add('suggestion-item', 'no-results');
                noResultsItem.textContent = 'No results found';
                shiftSuggestionsContainerallocate.appendChild(noResultsItem);
            } else {
                filteredData.forEach((shift) => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = shift.route_shift_name;
                    suggestionItem.dataset.shiftName = shift.route_shift_name;
                    suggestionItem.dataset.shiftDetail = shift.route_shift_detail;
                    shiftSuggestionsContainerallocate.appendChild(suggestionItem);
                });
            }
        })
        .catch((error) => console.error('Error:', error));
}

shiftInputallocate.addEventListener('focus', function () {
    if (routeInputallocate.value) {
        fetchShiftDetails(routeInputallocate.value);
    }
});

shiftInputallocate.addEventListener('input', function () {
    if (routeInputallocate.value) {
        fetchShiftDetails(routeInputallocate.value, this.value);
    }
});

function fetchVehicleDetails(routeName, shiftName, query = '') {
    fetch(`/allocate_getVehicleDetails?q=${encodeURIComponent(query)}&routeName=${encodeURIComponent(routeName)}&shiftName=${encodeURIComponent(shiftName)}`)
        .then((response) => response.json())
        .then((data) => {
            vehicleSuggestionsContainerallocate.style.display = 'flex'; // Show suggestions container
            vehicleSuggestionsContainerallocate.innerHTML = '';

            if (data.length === 0) {
                const noResultsItem = document.createElement('div');
                noResultsItem.classList.add('suggestion-item', 'no-results');
                noResultsItem.textContent = 'No results found';
                vehicleSuggestionsContainerallocate.appendChild(noResultsItem);
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
                    vehicleSuggestionsContainerallocate.appendChild(suggestionItem);
                });
            }
        })
        .catch((error) => console.error('Error:', error));
}

vehicleInputallocate.addEventListener('focus', function () {
    if (routeInputallocate.value && shiftInputallocate.value) {
        fetchVehicleDetails(routeInputallocate.value, shiftInputallocate.value);
    }
});

vehicleInputallocate.addEventListener('input', function () {
    if (routeInputallocate.value && shiftInputallocate.value) {
        fetchVehicleDetails(routeInputallocate.value, shiftInputallocate.value, this.value);
    }
});

routeSuggestionsContainerallocate.addEventListener('click', function (event) {
    if (event.target.classList.contains('suggestion-item')) {
        const selectedRoute = event.target;
        routeInputallocate.value = selectedRoute.dataset.routeName;

        // Populate the route details
        allocateselectedRouteDetail = {
            routeName: selectedRoute.dataset.routeName || "N/A",
            routeDetail: selectedRoute.dataset.routeDetail || "N/A",
        };

        routeDetailContainerallocate.innerHTML = `
                <strong>Route Name:</strong> ${allocateselectedRouteDetail.routeName}<br>
                <strong>Stops:</strong> ${allocateselectedRouteDetail.routeDetail}
            `;

        // Show the route detail container
        routeDetailContainerallocate.style.display = 'block';

        // Hide suggestions container
        routeSuggestionsContainerallocate.style.display = 'none';
        routeSuggestionsContainerallocate.innerHTML = ''; // Clear suggestions

        // Clear shift input and suggestions when a new route is selected
        shiftSuggestionsContainerallocate.innerHTML = '';
        shiftDetailContainerallocate.innerHTML = '';
        allocateselectedShiftDetail = '';
        studentDetailsContainerallocate.innerHTML = '';
        vehicleDetailContainerallocate.innerHTML = '';
        shiftInputallocate.value = '';
        vehicleInputallocate.value = '';

        //Container display none
        shiftDetailContainerallocate.style.display = "none";
        studentDetailsContainerallocate.style.display = "none";
        vehicleDetailContainerallocate.style.display = "none";

        // Fetch student count if both details are available
        if (allocateselectedShiftDetail) {
            fetchStudentCount(allocateselectedRouteDetail.routeDetail, allocateselectedShiftDetail.shiftDetail);
        }
    }
});

shiftSuggestionsContainerallocate.addEventListener('click', function (event) {
    if (event.target.classList.contains('suggestion-item')) {
        const selectedShift = event.target;

        // Populate the shift details
        allocateselectedShiftDetail = {
            shiftName: selectedShift.dataset.shiftName || "N/A",
            shiftDetail: selectedShift.dataset.shiftDetail || "N/A",
        };

        // Set input value
        shiftInputallocate.value = allocateselectedShiftDetail.shiftName;

        // Update the shift detail container
        shiftDetailContainerallocate.innerHTML = `
                <strong>Shift Name:</strong> ${allocateselectedShiftDetail.shiftName}<br>
                <strong>Classes Alloted:</strong> ${allocateselectedShiftDetail.shiftDetail}
            `;

        // Show the shift detail container
        shiftDetailContainerallocate.style.display = 'block';

        // Hide suggestions container and clear its contents
        shiftSuggestionsContainerallocate.style.display = 'none';
        shiftSuggestionsContainerallocate.innerHTML = ''; // Clear suggestions

        // Clear vehicle input and related container
        // clearvehicleInputallocates();
        vehicleInputallocate.value = '';

        //container display none
        studentDetailsContainerallocate.style.display = "none";
        vehicleDetailContainerallocate.style.display = "none";

        studentDetailsContainerallocate.innerHTML = '';
        vehicleDetailContainerallocate.innerHTML = '';

        // Fetch student count if both details are available
        if (allocateselectedRouteDetail) {
            fetchStudentCount(allocateselectedRouteDetail.routeDetail, allocateselectedShiftDetail.shiftDetail);
        }


    }
});

vehicleSuggestionsContainerallocate.addEventListener('click', function (event) {
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
        vehicleInputallocate.value = selectedVehicleDetail.vehicleNo;

        // Update the vehicle detail container
        vehicleDetailContainerallocate.innerHTML = `
                <strong>Driver Name:</strong> ${selectedVehicleDetail.driverName}<br>
                <strong>Vehicle No:</strong> ${selectedVehicleDetail.vehicleNo}<br>
                <strong>Vehicle Capacity:</strong> ${selectedVehicleDetail.vehicleCapacity}<br>
                <strong>Available Seats:</strong> ${selectedVehicleDetail.availableSeats}<br>
                <strong>Conductor Name:</strong> ${selectedVehicleDetail.conductorName}
            `;

        // Show the vehicle detail container
        vehicleDetailContainerallocate.style.display = 'block';

        // Hide suggestions container and clear its contents
        vehicleSuggestionsContainerallocate.style.display = 'none';
        vehicleSuggestionsContainerallocate.innerHTML = ''; // Clear suggestions

        // Store available seats in a global variable
        selectedVehicleCapacity = selectedVehicleDetail.availableSeats;
    }
});

document.addEventListener('click', function (event) {
    if (!routeSuggestionsContainerallocate.contains(event.target) && !routeInputallocate.contains(event.target)) {
        routeSuggestionsContainerallocate.style.display = 'none'; // Hide suggestions container
        routeSuggestionsContainerallocate.innerHTML = '';
    }
    if (!shiftSuggestionsContainerallocate.contains(event.target) && !shiftInputallocate.contains(event.target)) {
        shiftSuggestionsContainerallocate.style.display = 'none'; // Hide suggestions container
        shiftSuggestionsContainerallocate.innerHTML = '';
    }
    if (!vehicleSuggestionsContainerallocate.contains(event.target) && !vehicleInputallocate.contains(event.target)) {
        vehicleSuggestionsContainerallocate.style.display = 'none'; // Hide suggestions container
        vehicleSuggestionsContainerallocate.innerHTML = '';
    }
});

function fetchStudentCount(routeStops, shiftClasses) {
    fetch(`/allocate_getStudentCount?routeStops=${encodeURIComponent(routeStops)}&shiftClasses=${encodeURIComponent(shiftClasses)}`)
        .then(response => response.json())
        .then(data => {
            studentDetailsContainerallocate.style.display = 'flex';
            studentCount = data.studentCount;
            teacherCount = data.teacherCount;
            studentDetailsContainerallocate.innerHTML = `
                    <strong>Student Count: </strong> ${studentCount} <br>
                    <strong>Teacher Count: </strong> ${teacherCount}
                `;
        })
        .catch(error => console.error('Error fetching counts:', error));
}


// Function to reset all inputs
function resetInputs() {
    routeInputallocate.value = '';
    routeSuggestionsContainerallocate.innerHTML = '';
    routeDetailContainerallocate.innerHTML = '';

    shiftInputallocate.value = '';
    shiftSuggestionsContainerallocate.innerHTML = '';
    shiftDetailContainerallocate.innerHTML = '';

    vehicleInputallocate.value = '';
    vehicleSuggestionsContainerallocate.innerHTML = '';
    vehicleDetailContainerallocate.innerHTML = '';

    studentDetailsContainerallocate.innerHTML = '';

    routeDetailContainerallocate.style.display = 'none';
    vehicleDetailContainerallocate.style.display = 'none';
    shiftDetailContainerallocate.style.display = 'none';
    studentDetailsContainerallocate.style.display = 'none';
    allocateselectedRouteDetail = '';
    allocateselectedShiftDetail = '';
    // studentCount = 0;
    selectedVehicleCapacity = 0;
}




// BUS TAGGING FUNCTIONALITY //
allocateButton.addEventListener('click', function () {
    showTransportLoadingAnimation();
    if (!routeInputallocate.value || !shiftInputallocate.value || !vehicleInputallocate.value) {
        hideTransportLoadingAnimation();
        Swal.fire({
            icon: "error",
            title: "Missing Details",
            text: "Please select all details before proceeding.",
        });
        return;
    }

    const requestData = {
        routeStops: allocateselectedRouteDetail,
        shiftClasses: allocateselectedShiftDetail,
        vehicleNo: vehicleInputallocate.value,
        availableSeats: selectedVehicleCapacity,
        routeName: routeInputallocate.value,
        shiftName: shiftInputallocate.value,
    };

    if (studentCount === 0 && teacherCount === 0) {
        hideTransportLoadingAnimation();
        Swal.fire({
            icon: 'info',
            title: 'No Students or Teachers Found',
            html: `
                    All the students and teachers on <strong>${routeInputallocate.value}</strong> route in <strong>${shiftInputallocate.value}</strong> shift are allocated with a vehicle.
                `
        });
        return;
    }

    if (selectedVehicleCapacity === 0) {
        hideTransportLoadingAnimation();
        Swal.fire({
            icon: 'warning',
            title: 'No Available Seats',
            html: `
                    The selected vehicle <strong>${vehicleInputallocate.value}</strong> has no available seats.
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
                hideTransportLoadingAnimation();
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

            // DEBUG: Log the counts and capacity
            console.log('studentCount:', studentCount);
            console.log('teacherCount:', teacherCount);
            console.log('selectedVehicleCapacity:', selectedVehicleCapacity);

            if (studentCount + teacherCount <= selectedVehicleCapacity) {
                // Call the new endpoint to tag the bus to all the listed students and teachers
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
                            // hideTransportLoadingAnimation();
                            const allocatedStudents = result.allocatedStudents.length;
                            const allocatedTeachers = result.allocatedTeachers.length;
                            Swal.fire({
                                icon: 'success',
                                title: 'Allocation Successful',
                                html: `
                                <strong>Vehicle:</strong> ${vehicleInputallocate.value} [ ${driverName} ]<br>
                                is successfully tagged to <strong>${allocatedStudents}</strong> students and <strong>${allocatedTeachers}</strong> teachers.
                            `,
                            }).then(() => {
                                resetInputs(); // Clear all inputs when user clicks OK
                            });
                            fetchAndDisplayScheduleDetails();
                        } else {
                            hideTransportLoadingAnimation();
                            alert('Error: Failed to allocate bus.');
                        }
                    })
                    .catch(error => console.error('Error:', error));
            } else {
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
                            hideTransportLoadingAnimation();
                            let alertHtml = `
                            Due to insufficient availability of seats in <strong>${vehicleInputallocate.value} (${driverName})</strong>, we allocated other vehicles running on the same route to certain students and teachers.<br><br>
                            <strong>Total Students:</strong> ${studentCount}<br>
                            <strong>Total Teachers:</strong> ${teacherCount}<br><br>
                        `;

                            const primaryBusDetails = `${vehicleInputallocate.value} (${driverName}) - ${result.primaryBus.allocatedStudents.length} students and ${result.primaryBus.allocatedTeachers.length} teachers`;
                            alertHtml += `${primaryBusDetails}<br>`;

                            if (result.secondaryBusDetails && result.secondaryBusDetails.length > 0) {
                                result.secondaryBusDetails.forEach(bus => {
                                    hideTransportLoadingAnimation();
                                    alertHtml += `${bus.vehicleNo} (${bus.driverName}) - ${bus.studentCount} students and ${bus.teacherCount} teachers<br>`;
                                });
                            }

                            if (result.secondaryResult && result.secondaryResult.notEnoughBuses) {
                                hideTransportLoadingAnimation();
                                alertHtml += `<br><strong>Warning:</strong> Not enough buses to allocate all students. ${result.secondaryResult.remainingStudents ? result.secondaryResult.remainingStudents.length : 0} students could not be allocated.`;
                            }
                            hideTransportLoadingAnimation();
                            Swal.fire({
                                icon: 'success',
                                title: 'Allocation Successful',
                                html: alertHtml,
                            }).then(() => {
                                resetInputs(); // Clear all inputs when user clicks OK
                            });

                            fetchAndDisplayScheduleDetails();
                        } else {
                            hideTransportLoadingAnimation();
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
    showTransportLoadingAnimation();
    fetch('/allocate_getScheduleDetails')
        .then(response => response.json())
        .then(data => {
            scheduleTableBody.innerHTML = ''; // Clear existing data

                // Check if data array is empty
                if (data.length === 0) {
                    const noDataRow = document.createElement('tr');
                    noDataRow.innerHTML = `
                        <td colspan="9" style="text-align: center; font-size: 16px; color: gray;">No results found</td>
                    `;
                    scheduleTableBody.appendChild(noDataRow);
                    hideTransportLoadingAnimation();
                    return; // Exit function since there's no data to display
                }
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
                    <td><button class="detag-button" 
        data-vehicle-no="${item.vehicle_no}" 
        data-route-name="${item.route_name}" 
        data-shift-name="${item.shift_name}" 
        data-classes-alloted="${item.classes_alloted}" 
        style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    <img src="../images/cancel.png" alt="Unallocate" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
    <span style="margin-left: 5px;">Unallocate</span>
</button>
</td>
                `;
                scheduleTableBody.appendChild(newRow);
                hideTransportLoadingAnimation();
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
        showTransportLoadingAnimation();
        // Split the classesAlloted string into an array
        const classesArray = classesAlloted.split(',').map(cls => cls.trim());

        const requestData = { vehicleNo, routeName, shiftName, classesAlloted: classesArray };

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
                    // hideTransportLoadingAnimation();
                    Swal.fire({
                        icon: 'success',
                        title: 'Unallocation Successful',
                        html: `
                            <strong>Vehicle No:</strong> ${result.vehicle_no} [${result.driver_name}] <br>
                            has been successfully unallocated for 
                            <strong>${result.detagged_students}</strong> students and 
                            <strong>${result.detagged_teachers}</strong> teachers.
                        `
                    });
                    // Refresh the schedule details table
                    fetchAndDisplayScheduleDetails();
                } else {
                    hideTransportLoadingAnimation();
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
// fetchAndDisplayScheduleDetails();