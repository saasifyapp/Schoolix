
let routeData = {}; // Object to store route data by route_shift_id

function refreshRoutesData() {
    showTransportLoadingAnimation();
    document.getElementById('searchRoute').value = "";
    return fetch("/displayRoutes")
        .then((response) => response.json())
        .then((data) => {
            // Store the fetched data in the routeData object
            routeData = {};
            data.forEach((item) => {
                routeData[item.route_shift_id] = item;
            });

            // After refreshing data, display it
            displayRoutes(data);
        })
        .catch((error) => {
            hideTransportLoadingAnimation();
            console.error("Error refreshing routes:", error) 
        });
}

function displayRoutes(data) {
    hideTransportLoadingAnimation();
    const routesTableBody = document.getElementById("routesTableBody");
    routesTableBody.innerHTML = ""; // Clear existing table rows

    if (data.length === 0) {
        hideTransportLoadingAnimation();
        const noResultsRow = document.createElement("tr");
        noResultsRow.innerHTML = '<td colspan="3">No results found</td>';
        routesTableBody.appendChild(noResultsRow);
    } else {
        hideTransportLoadingAnimation();
        // Reverse the data array to display latest entries first
        data.reverse();

        // Dynamically create table rows
        data.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.route_shift_name || ""}</td>
                <td>${item.route_shift_detail || ""}</td>
                <td>
                    <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                        <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                            onclick="editRoute('${item.route_shift_id}')"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Edit</span>
                        </button>
                        <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                            onclick="deleteRoute('${item.route_shift_id}', '${item.route_shift_name}')"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Delete</span>
                        </button>
                    </div>
                </td>
            `;
            routesTableBody.appendChild(row);
        });
    }
}

document.getElementById('searchRoute').addEventListener('input', function () {
    showTransportLoadingAnimation();
    const query = this.value.toLowerCase();

    // Filter routes based on the search query
    const filteredRoutes = Object.values(routeData).filter(route => {
        return route.route_shift_name.toLowerCase().includes(query) ||
            route.route_shift_detail.toLowerCase().includes(query);
    });

    // Display the filtered routes
    displayRoutes(filteredRoutes);
});


function deleteRoute(routeId, routeName) {
    // Confirm before deletion using SweetAlert
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to delete this route?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            showTransportLoadingAnimation();

            // Send DELETE request to the server
            fetch(`/deleteRoute/${routeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ routeName: routeName })
            })
                .then(response => {
                    hideTransportLoadingAnimation();
                    return response.json().then(data => {
                        if (response.ok) {
                            // Successfully deleted, now refresh the route data
                            Swal.fire(
                                'Deleted!',
                                'Route deleted successfully!',
                                'success'
                            );
                            refreshRoutesData(); // Refresh the routes list after deletion
                        } else {
                            // Show error message if route is tagged
                            Swal.fire(
                                'Error!',
                                data.message,
                                'error'
                            );
                        }
                    });
                })
                .catch(error => {
                    hideTransportLoadingAnimation();
                    Swal.fire(
                        'Error!',
                        'Error deleting route: ' + error.message,
                        'error'
                    );
                });
        }
    });
}


const manageRoutesForm = document.getElementById("manageRoutesForm");
const routesTableBody = document.getElementById("routesTableBody");
const citiesAddressInput = document.getElementById("citiesAddress");
const citiesAddressContainer = document.getElementById("citiesAddressContainer");
const addresssuggestionsContainer = document.getElementById("address_suggestionBox");
let selectedCities = [];

