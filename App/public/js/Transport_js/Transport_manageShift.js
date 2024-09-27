let shiftsData = {}; // Local object to store shift details

// Function to fetch shift data and store it in the local object
function refreshShiftsData() {
    document.getElementById('searchShift').value = "";
    fetch("/displayShifts")
        .then((response) => response.json())
        .then((data) => {
            // Store the fetched data in the local object
            shiftsData = {};
            data.forEach((item) => {
                shiftsData[item.route_shift_id] = item;
            });

            // Call displayShifts with the fetched data
            displayShifts(data);
        })
        .catch((error) => console.error("Error fetching shifts:", error));
}

// Function to display shifts
function displayShifts(data) {
    shiftsTableBody.innerHTML = ""; // Clear existing table rows

    if (data.length === 0) {
        const noResultsRow = document.createElement("tr");
        noResultsRow.innerHTML = '<td colspan="4">No results found</td>';
        shiftsTableBody.appendChild(noResultsRow);
    } else {
        // Reverse the data array
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
                            onclick="editShift('${item.route_shift_id}')"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Edit</span>
                        </button>
                        <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                            onclick="deleteShift('${item.route_shift_id}')"
                            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                            <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                            <span style="margin-right: 10px;">Delete</span>
                        </button>
                    </div>
                </td>
            `;
            shiftsTableBody.appendChild(row);
        });
    }
}


const manageShiftsForm = document.getElementById("manageShiftsForm");
const shiftsTableBody = document.getElementById("shiftsTableBody");
const shiftTypeInput = document.getElementById("shiftType");
const shiftTypeContainer = shiftTypeInput.parentNode;
const classsuggestionsContainer = document.getElementById("shiftTypeSuggestionBox");
let selectedStandardsDivisions = [];

// Form submission handler
manageShiftsForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = {
        shiftName: document.getElementById("shiftName").value,
        shiftType: selectedStandardsDivisions.join(", ") // Join selected items into a single string
    };

    // Validate shift details before sending data to the server
    fetch('/shift_validateDetails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shiftName: formData.shiftName })
    })
    .then(response => response.json())
    .then(result => {
        if (!result.isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                html: result.message
            });
            return;
        }

        // Send data to the server
        fetch("/addShift", {
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
                resetshiftForm();
                refreshShiftsData(); // Refresh the table after adding a new shift
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while submitting the form");
        });
    })
    .catch(error => console.error('Error:', error));
}); 

// Function to reset the form
function resetshiftForm() {
    manageShiftsForm.reset(); // Reset the form fields
    selectedStandardsDivisions = []; // Clear selected items
    renderSelectedStandardsDivisions(); // Update the input field and tags
}


// Function to fetch distinct standards with divisions and display suggestions
function fetchAndDisplayshiftSuggestions(query) {
    fetch("/distinctStandardsDivisions")
        .then((response) => response.json())
        .then((data) => {
            classsuggestionsContainer.innerHTML = ""; // Clear existing suggestions

            const filteredData = data.filter(item => item.standard_with_division.toLowerCase().includes(query.toLowerCase()));

            if (filteredData.length === 0) {
                classsuggestionsContainer.style.display = "none"; // Hide suggestions container
            } else {
                filteredData.forEach((item) => {
                    const suggestionItem = document.createElement("div");
                    suggestionItem.classList.add("suggestion-item");
                    suggestionItem.textContent = item.standard_with_division;
                    suggestionItem.addEventListener("click", function () {
                        addStandardDivisionToSelected(item.standard_with_division);
                    });
                    classsuggestionsContainer.appendChild(suggestionItem);
                });
                classsuggestionsContainer.style.display = "flex"; // Show suggestions container
            }
        })
        .catch((error) => console.error("Error:", error));
}

// Function to add a standard with division to the selected list
function addStandardDivisionToSelected(standardDivision) {
    if (!selectedStandardsDivisions.includes(standardDivision)) {
        selectedStandardsDivisions.push(standardDivision);
        renderSelectedStandardsDivisions();
    }
    classsuggestionsContainer.style.display = "none"; // Hide suggestions container
}

// Function to remove a standard with division from the selected list
function removeStandardDivisionFromSelected(standardDivision) {
    selectedStandardsDivisions = selectedStandardsDivisions.filter(sd => sd !== standardDivision);
    renderSelectedStandardsDivisions();
}

// Function to render selected standards with divisions
function renderSelectedStandardsDivisions() {
    // Remove all tags except the input field
    Array.from(shiftTypeContainer.childNodes).forEach(child => {
        if (child !== shiftTypeInput && child !== classsuggestionsContainer) {
            shiftTypeContainer.removeChild(child);
        }
    });

    selectedStandardsDivisions.forEach(standardDivision => {
        const divisionElem = document.createElement("div");
        divisionElem.classList.add("tag");
        divisionElem.textContent = standardDivision;

        const removeButton = document.createElement("span");
        removeButton.classList.add("remove-tag");
        removeButton.textContent = "×";
        removeButton.addEventListener("click", () => removeStandardDivisionFromSelected(standardDivision));

        divisionElem.appendChild(removeButton);
        shiftTypeContainer.insertBefore(divisionElem, shiftTypeInput);
    });

    shiftTypeInput.value = "";
}

// Event listener for the standardsDivisions input field
shiftTypeInput.addEventListener("input", function () {
    const query = this.value;
    if (query.length >= 1) {
        fetchAndDisplayshiftSuggestions(query);
    } else {
        classsuggestionsContainer.style.display = "none"; // Hide suggestions container
    }
});

document.getElementById('searchShift').addEventListener('input', function () {
    const query = this.value.toLowerCase();

    // Filter routes based on the search query
    const filteredRoutes = Object.values(shiftsData).filter(route => {
        return route.route_shift_name.toLowerCase().includes(query) ||
               route.route_shift_detail.toLowerCase().includes(query);
    });

    // Display the filtered routes
    displayShifts(filteredRoutes);
});

function deleteShift(shiftId) {
    // Confirm before deletion
    const confirmDelete = confirm("Are you sure you want to delete this shift?");
    if (!confirmDelete) return;

    // Send DELETE request to the server
    fetch(`/deleteShift/${shiftId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Successfully deleted, now refresh the shift data
            alert("Shift deleted successfully!");
            refreshShiftsData(); // Refresh the shifts list after deletion
        } else {
            return response.json().then(errorData => {
                throw new Error(errorData.message || "Failed to delete shift");
            });
        }
    })
    .catch(error => {
        console.error("Error deleting shift:", error);
        alert("Error deleting shift: " + error.message);
    });
}


