document.addEventListener('DOMContentLoaded', function () {
    // Input Elements
    const vehicleInput = document.getElementById('listStudents_vehicleNo');
    const vehicleSuggestionsContainer = document.getElementById('listStudents_vehicleSuggestions');

    const shiftInput = document.getElementById('listStudents_shiftType');
    const shiftSuggestionsContainer = document.getElementById('listStudents_shiftSuggestions');

    const stopInput = document.getElementById('listStudents_stops');
    const stopSuggestionsContainer = document.getElementById('listStudents_stopSuggestions');

    const classInput = document.getElementById('listStudents_classes');
    const classSuggestionsContainer = document.getElementById('listStudents_classSuggestions');

    const scheduleTableBody = document.getElementById('listStudents_scheduleTableBody');
    const studentCountElement = document.getElementById('studentCount');
    const teacherCountElement = document.getElementById('teacherCount'); // New element for teacher count
    const vehicleInfoContainer = document.getElementById('listStudents_vehicleInfo');

    let selectedVehicleNo = '';
    let selectedShiftName = '';
    let studentData = [];

    // Function to update the disabled attribute of stop and class inputs
    function updateInputDisabledStatus() {
        if (selectedVehicleNo && selectedShiftName) {
            stopInput.disabled = false;
            classInput.disabled = false;
            fetchAndDisplayStudentDetails(); // Fetch and display student details
            fetchVehicleInfo(); // Fetch and display vehicle info
        } else {
            stopInput.disabled = true;
            classInput.disabled = true;
            vehicleInfoContainer.style = 'block'; // Clear vehicle info container
        }
    }

    // Function to fetch vehicle suggestions
    function fetchVehicleSuggestions(query) {
        fetch(`/listStudents_getVehicleDetails?q=${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((data) => {
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
                        vehicleSuggestionsContainer.appendChild(suggestionItem);
                    });
                }
            })
            .catch((error) => console.error('Error:', error));
    }

    // Show vehicle suggestions when input is focused
    vehicleInput.addEventListener('focus', function () {
        fetchVehicleSuggestions(this.value);
    });

    // Update vehicle suggestions when user types
    vehicleInput.addEventListener('input', function () {
        fetchVehicleSuggestions(this.value);

        // Clear shift, stop, and class inputs, and reset the table and other related elements
        shiftInput.value = '';
        stopInput.value = '';
        classInput.value = '';
        selectedShiftName = '';
        stopInput.disabled = true;
        classInput.disabled = true;
        vehicleInfoContainer.innerHTML = '';
        scheduleTableBody.innerHTML = '';
        studentCountElement.textContent = '0';
        teacherCountElement.textContent = '0';
    });

    // Handle vehicle suggestion click
    vehicleSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedDriver = event.target;
            vehicleInput.value = selectedDriver.dataset.vehicleNo;
            selectedVehicleNo = selectedDriver.dataset.vehicleNo;
            vehicleSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            vehicleSuggestionsContainer.innerHTML = '';
            updateInputDisabledStatus(); // Update disabled status
        }
    });

    // Fetch shift suggestions when shift input is focused
    shiftInput.addEventListener('focus', function () {
        if (selectedVehicleNo) {
            fetchShiftSuggestions(selectedVehicleNo);
        }
    });

    // Update shift suggestions when user types
    shiftInput.addEventListener('input', function () {
        if (selectedVehicleNo) {
            fetchShiftSuggestions(selectedVehicleNo);

            // Clear stop and class inputs
            stopInput.value = '';
            classInput.value = '';
            stopInput.disabled = true;
            classInput.disabled = true;
            scheduleTableBody.innerHTML = '';
            studentCountElement.textContent = '0';
            teacherCountElement.textContent = '0';
        }
    });

    // Function to fetch shift suggestions
    function fetchShiftSuggestions(vehicleNo) {
        fetch(`/listStudents_shiftDetails?vehicleNo=${encodeURIComponent(vehicleNo)}`)
            .then((response) => response.json())
            .then((data) => {
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

    // Handle shift suggestion click
    shiftSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedShift = event.target;
            shiftInput.value = selectedShift.dataset.shiftName;
            selectedShiftName = selectedShift.dataset.shiftName;
            shiftSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            shiftSuggestionsContainer.innerHTML = '';
            updateInputDisabledStatus(); // Update disabled status
        }
    });

    // Function to fetch vehicle info
   // Function to fetch vehicle info
function fetchVehicleInfo() {
    const vehicleInfoContainer = document.getElementById('listStudents_vehicleInfo'); // Ensure this is defined
    
    // Check if both vehicle number and shift name are selected
    if (selectedVehicleNo && selectedShiftName) {
        fetch(`/listStudents_getVehicleInfo?vehicleNo=${encodeURIComponent(selectedVehicleNo)}&shiftName=${encodeURIComponent(selectedShiftName)}`)
            .then((response) => response.json())
            .then((data) => {
                // Clear any previous data
                vehicleInfoContainer.innerHTML = '';

                if (data.length > 0) {
                    const vehicleInfo = data[0];
                    vehicleInfoContainer.innerHTML = `
                        <strong>Vehicle No:</strong> ${vehicleInfo.vehicle_no}<br>
                        <strong>Driver Name:</strong> ${vehicleInfo.driver_name}<br>
                        <strong>Total Capacity:</strong> ${vehicleInfo.vehicle_capacity}<br>
                        <strong>Available Seats:</strong> ${vehicleInfo.available_seats}<br>
                    `;
                    vehicleInfoContainer.style.display = 'block'; // Show the container with data
                    vehicleInfoContainer.style.maxHeight = '100px';
                    vehicleInfoContainer.style.width = '90%';
                } else {
                    vehicleInfoContainer.innerHTML = 'No vehicle info found';
                    vehicleInfoContainer.style.display = 'block'; // Show the container even if no data is found
                    vehicleInfoContainer.style.maxHeight = '65px';
                    vehicleInfoContainer.style.width = '90%';
                }
            })
            .catch((error) => console.error('Error:', error));
    } else {
        // Hide container if either vehicle number or shift name is missing
        vehicleInfoContainer.style.display = 'none';
    }
}


    // Fetch stop suggestions when stop input is focused
    stopInput.addEventListener('focus', function () {
        if (selectedVehicleNo && selectedShiftName) {
            fetchStopSuggestions(selectedVehicleNo, selectedShiftName);
        }
    });

    // Update stop suggestions when user types
    stopInput.addEventListener('input', function () {
        if (selectedVehicleNo && selectedShiftName) {
            fetchStopSuggestions(selectedVehicleNo, selectedShiftName);
        }
    });

    // Function to fetch stop suggestions
    function fetchStopSuggestions(vehicleNo, shiftName) {
        fetch(`/listStudents_getStops?vehicleNo=${encodeURIComponent(vehicleNo)}&shiftName=${encodeURIComponent(shiftName)}`)
            .then((response) => response.json())
            .then((data) => {
                stopSuggestionsContainer.style.display = 'block'; // Show suggestions container
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

    // Handle stop suggestion click
    stopSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedStop = event.target;
            stopInput.value = selectedStop.dataset.routeStop;
            stopInput.dispatchEvent(new Event('input')); // Trigger input event to disable class input
            stopSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            stopSuggestionsContainer.innerHTML = '';
            filterAndDisplayStudentDetails(); // Filter and display student details
        }
    });

    // Fetch class suggestions when class input is focused
    classInput.addEventListener('focus', function () {
        if (selectedVehicleNo && selectedShiftName) {
            fetchClassSuggestions(selectedVehicleNo, selectedShiftName);
        }
    });

    // Update class suggestions when user types
    classInput.addEventListener('input', function () {
        if (selectedVehicleNo && selectedShiftName) {
            fetchClassSuggestions(selectedVehicleNo, selectedShiftName);
        }
    });

    // Function to fetch class suggestions
    function fetchClassSuggestions(vehicleNo, shiftName) {
        fetch(`/listStudents_getClass?vehicleNo=${encodeURIComponent(vehicleNo)}&shiftName=${encodeURIComponent(shiftName)}`)
            .then((response) => response.json())
            .then((data) => {
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

    // Handle class suggestion click
    classSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedClass = event.target;
            classInput.value = selectedClass.dataset.class;
            classInput.dispatchEvent(new Event('input')); // Trigger input event to disable stop input
            classSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            classSuggestionsContainer.innerHTML = '';
            filterAndDisplayStudentDetails(); // Filter and display student details
        }
    });

    // Disable class input if stops input has a value and vice versa
    stopInput.addEventListener('input', function () {
        if (stopInput.value.trim() !== '') {
            classInput.disabled = true;
        } else {
            classInput.disabled = false;
        }
        filterAndDisplayStudentDetails(); // Filter and display student details
    });

    classInput.addEventListener('input', function () {
        if (classInput.value.trim() !== '') {
            stopInput.disabled = true;
        } else {
            stopInput.disabled = false;
        }
        filterAndDisplayStudentDetails(); // Filter and display student details
    });

    // Function to fetch and display student details
    function fetchAndDisplayStudentDetails() {
        if (selectedVehicleNo && selectedShiftName) {
            fetch(`/fetch_getStudentsList?vehicleNo=${encodeURIComponent(selectedVehicleNo)}&shiftName=${encodeURIComponent(selectedShiftName)}`)
                .then((response) => response.json())
                .then((result) => {
                    studentData = result.data; // Store the fetched data
                    displayStudentDetails(result.data); // Display the fetched data
                    updateCounts(result.studentCount, result.teacherCount); // Update counts
                })
                .catch((error) => console.error('Error:', error));
        }
    }

    // Function to filter and display student details based on route or class
    function filterAndDisplayStudentDetails() {
        let filteredData = studentData;

        const selectedRoute = stopInput.value.trim();
        const selectedClass = classInput.value.trim();

        if (selectedRoute !== '') {
            filteredData = filteredData.filter(student => student.transport_pickup_drop === selectedRoute);
        }

        if (selectedClass !== '') {
            const [standard, divisions] = selectedClass.split(' (');
            const divisionArray = divisions.replace(')', '').split(', ');
            filteredData = filteredData.filter(student => student.standard === standard && divisionArray.includes(student.division));
        }

        displayStudentDetails(filteredData);

        // Update counts based on filtered data
        const studentCount = filteredData.filter(result => result.standard !== 'Teacher').length;
        const teacherCount = filteredData.filter(result => result.standard === 'Teacher').length;
        updateCounts(studentCount, teacherCount);
    }

    // Function to display student details in the table
    function displayStudentDetails(data) {
        scheduleTableBody.innerHTML = ''; // Clear existing table data

        if (Array.isArray(data) && data.length > 0) {
            data.forEach((student) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.standard}</td>
                    <td>${student.division}</td>
                    <td>${student.f_mobile_no}</td>
                    <td>${student.transport_pickup_drop}</td>
                `;
                scheduleTableBody.appendChild(row);
            });
        } else {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = '<td colspan="5">No students found</td>';
            scheduleTableBody.appendChild(noResultsRow);
        }
    }

    // Function to update the student and teacher counts
    function updateCounts(studentCount, teacherCount) {
        studentCountElement.textContent = studentCount; // Update student count
        teacherCountElement.textContent = teacherCount; // Update teacher count
    }

    // Initial call to set disabled status
    updateInputDisabledStatus();

    // Function to export table to CSV
    function export_getStudentListTable() {
        const reportTable = document.getElementById('listStudents_scheduleTable');
        const reportTableBody = document.getElementById('listStudents_scheduleTableBody');

        if (!reportTable || !reportTableBody) {
            alert('Table or Table Body not found.');
            return;
        }

        if (reportTableBody.rows.length === 0) {
            alert('No data to export.');
            return;
        }

        let csvContent = '';
        const headers = Array.from(reportTable.querySelectorAll('thead th')).map(th => th.textContent.trim());
        csvContent += headers.join(',') + '\n';

        const rows = Array.from(reportTableBody.querySelectorAll('tr'));
        rows.forEach(row => {
            const cols = Array.from(row.querySelectorAll('td')).map(col => col.textContent.trim());
            csvContent += cols.join(',') + '\n';
        });

        let fileName = 'Students_List.csv';
        const vehicleNo = document.getElementById('listStudents_vehicleNo').value.trim();
        const shift = document.getElementById('listStudents_shiftType').value.trim();
        const route = document.getElementById('listStudents_stops').value.trim();
        const classFilter = document.getElementById('listStudents_classes').value.trim();

        if (vehicleNo && shift) {
            fileName = `${vehicleNo}_${shift}`;
            if (route) {
                fileName += `_Route_${route}`;
            } else if (classFilter) {
                fileName += `_Class_${classFilter}`;
            }
            fileName += '.csv';
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Add event listener for the export button
    document.getElementById('exportStudentListButton').addEventListener('click', export_getStudentListTable);

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