// Form submission handler
manageRoutesForm.addEventListener("submit", function (e) {
    showTransportLoadingAnimation();
    e.preventDefault();

    const formData = {
        routeName: document.getElementById("routeName").value,
        citiesAddress: selectedCities.join(", ") // Join selected cities into a single string
    };

    // Validate route details before sending data to the server
    fetch('/route_validateDetails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ routeName: formData.routeName })
    })
        .then(response => response.json())
        .then(result => {
            if (!result.isValid) {
                hideTransportLoadingAnimation();
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    html: result.message
                });
                return;
            }

            // Send data to the server
            fetch("/addRoute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        hideTransportLoadingAnimation();
                        showToast(data.error);
                    } else {
                        hideTransportLoadingAnimation();
                        showToast(data.message);
                        reseteditForm();
                        refreshRoutesData(); // Refresh the table after adding a new route
                    }
                })
                .catch((error) => {
                    hideTransportLoadingAnimation();
                    console.error("Error:", error);
                    showToast("An error occurred while submitting the form");
                });
        })
        .catch(error => {
            hideTransportLoadingAnimation();
            console.error('Error:', error)});
});

// Function to reset the form
function reseteditForm() {
    manageRoutesForm.reset(); // Reset the form fields
    selectedCities = []; // Clear selected cities
    renderSelectedCities(); // Update the input field and tags
}

// // Function to fetch and display route details
// function displayRoutes() {
//     fetch("/displayRoutes")
//     .then((response) => response.json())
//     .then((data) => {
//         routesTableBody.innerHTML = ""; // Clear existing table rows

//         if (data.length === 0) {
//             const noResultsRow = document.createElement("tr");
//             noResultsRow.innerHTML = '<td colspan="3">No results found</td>';
//             routesTableBody.appendChild(noResultsRow);
//         } else {
//             // Reverse the data array
//             data.reverse();

//             // Dynamically create table rows
//             data.forEach((item) => {
//                 const row = document.createElement("tr");
//                 row.innerHTML = `
//                     <td>${item.route_shift_name || ""}</td>
//                     <td>${item.route_shift_detail || ""}</td>
//                     <td>
//                         <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
//                             <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
//                                 onclick="editRoute('${item.route_shift_id}')"
//                                 onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
//                                 onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
//                                 <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
//                                 <span style="margin-right: 10px;">Edit</span>
//                             </button>
//                             <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
//                                 onclick="deleteRoute('${item.route_shift_id}', '${item.route_shift_name}')"
//                                 onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
//                                 onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
//                                 <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
//                                 <span style="margin-right: 10px;">Delete</span>
//                             </button>
//                         </div>
//                     </td>
//                 `;
//                 routesTableBody.appendChild(row);
//             });
//         }
//     })
//     .catch((error) => console.error("Error:", error));
// }

// Function to fetch distinct addresses and display suggestions
function fetchAndDisplaySuggestions(query) {
    fetch("/distinctAddresses")
        .then((response) => response.json())
        .then((data) => {
            addresssuggestionsContainer.innerHTML = ""; // Clear existing suggestions

            const filteredData = data.filter(item => item.transport_pickup_drop.toLowerCase().startsWith(query.toLowerCase()));

            if (filteredData.length === 0) {
                addresssuggestionsContainer.style.display = "none"; // Hide suggestions container
            } else {
                filteredData.forEach((item) => {
                    const suggestionItem = document.createElement("div");
                    suggestionItem.classList.add("suggestion-item");
                    suggestionItem.textContent = item.transport_pickup_drop;
                    suggestionItem.addEventListener("click", function () {
                        addCityToSelected(item.transport_pickup_drop);
                    });
                    addresssuggestionsContainer.appendChild(suggestionItem);
                });
                addresssuggestionsContainer.style.display = "flex"; // Show suggestions container
            }
        })
        .catch((error) => console.error("Error:", error));


}

// Function to add a city to the selected cities
function addCityToSelected(city) {
    if (!selectedCities.includes(city)) {
        selectedCities.push(city);
        renderSelectedCities();
    }
    addresssuggestionsContainer.style.display = "none"; // Hide suggestions container
}

// Function to remove a city from the selected cities
function removeCityFromSelected(city) {
    selectedCities = selectedCities.filter(c => c !== city);
    renderSelectedCities();
}

