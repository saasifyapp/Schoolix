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

    const scheduleTableBody = document.getElementById('listStudents_scheduleTableBody');
    const studentCountElement = document.getElementById('studentCount');

    let selectedVehicleNo = '';
    let selectedShiftName = '';
    let studentData = [];

    // Function to update the read-only attribute of stop and class inputs
    function updateInputReadOnlyStatus() {
        if (selectedVehicleNo && selectedShiftName) {
            stopInput.readOnly = false;
            classInput.readOnly = false;
            fetchAndDisplayStudentDetails(); // Fetch and display student details
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
            filterAndDisplayStudentDetails(); // Filter and display student details
        }
    });

    // Fetch class suggestions when class input is focused
    classInput.addEventListener('focus', function () {
        if (selectedVehicleNo && selectedShiftName) {
            fetch(`/listStudents_getClass?vehicleNo=${encodeURIComponent(selectedVehicleNo)}&shiftName=${encodeURIComponent(selectedShiftName)}`)
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
    });

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
                .then((data) => {
                    studentData = data; // Store the fetched data
                    displayStudentDetails(data); // Display the fetched data
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
            studentCountElement.textContent = data.length; // Update student count
        } else {
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = '<td colspan="5">No students found</td>';
            scheduleTableBody.appendChild(noResultsRow);
            studentCountElement.textContent = 0; // Update student count
        }
    }

    // Initial call to set read-only status
    updateInputReadOnlyStatus();


// Function to export table to CSV
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