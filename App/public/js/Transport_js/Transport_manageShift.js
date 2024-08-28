document.addEventListener("DOMContentLoaded", function () {
    const manageShiftsForm = document.getElementById("manageShiftsForm");
    const shiftsTableBody = document.getElementById("shiftsTableBody");
    const shiftTypeInput = document.getElementById("shiftType");
    const shiftTypeContainer = shiftTypeInput.parentNode;
    const suggestionsContainer = document.getElementById("standardsDivisionsSuggestionBox");
    let selectedStandardsDivisions = [];

    // Form submission handler
    manageShiftsForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = {
            shiftName: document.getElementById("shiftName").value,
            shiftType: selectedStandardsDivisions.join(", ") // Join selected items into a single string
        };

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
                resetForm();
                displayShifts(); // Refresh the table after adding a new shift
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while submitting the form");
        });
    });

    // Function to reset the form
    function resetForm() {
        manageShiftsForm.reset(); // Reset the form fields
        selectedStandardsDivisions = []; // Clear selected items
        renderSelectedStandardsDivisions(); // Update the input field and tags
    }

    // Function to fetch and display shift details
    function displayShifts() {
        fetch("/displayShifts")
        .then((response) => response.json())
        .then((data) => {
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
        })
        .catch((error) => console.error("Error:", error));
    }

    // Function to fetch distinct standards with divisions and display suggestions
    function fetchAndDisplaySuggestions(query) {
        fetch("/distinctStandardsDivisions")
        .then((response) => response.json())
        .then((data) => {
            suggestionsContainer.innerHTML = ""; // Clear existing suggestions

            const filteredData = data.filter(item => item.standard_with_division.toLowerCase().includes(query.toLowerCase()));

            if (filteredData.length === 0) {
                suggestionsContainer.style.display = "none"; // Hide suggestions container
            } else {
                filteredData.forEach((item) => {
                    const suggestionItem = document.createElement("div");
                    suggestionItem.classList.add("suggestion-item");
                    suggestionItem.textContent = item.standard_with_division;
                    suggestionItem.addEventListener("click", function () {
                        addStandardDivisionToSelected(item.standard_with_division);
                    });
                    suggestionsContainer.appendChild(suggestionItem);
                });
                suggestionsContainer.style.display = "flex"; // Show suggestions container
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
        suggestionsContainer.style.display = "none"; // Hide suggestions container
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
            if (child !== shiftTypeInput && child !== suggestionsContainer) {
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
            fetchAndDisplaySuggestions(query);
        } else {
            suggestionsContainer.style.display = "none"; // Hide suggestions container
        }
    });

    // Initial fetch and display of shift details
    displayShifts();
});