// Function to render selected cities
function renderSelectedCities() {
    // Remove all tags except the input field
    Array.from(citiesAddressContainer.childNodes).forEach(child => {
        if (child !== citiesAddressInput && child !== addresssuggestionsContainer) {
            citiesAddressContainer.removeChild(child);
        }
    });

    selectedCities.forEach(city => {
        const cityElem = document.createElement("div");
        cityElem.classList.add("tag");
        cityElem.textContent = city;

        const removeButton = document.createElement("span");
        removeButton.classList.add("remove-tag");
        removeButton.textContent = "×";
        removeButton.addEventListener("click", () => removeCityFromSelected(city));

        cityElem.appendChild(removeButton);
        citiesAddressContainer.insertBefore(cityElem, citiesAddressInput);
    });

    citiesAddressInput.value = "";
}

// Event listener for the citiesAddress input field
citiesAddressInput.addEventListener("input", function () {
    const query = this.value;
    if (query.length >= 1) {
        fetchAndDisplaySuggestions(query);
    } else {
        addresssuggestionsContainer.style.display = "none"; // Hide suggestions container
    }
});





// // function to edit route
// let editedSelectedCities = []; // Stores cities selected during editing

// // Function to fetch distinct addresses and display suggestions (for the edit route popup)
// function fetchAndDisplayCitySuggestionsForEdit(query) {
//     fetch("/distinctAddresses")
//         .then((response) => response.json())
//         .then((data) => {
//             const suggestionsContainer = document.getElementById("editsuggestionsContainer");
//             // suggestionsContainer.innerHTML = ""; 

//             const filteredData = data.filter(item =>
//                 item.transport_pickup_drop.toLowerCase().startsWith(query.toLowerCase())
//             );

//             if (filteredData.length === 0) {
//                 suggestionsContainer.style.display = "none"; // Hide suggestions container if no match
//             } else {
//                 filteredData.forEach((item) => {
//                     const suggestionItem = document.createElement("div");
//                     suggestionItem.classList.add("suggestion-item");
//                     suggestionItem.textContent = item.transport_pickup_drop;

//                     // Add click event for selecting a suggestion
//                     suggestionItem.addEventListener("click", function () {
//                         addCityToEditedSelected(item.transport_pickup_drop);
//                     });

//                     suggestionsContainer.appendChild(suggestionItem);
//                 });
//                 suggestionsContainer.style.display = "flex"; // Show suggestions
//             }
//         })
//         .catch((error) => console.error("Error fetching suggestions:", error));
// }

// // Function to add a city to the edited selected cities list
// function addCityToEditedSelected(city) {
//     if (!editedSelectedCities.includes(city)) {
//         editedSelectedCities.push(city);
//         renderEditedSelectedCities();
//     }
//     document.getElementById("cityInput").value = ""; // Clear input after selection
//     document.getElementById("suggestionsContainer").style.display = "none"; // Hide suggestions
// }

// // Function to render the selected cities as tags in the cities container (for edit popup)
// function renderEditedSelectedCities() {
//     const citiesContainer = document.getElementById("citiesContainer");

//     // Remove all previous city tags (except the input field)
//     Array.from(citiesContainer.childNodes).forEach(child => {
//         if (child !== document.getElementById("cityInput")) {
//             citiesContainer.removeChild(child);
//         }
//     });

//     // Add each selected city as a tag with a remove button
//     editedSelectedCities.forEach(city => {
//         const cityElem = document.createElement("div");
//         cityElem.classList.add("tag");
//         cityElem.textContent = city;

//         const removeButton = document.createElement("span");
//         removeButton.classList.add("remove-tag");
//         removeButton.textContent = "×";
//         removeButton.addEventListener("click", () => removeCityFromEditedSelected(city));

//         cityElem.appendChild(removeButton);
//         citiesContainer.insertBefore(cityElem, document.getElementById("cityInput")); // Insert before input
//     });
// }

// // Function to remove a city from the edited selected list
// function removeCityFromEditedSelected(city) {
//     editedSelectedCities = editedSelectedCities.filter(c => c !== city);
//     renderEditedSelectedCities(); // Re-render after removing
// }

