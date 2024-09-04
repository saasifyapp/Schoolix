
document.addEventListener('DOMContentLoaded', function () {
    // Input Elements
    const vehicleInput = document.getElementById('listStudents_vehicleNo');
    const vehicleSuggestionsContainer = document.getElementById('listStudents_vehicleSuggestions');
    const vehicleDetailContainer = document.getElementById('listStudents_vehicleDetail');

    const shiftInput = document.getElementById('listStudents_shiftType');
    const shiftSuggestionsContainer = document.getElementById('listStudents_shiftSuggestions');
    const shiftDetailContainer = document.getElementById('listStudents_shiftDetail');

    const stopInput = document.getElementById('listStudents_stops');
    const stopSuggestionsContainer = document.getElementById('listStudents_stopSuggestions');

    const classInput = document.getElementById('listStudents_classes');
    const classSuggestionsContainer = document.getElementById('listStudents_classSuggestions');

    let selectedVehicleNo = '';
    let selectedShiftName = '';

    // Function to update the read-only attribute of stop and class inputs
    function updateInputReadOnlyStatus() {
        if (selectedVehicleNo && selectedShiftName) {
            stopInput.readOnly = false;
            classInput.readOnly = false;
        } else {
            stopInput.readOnly = true;
            classInput.readOnly = true;
        }
    }

    // Fetch vehicle suggestions
    vehicleInput.addEventListener('input', function () {
        const query = this.value;
        if (query.length > 0) {
            fetch(`/listStudents_getVehicleDetails?q=${encodeURIComponent(query)}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log('Vehicle Data:', data); // Log the response data
                    vehicleSuggestionsContainer.style.display = 'flex'; // Show suggestions container
                    vehicleSuggestionsContainer.innerHTML = '';

                    if (!Array.isArray(data) || data.length === 0) {
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
                            suggestionItem.dataset.availableSeats = driver.available_seats || 0; // Fallback to 0 if null or 0
                            suggestionItem.dataset.studentsTagged = driver.students_tagged || 'N/A';
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

    // Handle vehicle suggestion click
    vehicleSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedDriver = event.target;
            vehicleInput.value = selectedDriver.dataset.vehicleNo;
            selectedVehicleNo = selectedDriver.dataset.vehicleNo;
            vehicleDetailContainer.innerHTML = `
                <strong>Vehicle No:</strong> ${selectedDriver.dataset.vehicleNo}<br>
                <strong>Driver Name:</strong> ${selectedDriver.dataset.driverName}<br>
                <strong>Available Seats:</strong> ${selectedDriver.dataset.availableSeats}<br>
                <strong>Students Allocated:</strong> ${selectedDriver.dataset.studentsTagged}<br>
            `;
            vehicleSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            vehicleSuggestionsContainer.innerHTML = '';
            updateInputReadOnlyStatus(); // Update read-only status
        }
    });

    // Fetch shift suggestions when shift input is focused
    shiftInput.addEventListener('focus', function () {
        if (selectedVehicleNo) {
            fetch(`/listStudents_shiftDetails?vehicleNo=${encodeURIComponent(selectedVehicleNo)}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log('Shift Data:', data); // Log the response data
                    shiftSuggestionsContainer.style.display = 'flex'; // Show suggestions container
                    shiftSuggestionsContainer.innerHTML = '';

                    if (!Array.isArray(data) || data.length === 0) {
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        shiftSuggestionsContainer.appendChild(noResultsItem);
                    } else {
                        data.forEach((shift) => {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.classList.add('suggestion-item');
                            suggestionItem.textContent = shift.shift_name;
                            suggestionItem.dataset.shiftName = shift.shift_name;
                            suggestionItem.dataset.classesAlloted = shift.classes_alloted;
                            shiftSuggestionsContainer.appendChild(suggestionItem);
                        });
                    }
                })
                .catch((error) => console.error('Error:', error));
        }
    });

    // Handle shift suggestion click
    shiftSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedShift = event.target;
            shiftInput.value = selectedShift.dataset.shiftName;
            selectedShiftName = selectedShift.dataset.shiftName;
            shiftDetailContainer.innerHTML = `
                <strong>Shift Name:</strong> ${selectedShift.dataset.shiftName}<br>
                <strong>Classes Alloted:</strong> ${selectedShift.dataset.classesAlloted}
            `;
            shiftSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            shiftSuggestionsContainer.innerHTML = '';
            updateInputReadOnlyStatus(); // Update read-only status
        }
    });

    // Fetch stop suggestions when stop input is focused
    stopInput.addEventListener('focus', function () {
        if (selectedVehicleNo && selectedShiftName) {
            fetch(`/listStudents_getStops?vehicleNo=${encodeURIComponent(selectedVehicleNo)}&shiftName=${encodeURIComponent(selectedShiftName)}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log('Stop Data:', data); // Log the response data
                    stopSuggestionsContainer.style.display = 'flex'; // Show suggestions container
                    stopSuggestionsContainer.innerHTML = '';

                    if (!data.route_stops) {
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        stopSuggestionsContainer.appendChild(noResultsItem);
                    } else {
                        const stopsArray = data.route_stops.split(', ');
                        stopsArray.forEach((stop) => {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.classList.add('suggestion-item');
                            suggestionItem.textContent = stop;
                            suggestionItem.dataset.routeStop = stop;
                            stopSuggestionsContainer.appendChild(suggestionItem);
                        });
                    }
                })
                .catch((error) => console.error('Error:', error));
        }
    });

    // Handle stop suggestion click
    stopSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedStop = event.target;
            stopInput.value = selectedStop.dataset.routeStop;
            stopInput.dispatchEvent(new Event('input')); // Trigger input event to disable class input
            stopSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            stopSuggestionsContainer.innerHTML = '';
        }
    });

    // Fetch class suggestions when class input is focused
    classInput.addEventListener('focus', function () {
        if (selectedVehicleNo && selectedShiftName) {
            fetch(`/listStudents_getClass?vehicleNo=${encodeURIComponent(selectedVehicleNo)}&shiftName=${encodeURIComponent(selectedShiftName)}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log('Class Data:', data); // Log the response data
                    classSuggestionsContainer.style.display = 'flex'; // Show suggestions container
                    classSuggestionsContainer.innerHTML = '';

                    if (!data.classes_alloted) {
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        classSuggestionsContainer.appendChild(noResultsItem);
                    } else {
                        const classesArray = data.classes_alloted.split(', ');
                        const groupedClasses = {};

                        classesArray.forEach((cls) => {
                            const [standard, division] = cls.split(' ');
                            if (!groupedClasses[standard]) {
                                groupedClasses[standard] = [];
                            }
                            groupedClasses[standard].push(division);
                        });

                        for (const [standard, divisions] of Object.entries(groupedClasses)) {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.classList.add('suggestion-item');
                            suggestionItem.textContent = `${standard} (${divisions.join(', ')})`;
                            suggestionItem.dataset.class = `${standard} (${divisions.join(', ')})`;
                            classSuggestionsContainer.appendChild(suggestionItem);
                        }
                    }
                })
                .catch((error) => console.error('Error:', error));
        }
    });

    // Handle class suggestion click
    classSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedClass = event.target;
            classInput.value = selectedClass.dataset.class;
            classInput.dispatchEvent(new Event('input')); // Trigger input event to disable stop input
            classSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            classSuggestionsContainer.innerHTML = '';
        }
    });

    // Disable class input if stops input has a value and vice versa
    stopInput.addEventListener('input', function () {
        if (stopInput.value.trim() !== '') {
            classInput.disabled = true;
        } else {
            classInput.disabled = false;
        }
    });

    classInput.addEventListener('input', function () {
        if (classInput.value.trim() !== '') {
            stopInput.disabled = true;
        } else {
            stopInput.disabled = false;
        }
    });

    // Initial call to set read-only status
    updateInputReadOnlyStatus();

    // Hide suggestions when clicking outside
    document.addEventListener('click', function (event) {
        if (!vehicleSuggestionsContainer.contains(event.target) && !vehicleInput.contains(event.target)) {
            vehicleSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            vehicleSuggestionsContainer.innerHTML = '';
        }
        if (!shiftSuggestionsContainer.contains(event.target) && !shiftInput.contains(event.target)) {
            shiftSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            shiftSuggestionsContainer.innerHTML = '';
        }
        if (!stopSuggestionsContainer.contains(event.target) && !stopInput.contains(event.target)) {
            stopSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            stopSuggestionsContainer.innerHTML = '';
        }
        if (!classSuggestionsContainer.contains(event.target) && !classInput.contains(event.target)) {
            classSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            classSuggestionsContainer.innerHTML = '';
        }
    });
});