
let routeData = {}; // Object to store route data by route_shift_id

function refreshRoutesData() {
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
        .catch((error) => console.error("Error refreshing routes:", error));
}

function displayRoutes(data) {
    const routesTableBody = document.getElementById("routesTableBody");
    routesTableBody.innerHTML = ""; // Clear existing table rows

    if (data.length === 0) {
        const noResultsRow = document.createElement("tr");
        noResultsRow.innerHTML = '<td colspan="3">No results found</td>';
        routesTableBody.appendChild(noResultsRow);
    } else {
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
                            onclick="deleteRoute('${item.route_shift_id}')"
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
    const query = this.value.toLowerCase();

    // Filter routes based on the search query
    const filteredRoutes = Object.values(routeData).filter(route => {
        return route.route_shift_name.toLowerCase().includes(query) ||
               route.route_shift_detail.toLowerCase().includes(query);
    });

    // Display the filtered routes
    displayRoutes(filteredRoutes);
});


function deleteRoute(route_shift_id) {
    if (confirm("Are you sure you want to delete this route?")) {
        fetch(`/deleteRoute/${route_shift_id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.success) {
                    // // Remove the deleted route from the local data
                    // delete routeData[route_shift_id];

                    // // Refresh the displayed routes
                    // displayRoutes(Object.values(routeData));
                    alert("Entry Deleted Successfully.")
                    refreshRoutesData();
                } else {
                    console.error("Failed to delete route");
                }
            })
            .catch((error) => console.error("Error deleting route:", error));
    }
}


const manageRoutesForm = document.getElementById("manageRoutesForm");
const routesTableBody = document.getElementById("routesTableBody");
const citiesAddressInput = document.getElementById("citiesAddress");
const citiesAddressContainer = document.getElementById("citiesAddressContainer");
const suggestionsContainer = document.getElementById("address_suggestionBox");
let selectedCities = [];

// Form submission handler
manageRoutesForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = {
        routeName: document.getElementById("routeName").value,
        citiesAddress: selectedCities.join(", ") // Join selected cities into a single string
    };

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
                alert(data.error);
            } else {
                alert(data.message);
                resetForm();
                displayRoutes(); // Refresh the table after adding a new route
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while submitting the form");
        });
});

// Function to reset the form
function resetForm() {
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
//                                 onclick="deleteRoute('${item.route_shift_id}')"
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
            suggestionsContainer.innerHTML = ""; // Clear existing suggestions

            const filteredData = data.filter(item => item.transport_pickup_drop.toLowerCase().startsWith(query.toLowerCase()));

            if (filteredData.length === 0) {
                suggestionsContainer.style.display = "none"; // Hide suggestions container
            } else {
                filteredData.forEach((item) => {
                    const suggestionItem = document.createElement("div");
                    suggestionItem.classList.add("suggestion-item");
                    suggestionItem.textContent = item.transport_pickup_drop;
                    suggestionItem.addEventListener("click", function () {
                        addCityToSelected(item.transport_pickup_drop);
                    });
                    suggestionsContainer.appendChild(suggestionItem);
                });
                suggestionsContainer.style.display = "flex"; // Show suggestions container
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
    suggestionsContainer.style.display = "none"; // Hide suggestions container
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
        if (child !== citiesAddressInput && child !== suggestionsContainer) {
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
        suggestionsContainer.style.display = "none"; // Hide suggestions container
    }
});


// Initial fetch and display of route details
// displayRoutes();