// // Function to display the edit shift popup and populate fields
// function editShift(shiftId) {
//     // Fetch shift details from the local object (assuming `shiftData` contains your shifts)
//     const shiftData = shiftsData[shiftId]; // Replace with your actual data source

//     if (shiftData) {
//         document.getElementById('editShiftName').value = shiftData.route_shift_name;
        
//         // Clear existing tags and suggestions
//         selectedStandardsDivisions = shiftData.route_shift_detail.split(", ").map(classes => classes.trim());
//         renderSelectedStandardsDivisionsEdit();
        
//         // Show popup and background blur
//         document.getElementById('editShiftPopup').style.display = 'block';
//         document.getElementById('popupBg').style.display = 'block';

//         // Store the current routeShiftId for saving later
//         currentEditingShiftId = shiftId;
//     }
// }

// // Function to close the edit shift popup
// function closeEditShiftPopup() {
//     document.getElementById('editShiftPopup').style.display = 'none';
//     document.getElementById('popupBg').style.display = 'none';
// }


// // Function to fetch and display suggestions for the edit form
// function fetchAndDisplayEditSuggestions(query) {
//     fetch("/distinctStandardsDivisions")
//         .then(response => response.json())
//         .then(data => {
//             const classSuggestionsEdit = document.getElementById("classSuggestionsContainer");
//             classSuggestionsEdit.innerHTML = ""; // Clear existing suggestions

//             const filteredData = data.filter(item => item.standard_with_division.toLowerCase().includes(query.toLowerCase()));

//             if (filteredData.length === 0) {
//                 classSuggestionsEdit.style.display = "none"; // Hide suggestions container
//             } else {
//                 filteredData.forEach(item => {
//                     const suggestionItem = document.createElement("div");
//                     suggestionItem.classList.add("suggestion-item");
//                     suggestionItem.textContent = item.standard_with_division;
//                     suggestionItem.addEventListener("click", function () {
//                         addStandardDivisionToSelectedEdit(item.standard_with_division);
//                     });
//                     classSuggestionsEdit.appendChild(suggestionItem);
//                 });
//                 classSuggestionsEdit.style.display = "flex"; // Show suggestions container
//             }
//         })
//         .catch(error => console.error("Error fetching suggestions:", error));
// }