// // Event listener for the city input field to trigger suggestions (for edit popup)
// document.getElementById("cityInput").addEventListener("input", function () {
//     const query = this.value;
//     if (query.length >= 1) {
//         fetchAndDisplayCitySuggestionsForEdit(query); // Using the renamed function
//     } else {
//         document.getElementById("suggestionsContainer").style.display = "none"; // Hide suggestions if input is cleared
//     }
// });

// // Function to save route details (you'll need to send edited selected cities as a comma-separated string)
// function saveRouteDetails() {
//     const routeName = document.getElementById("editRouteName").value;
//     const routeCities = editedSelectedCities.join(", "); // Convert array to comma-separated string

//     // Call the API to save route details (implement the backend for this)
//     fetch('/updateRoute', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             routeShiftId: selectedRouteId, // Assume you store this somewhere on edit
//             routeName: routeName,
//             routeCities: routeCities,
//             routeType: 'route' // Example type
//         })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.message === 'Route updated successfully') {
//             showToast('Route updated successfully!');
//             closeEditRoutePopup(); // Close popup on success
//             refreshRoutesData(); // Refresh the routes data to reflect changes
//         }
//     })
//     .catch(error => console.error('Error updating route:', error));
// }

// // Function to open the edit route popup
// function editRoute(routeShiftId) {
//     const route = routeData[routeShiftId];
//     document.getElementById("editRouteName").value = route.route_shift_name;

//     // Populate edited selected cities from the route details (comma-separated)
//     editedSelectedCities = route.route_shift_detail.split(", ").map(city => city.trim());
//     renderEditedSelectedCities();

//     // Show popup and blur background
//     document.getElementById("editRoutePopup").style.display = "block";
//     document.getElementById("popupBg").style.display = "block";

//     // Store the current routeShiftId for saving later
//     selectedRouteId = routeShiftId;
// }

// // Function to close the edit route popup
// function closeEditRoutePopup() {
//     document.getElementById("editRoutePopup").style.display = "none";
//     document.getElementById("popupBg").style.display = "none";
// }



let editedSelectedCities = []; // Stores cities selected during editing
let selectedRouteId = null;
const suggestionsContainer = document.getElementById("suggestionsContainer");
// Function to fetch distinct addresses and display suggestions (for the edit route popup)
function fetchAndDisplayCitySuggestionsForEdit(query) {
    fetch("/distinctAddresses")
        .then((response) => response.json())
        .then((data) => {
            
            suggestionsContainer.innerHTML = ""; // Clear existing suggestions

            const filteredData = data.filter(item =>
                item.transport_pickup_drop.toLowerCase().startsWith(query.toLowerCase()) &&
                !editedSelectedCities.includes(item.transport_pickup_drop)
            );

            if (filteredData.length === 0) {
                suggestionsContainer.style.display = "none"; // Hide suggestions container if no match
            } else {
                filteredData.forEach((item) => {
                    const suggestionItem = document.createElement("div");
                    suggestionItem.classList.add("suggestion-item");
                    suggestionItem.textContent = item.transport_pickup_drop;

                    // Add click event for selecting a suggestion
                    suggestionItem.addEventListener("click", function () {
                        addCityToEditedSelected(item.transport_pickup_drop);
                    });

                    suggestionsContainer.appendChild(suggestionItem);
                });
                suggestionsContainer.style.display = "flex"; // Show suggestions
            }
        })
        .catch((error) => console.error("Error fetching suggestions:", error));
}

// Function to add a city to the edited selected cities list
function addCityToEditedSelected(city) {
    // if (editedSelectedCities.includes(city)) {
    //     // Show toast if the city is already added
    //     showToast("City/Village is already added.", true);
    //     return;
    // }

    if (!editedSelectedCities.includes(city)) {
        editedSelectedCities.push(city);
        renderEditedSelectedCities();
    }
    document.getElementById("cityInput").value = ""; // Clear input after selection
    document.getElementById("suggestionsContainer").style.display = "none"; // Hide suggestions
}

