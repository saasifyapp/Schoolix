document.addEventListener('DOMContentLoaded', function () {
    const routeInput = document.getElementById('tag_tag_route_name');
    const routeSuggestionsContainer = document.getElementById('tag_routeSuggestions');
    const routeDetailContainer = document.getElementById('tag_routeDetail');

    const shiftInput = document.getElementById('tag_tag_shift_name');
    const shiftSuggestionsContainer = document.getElementById('tag_shiftSuggestions');
    const shiftDetailContainer = document.getElementById('tag_shiftDetail');

    const vehicleInput = document.getElementById('tag_tag_vehicle_no');
    const vehicleSuggestionsContainer = document.getElementById('tag_vehicleSuggestions');
    const vehicleDetailContainer = document.getElementById('tag_vehicleDetail');

    const getDetailsButton = document.getElementById('tag_getDetailsButton');
    const submittedDataBody = document.getElementById('submittedDataBody');

    let selectedRouteDetail = '';
    let selectedShiftDetail = '';
    let selectedVehicleDetail = {};

    // Function to display the data in the table
    function displayData(data) {
        submittedDataBody.innerHTML = ''; // Clear existing data

        data.forEach(item => {
            const newRow = `
            <tr data-id="${item.id}">
                <td>${item.vehicle_no}</td>
                <td>${item.driver_name}</td>
                <td>${item.conductor_name}</td>
                <td>${item.route_name}</td>
                <td>${item.route_stops}</td>
                <td>${item.shift_name}</td>
                <td>${item.classes_alloted}</td>
                <td>
                    <button class="delete_tag_record" data-id="${item.id}" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                        <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    </button>
                </td>
            </tr>
        `;
            submittedDataBody.innerHTML += newRow;
        });
    }

    // Function to fetch the data from the server and refresh the table
    function refreshTable() {
        fetch('/tag_display_route_shift_allocation_data')
            .then(response => response.json())
            .then(data => displayData(data)) // Call displayData to render the table
            .catch(error => console.error('Error fetching data:', error));
    }

    // Call the refreshTable function to load the initial data when the page loads
    refreshTable();


    // // Function to fetch and display the initial data for the table
    // function fetchAndDisplayData() {
    //     fetch('/tag_display_route_shift_allocation_data')
    //         .then(response => response.json())
    //         .then(data => {
    //             submittedDataBody.innerHTML = ''; // Clear existing data
    //             data.forEach(item => {
    //                 const newRow = `
    //                     <tr data-id="${item.id}">
    //                         <td>${item.vehicle_no}</td>
    //                         <td>${item.driver_name}</td>
    //                         <td>${item.conductor_name}</td>
    //                         <td>${item.route_name}</td>
    //                         <td>${item.route_stops}</td>
    //                         <td>${item.shift_name}</td>
    //                         <td>${item.classes_alloted}</td>
    //                         <td>
    //                             <button class="delete_tag_record" data-id="${item.id}" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
    //                                     onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
    //                                     onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    //                                 <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
    //                             </button>
    //                         </td>
    //                     </tr>
    //                 `;
    //                 submittedDataBody.innerHTML += newRow;
    //             });
    //         })
    //         .catch(error => console.error('Error fetching data:', error));
    // }

    // // Function to delete a record
    // function deleteRecord(id) {
    //     fetchAndDisplayData();
    //     // Show a confirmation dialog
    //     const userConfirmed = window.confirm('Do you really want to delete this record? This process cannot be undone.');

    //     if (userConfirmed) {
    //         // User confirmed deletion
    //         fetch(`/delete_transport_schedule/${id}`, {
    //             method: 'DELETE'
    //         })
    //         .then(response => response.json())
    //         .then(result => {
    //             if (result.success) {
    //                 Swal.fire({
    //                     icon: 'success',
    //                     title: 'Delete Successful',
    //                     html: `<strong>Vehicle No:</strong> ${result.vehicle_no} [${result.driver_name}] <br> has been successfully untagged from <br>
    //                     Route: <strong>${result.route_name}</strong> and Shift: <strong>${result.shift_name}</strong>.`
    //                 });
    //                 fetchAndDisplayData(); // Refresh the table data
    //             } else if (result.error) {
    //                 Swal.fire({
    //                     icon: 'error',
    //                     title: 'Delete Failed',
    //                     html: `Cannot delete this record.<br>
    //                            <strong>Vehicle No:</strong> ${result.vehicle_no} [${result.driver_name}] <br>  is allocated to <strong>${result.students_tagged}</strong> students.<br><br>
    //                            Please detag this vehicle from <br> <strong>Vehicle Allocation Console</strong>`
    //                 });
    //             }
    //         })
    //         .catch(error => console.error('Error:', error));
    //     }
    // }

    // // Event delegation for delete buttons
    // submittedDataBody.addEventListener('click', function (event) {
    //     const target = event.target.closest('button.delete_tag_record');
    //     if (target) {
    //         const id = target.dataset.id;
    //         deleteRecord(id);
    //     }
    // });

    // Function to delete a record
    function deleteRecord(id) {
        // Show a confirmation dialog
        const userConfirmed = window.confirm('Do you really want to delete this record? This process cannot be undone.');

        if (userConfirmed) {
            // User confirmed deletion
            fetch(`/delete_transport_schedule/${id}`, {
                method: 'DELETE'
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Delete Successful',
                            html: `<strong>Vehicle No:</strong> ${result.vehicle_no} [${result.driver_name}] <br> has been successfully untagged from <br>
                           Route: <strong>${result.route_name}</strong> and Shift: <strong>${result.shift_name}</strong>.`
                        });
                        refreshTable(); // Refresh the table after successful deletion
                    } else if (result.error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Delete Failed',
                            html: `Cannot delete this record.<br>
                           <strong>Vehicle No:</strong> ${result.vehicle_no} [${result.driver_name}] <br> is allocated to <strong>${result.students_tagged}</strong> students.<br><br>
                           Please detag this vehicle from <br> <strong>Vehicle Allocation Console</strong>.`
                        });
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    }

    // Event delegation for delete buttons
    submittedDataBody.addEventListener('click', function (event) {
        const target = event.target.closest('button.delete_tag_record');
        if (target) {
            const id = target.dataset.id;
            deleteRecord(id);
        }
    });


    routeInput.addEventListener('input', function () {
        const query = this.value;
        if (query.length >= 0) {
            fetch(`/tag_getRouteDetails`)
                .then(response => response.json())
                .then(data => {
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
            fetch(`/tag_getShiftDetails`)
                .then(response => response.json())
                .then(data => {
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
            fetch(`/tag_getVehicleDetails?q=${query}`)
                .then(response => response.json())
                .then(data => {
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
                            suggestionItem.textContent = `${driver.vehicle_no || 'N/A'} | ${driver.driver_name || 'N/A'}`;
                            suggestionItem.dataset.driverName = driver.driver_name || 'N/A';
                            suggestionItem.dataset.vehicleNo = driver.vehicle_no || 'N/A';
                            suggestionItem.dataset.conductorName = driver.conductor_name || 'N/A';
                            suggestionItem.dataset.vehicleCapacity = driver.vehicle_capacity || 'N/A';
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
                <strong>Details:</strong> ${selectedRoute.dataset.routeDetail}
            `;
            routeSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            routeSuggestionsContainer.innerHTML = '';
        }
    });

    shiftSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedShift = event.target;
            shiftInput.value = selectedShift.dataset.shiftName;
            selectedShiftDetail = selectedShift.dataset.shiftDetail;
            shiftDetailContainer.innerHTML = `
                <strong>Shift Name:</strong> ${selectedShift.dataset.shiftName}<br>
                <strong>Details:</strong> ${selectedShift.dataset.shiftDetail}
            `;
            shiftSuggestionsContainer.style.display = 'none'; // Hide suggestions container
            shiftSuggestionsContainer.innerHTML = '';
        }
    });

    vehicleSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedDriver = event.target;
            vehicleInput.value = selectedDriver.dataset.vehicleNo;
            selectedVehicleDetail = {
                driverName: selectedDriver.dataset.driverName || 'N/A',
                vehicleNo: selectedDriver.dataset.vehicleNo || 'N/A',
                conductorName: selectedDriver.dataset.conductorName || 'N/A',
                vehicleCapacity: selectedDriver.dataset.vehicleCapacity || 'N/A'
            };
            vehicleDetailContainer.innerHTML = `
                <strong>Driver Name:</strong> ${selectedDriver.dataset.driverName}<br>
                <strong>Vehicle No:</strong> ${selectedDriver.dataset.vehicleNo}<br>
                <strong>Conductor Name:</strong> ${selectedDriver.dataset.conductorName}<br>
                <strong>Vehicle Capacity:</strong> ${selectedDriver.dataset.vehicleCapacity}
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

    // getDetailsButton.addEventListener('click', function (event) {
    //     event.preventDefault();

    //     // Ensure all details are selected
    //     if (!selectedRouteDetail || !selectedShiftDetail || !selectedVehicleDetail.vehicleNo) {
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Missing Details',
    //             text: 'Please select all details before proceeding.'
    //         });
    //         return;
    //     }

    //     // Prepare data to be sent to the server
    //     const routeName = routeInput.value;
    //     const shiftName = shiftInput.value;
    //     const { driverName, vehicleNo, conductorName, vehicleCapacity } = selectedVehicleDetail;

    //     const data = {
    //         vehicle_no: vehicleNo,
    //         driver_name: driverName,
    //         conductor_name: conductorName,
    //         route_name: routeName,
    //         route_stops: selectedRouteDetail,
    //         shift_name: shiftName,
    //         classes_alloted: selectedShiftDetail,
    //         vehicle_capacity: vehicleCapacity
    //     };

    //     // Send data to the server
    //     fetch('/tag_populateTransportSchedule', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(data)
    //     })
    //         .then(response => response.json())
    //         .then(result => {
    //             if (result.success) {
    //                 Swal.fire({
    //                     icon: 'success',
    //                     title: 'Tag Successful',
    //                     html: `
    //                 <strong>Route:</strong> ${routeName}<br>
    //                 <strong>Shift:</strong> ${shiftName}<br>
    //                 <strong>Vehicle:</strong> ${vehicleNo} [${driverName}]
    //             `
    //                 });
    //                 // Add the submitted data to the table
    //                 const newRow = `
    //                 <tr data-id="${result.id}">
    //                     <td>${vehicleNo}</td>
    //                     <td>${driverName}</td>
    //                     <td>${conductorName}</td>
    //                     <td>${routeName}</td>
    //                     <td>${selectedRouteDetail}</td>
    //                     <td>${shiftName}</td>
    //                     <td>${selectedShiftDetail}</td>
    //                     <td>
    //                         <button class="delete_tag_record" data-id="${result.id}" style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
    //                             onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
    //                             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
    //                             <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
    //                         </button>
    //                     </td>
    //                 </tr>
    //             `;
    //                 submittedDataBody.innerHTML += newRow;
    //             } else {
    //                 alert('Failed to add transport schedule details.');
    //             }
    //         })
    //         .catch(error => console.error('Error:', error));
    // });

    // // Initial data fetch
    // fetchAndDisplayData();

    // Event listener for the submission button
    getDetailsButton.addEventListener('click', function (event) {
        event.preventDefault();

        // Ensure all details are selected
        if (!selectedRouteDetail || !selectedShiftDetail || !selectedVehicleDetail.vehicleNo) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Details',
                text: 'Please select all details before proceeding.'
            });
            return;
        }

        // Prepare data to be sent to the server
        const routeName = routeInput.value;
        const shiftName = shiftInput.value;
        const { driverName, vehicleNo, conductorName, vehicleCapacity } = selectedVehicleDetail;

        const data = {
            vehicle_no: vehicleNo,
            driver_name: driverName,
            conductor_name: conductorName,
            route_name: routeName,
            route_stops: selectedRouteDetail,
            shift_name: shiftName,
            classes_alloted: selectedShiftDetail,
            vehicle_capacity: vehicleCapacity
        };

        // Send data to the server
        fetch('/tag_populateTransportSchedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Tag Successful',
                        html: `
                    <strong>Route:</strong> ${routeName}<br>
                    <strong>Shift:</strong> ${shiftName}<br>
                    <strong>Vehicle:</strong> ${vehicleNo} [${driverName}]
                `
                    });
                    refreshTable(); // Refresh the table after a successful submission
                } else {
                    alert('Failed to add transport schedule details.');
                }
            })
            .catch(error => console.error('Error:', error));
    });


    // Function to display the info container with fade-up animation
    function displayInfoContainer(container, content) {
        container.innerHTML = content;
        container.style.display = 'block';
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';

        setTimeout(() => {
            container.style.animation = 'fadeUp 0.5s ease-in-out forwards';
        }, 10); // Small delay to trigger the CSS animation
    }

    // Event listener for selecting a route
    routeSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedRoute = event.target;
            routeInput.value = selectedRoute.dataset.routeName;

            displayInfoContainer(routeDetailContainer, `
                <strong>Route Name:</strong> ${selectedRoute.dataset.routeName}<br>
                <strong>Stops:</strong> ${selectedRoute.dataset.routeDetail}
            `);
        }
    });

    // Event listener for selecting a shift
    shiftSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedShift = event.target;
            shiftInput.value = selectedShift.dataset.shiftName;

            displayInfoContainer(shiftDetailContainer, `
                <strong>Shift Name:</strong> ${selectedShift.dataset.shiftName}<br>
                <strong>Classes Alloted:</strong> ${selectedShift.dataset.shiftDetail}
            `);
        }
    });

    // Event listener for selecting a vehicle
    vehicleSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedVehicle = event.target;
            vehicleInput.value = selectedVehicle.dataset.vehicleNo;

            displayInfoContainer(vehicleDetailContainer, `
                 <strong>Vehicle No:</strong> ${selectedVehicle.dataset.vehicleNo}<br>
            <strong>Driver Name:</strong> ${selectedVehicle.dataset.driverName}<br>
            <strong>Conductor Name:</strong> ${selectedVehicle.dataset.conductorName}<br>
            <strong>Vehicle Capacity:</strong> ${selectedVehicle.dataset.vehicleCapacity}
            `);
        }
    });
});