// // Function to add a standard with division to the selected list (for edit)
// function addStandardDivisionToSelectedEdit(standardDivision) {
//     if (!selectedStandardsDivisions.includes(standardDivision)) {
//         selectedStandardsDivisions.push(standardDivision);
//         renderSelectedStandardsDivisionsEdit();
//     }
//     document.getElementById("classSuggestionsContainer").style.display = "none"; // Hide suggestions container
// }

// // Function to remove a standard with division from the selected list (for edit)
// function removeStandardDivisionFromSelectedEdit(standardDivision) {
//     selectedStandardsDivisions = selectedStandardsDivisions.filter(sd => sd !== standardDivision);
//     renderSelectedStandardsDivisionsEdit();
// }

// // Function to render selected standards with divisions (for edit)
// function renderSelectedStandardsDivisionsEdit() {
//     const shiftTypeContainer = document.getElementById('shiftClassesContainer');
//     const shiftTypeInput = document.getElementById('classInput');

//     // Remove all tags except the input field
//     Array.from(shiftTypeContainer.childNodes).forEach(child => {
//         if (child !== shiftTypeInput && child !== document.getElementById('classSuggestionsContainer')) {
//             shiftTypeContainer.removeChild(child);
//         }
//     });

//     selectedStandardsDivisions.forEach(standardDivision => {
//         const divisionElem = document.createElement("div");
//         divisionElem.classList.add("tag");
//         divisionElem.textContent = standardDivision;

//         const removeButton = document.createElement("span");
//         removeButton.classList.add("remove-tag");
//         removeButton.textContent = "×";
//         removeButton.addEventListener("click", () => removeStandardDivisionFromSelectedEdit(standardDivision));

//         divisionElem.appendChild(removeButton);
//         shiftTypeContainer.insertBefore(divisionElem, shiftTypeInput);
//     });

//     shiftTypeInput.value = "";
// }

// // Event listener for the standardsDivisions input field (for edit)
// document.getElementById('classInput').addEventListener('input', function () {
//     const query = this.value;
//     if (query.length >= 1) {
//         fetchAndDisplayEditSuggestions(query);
//     } else {
//         document.getElementById('classSuggestionsContainer').style.display = "none"; // Hide suggestions container
//     }
// });

// // Function to save shift details
// function saveShiftDetails() {
//     const shiftName = document.getElementById("editShiftName").value;
//     const shiftClasses = selectedStandardsDivisions.join(", "); // Convert array to comma-separated string

//     // Call the API to save shift details
//     fetch('/updateShift', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             shiftId: currentEditingShiftId, // Assume you store this somewhere on edit
//             shiftName: shiftName,
//             shiftClasses: shiftClasses,
//         })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.message === 'Shift updated successfully') {
//             alert('Shift updated successfully!');
//             closeEditShiftPopup(); // Close popup on success
//             refreshShiftsData(); // Refresh the shifts data to reflect changes
//         } else {
//             // Handle errors if the message is not 'Shift updated successfully'
//             alert('Error updating shift: ' + (data.message || 'Unknown error'));
//         }
//     })
//     .catch(error => {
//         console.error('Error updating shift:', error);
//         alert('Error updating shift: ' + error.message);
//     });
// }


let editedSelectedShiftTypes = []; // To store the selected shift types
let selectedShiftId = null; // To store the currently selected shift ID

// Function to fetch and display shift type suggestions based on input query
function fetchAndDisplayShiftTypeSuggestions(query) {
    fetch("/distinctStandardsDivisions")
        .then((response) => response.json())
        .then((data) => {
            const suggestionsContainer = document.getElementById("shiftTypeSuggestionsContainer");
            suggestionsContainer.innerHTML = ""; // Clear existing suggestions

            // Filter shift types based on the query
            const filteredData = data.filter(item => item.standard_with_division.toLowerCase().includes(query.toLowerCase()));

            if (filteredData.length === 0) {
                suggestionsContainer.style.display = "none"; // Hide if no matches
            } else {
                filteredData.forEach((item) => {
                    const suggestionItem = document.createElement("div");
                    suggestionItem.classList.add("suggestion-item");
                    suggestionItem.textContent = item.standard_with_division;

                    // Add click event to select a suggestion
                    suggestionItem.addEventListener("click", function () {
                        addShiftTypeToEditedSelected(item.standard_with_division);
                    });

                    suggestionsContainer.appendChild(suggestionItem);
                });
                suggestionsContainer.style.display = "flex"; // Show suggestions
            }
        })
        .catch((error) => console.error("Error fetching suggestions:", error));
}