// Function to render the selected cities as tags in the cities container (for edit popup)
function renderEditedSelectedCities() {
    const citiesContainer = document.getElementById("citiesContainer");

    // Remove all previous city tags (except the input field)
    Array.from(citiesContainer.childNodes).forEach(child => {
        if (child !== document.getElementById("cityInput")) {
            citiesContainer.removeChild(child);
        }
    });

    // Add each selected city as a tag with a remove button
    editedSelectedCities.forEach(city => {
        const cityElem = document.createElement("div");
        cityElem.classList.add("tag");
        cityElem.textContent = city;

        const removeButton = document.createElement("span");
        removeButton.classList.add("remove-tag");
        removeButton.textContent = "×";
        removeButton.addEventListener("click", () => removeCityFromEditedSelected(city));

        cityElem.appendChild(removeButton);
        citiesContainer.insertBefore(cityElem, document.getElementById("cityInput")); // Insert before input
    });
}

// Function to remove a city from the edited selected list
function removeCityFromEditedSelected(city) {
    editedSelectedCities = editedSelectedCities.filter(c => c !== city);
    renderEditedSelectedCities(); // Re-render after removing
}

// Event listener for the city input field to trigger suggestions (for edit popup)
document.getElementById("cityInput").addEventListener("input", function () {
    const query = this.value;
    if (query.length >= 1) {
        fetchAndDisplayCitySuggestionsForEdit(query); // Using the renamed function
    } else {
        document.getElementById("suggestionsContainer").style.display = "none"; // Hide suggestions if input is cleared
    }
});

// Function to save route details (you'll need to send edited selected cities as a comma-separated string)
function saveRouteDetails() {
    showTransportLoadingAnimation();
    const routeName = document.getElementById("editRouteName").value;
    const routeCities = editedSelectedCities.join(", "); // Convert array to comma-separated string

    // Validate route details before sending data to the server
    fetch('/route_validateDetails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ routeId: selectedRouteId, routeName: routeName })
    })
        .then(response => response.json())
        .then(result => {
            if (!result.isValid) {
                hideTransportLoadingAnimation();
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    html: result.message
                });
                return;
            }

            // Call the API to save route details (implement the backend for this)
            fetch('/updateRoute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    routeShiftId: selectedRouteId, // Assume you store this somewhere on edit
                    routeName: routeName,
                    routeCities: routeCities,
                    routeType: 'route' // Example type
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Route updated successfully') {
                        hideTransportLoadingAnimation();
                        showToast('Route updated successfully!');
                        closeEditRoutePopup(); // Close popup on success
                        refreshRoutesData(); // Refresh the routes data to reflect changes
                    } else {
                        hideTransportLoadingAnimation();
                        showToast('Error updating route: ' + data.message);
                    }
                })
                .catch(error => {
                    hideTransportLoadingAnimation();
                    console.error('Error updating route:', error);
                    showToast('An error occurred while updating the route.');
                });
        })
        .catch(error => {
            hideTransportLoadingAnimation();
            console.error('Error:', error)});

}

// Function to open the edit route popup
function editRoute(routeShiftId) {
    showTransportLoadingAnimation();
    const route = routeData[routeShiftId];
    document.getElementById("editRouteName").value = route.route_shift_name;
    hideTransportLoadingAnimation();    
    // Populate edited selected cities from the route details (comma-separated)
    editedSelectedCities = route.route_shift_detail.split(", ").map(city => city.trim());
    renderEditedSelectedCities();

    // Show popup and blur background
    document.getElementById("editRoutePopup").style.display = "flex";
    document.getElementById("editpopupBg").style.display = "flex";

    // Store the current routeShiftId for saving later
    selectedRouteId = routeShiftId;
}

// Function to close the edit route popup
function closeEditRoutePopup() {
    document.getElementById("editRoutePopup").style.display = "none";
    document.getElementById("editpopupBg").style.display = "none";
    suggestionsContainer.style.display = "none";
}