// Function to add a shift type to the edited selected list
function addShiftTypeToEditedSelected(shiftType) {
    if (!editedSelectedShiftTypes.includes(shiftType)) {
        editedSelectedShiftTypes.push(shiftType); // Add to the array if not already present
        renderEditedSelectedShiftTypes(); // Re-render the tags
    }
    document.getElementById("shiftTypeInputField").value = ""; // Clear input after selection
    document.getElementById("shiftTypeSuggestionsContainer").style.display = "none"; // Hide suggestions
}

// Event listener for the shift type input to trigger suggestions
document.getElementById("shiftTypeInputField").addEventListener("input", function () {
    const query = this.value;
    if (query.length >= 1) {
        fetchAndDisplayShiftTypeSuggestions(query); // Trigger suggestions based on input
    } else {
        document.getElementById("shiftTypeSuggestionsContainer").style.display = "none"; // Hide suggestions if input is cleared
    }
});

// Function to open the edit shift popup
function editShift(shiftId) {
    const shift = shiftsData[shiftId];
    document.getElementById("editShiftNameInput").value = shift.route_shift_name;

    // Populate the selected shift types from the shift details (comma-separated)
    editedSelectedShiftTypes = shift.route_shift_detail.split(", ").map(type => type.trim());
    renderEditedSelectedShiftTypes();

    // Show popup and blur background
    document.getElementById("editShiftPopup").style.display = "block";
    document.getElementById("popupBackgroundShift").style.display = "block";

    // Store the current shiftId for saving later
    selectedShiftId = shiftId;
}

// Function to close the edit shift popup
function closeEditShiftPopup() {
    document.getElementById("editShiftPopup").style.display = "none";
    document.getElementById("popupBackgroundShift").style.display = "none";
    document.getElementById("shiftTypeSuggestionsContainer").style.display = "none"; // Hide suggestions
}

// Function to render the selected shift types as tags
function renderEditedSelectedShiftTypes() {
    const shiftTypeContainer = document.getElementById("shiftTypeseditContainer");

    // Remove all existing tags except the input field
    Array.from(shiftTypeContainer.childNodes).forEach(child => {
        if (child !== document.getElementById("shiftTypeInputField")) {
            shiftTypeContainer.removeChild(child);
        }
    });

    // Create and append tags for each selected shift type
    editedSelectedShiftTypes.forEach(type => {
        const tagElement = document.createElement("div");
        tagElement.classList.add("tag");
        tagElement.textContent = type;

        const removeButton = document.createElement("span");
        removeButton.classList.add("remove-tag");
        removeButton.textContent = "×";
        removeButton.addEventListener("click", () => removeShiftType(type));

        tagElement.appendChild(removeButton);
        shiftTypeContainer.insertBefore(tagElement, document.getElementById("shiftTypeInputField"));
    });

    document.getElementById("shiftTypeInputField").value = ""; // Clear input field
}

// Function to remove a selected shift type
function removeShiftType(type) {
    editedSelectedShiftTypes = editedSelectedShiftTypes.filter(t => t !== type);
    renderEditedSelectedShiftTypes(); // Re-render the tags
}

// Function to save shift details (you'll need to send edited selected shift types as a comma-separated string)
function saveShiftDetails() {
    const shiftName = document.getElementById("editShiftNameInput").value;
    const shiftTypes = editedSelectedShiftTypes.join(", "); // Convert array to comma-separated string

    // Validate shift details before sending data to the server
    fetch('/shift_validateDetails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shiftId: selectedShiftId, shiftName: shiftName })
    })
    .then(response => response.json())
    .then(result => {
        if (!result.isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                html: result.message
            });
            return;
        }

        // Call the API to save shift details (implement the backend for this)
        fetch('/updateShift', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                shiftId: selectedShiftId, // Assume you store this somewhere on edit
                shiftName: shiftName,
                shiftClasses: shiftTypes, // This corresponds to route_shift_detail in your SQL
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Shift updated successfully') {
                alert('Shift updated successfully!');
                closeEditShiftPopup(); // Close popup on success
                refreshShiftsData(); // Refresh the shifts data to reflect changes
            } else {
                alert('Error updating shift: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating shift:', error);
            alert('An error occurred while updating the shift.');
        });
    })
    .catch(error => console.error('Error:', error));
}
