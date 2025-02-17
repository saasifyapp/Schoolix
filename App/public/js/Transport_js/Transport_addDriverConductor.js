// Object to store driver/conductor data by ID
let driverConductorData = {};

// Function to refresh driver/conductor data and store it locally
async function refreshDriverConductorData() {
  showTransportLoadingAnimation();
  document.getElementById("searchBar").value = "";
  document.getElementById("filtertype").value = "";
  try {
    const response = await fetch("/displayDriverConductors");
    if (!response.ok) {
      hideTransportLoadingAnimation();
      throw new Error("Failed to fetch driver/conductor details");
    }
    const data = await response.json();
    storeDriverConductorData(data);
    displayDriverConductors(data);
  } catch (error) {
    hideTransportLoadingAnimation();
    console.error("Error fetching driver/conductor details:", error);
  }
}

// Function to store the driver/conductor data locally
function storeDriverConductorData(data) {
  driverConductorData = {}; // Clear existing data

  data.forEach((item) => {
    driverConductorData[item.id] = item; // Store item by ID
  });
  console.log(driverConductorData);
}

// Function to display driver/conductor details
function displayDriverConductors(data) {
  hideTransportLoadingAnimation();
  const driverConductorTableBody = document.getElementById(
    "driverConductorTableBody"
  );
  driverConductorTableBody.innerHTML = ""; // Clear existing rows

  if (data.length === 0) {
    const noResultsRow = document.createElement("tr");
    noResultsRow.innerHTML = '<td colspan="8">No results found</td>';
    driverConductorTableBody.appendChild(noResultsRow);
  } else {
    // Reverse the data array
    data.reverse();

    data.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
         <td>${item.name || ""}</td>
              <td>${item.contact || ""}</td>
              <td>${item.address || ""}</td>
              <td>${item.driver_conductor_type || ""}</td>
              <td>${item.vehicle_no || ""}</td>
              <td>${item.vehicle_type || "-"}</td>
              <td>${item.vehicle_capacity || "-"}</td>
              <td>
                <div class="button-container" style="display: flex; justify-content: center; gap: 20px;">
                  <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                    onclick="editDriverConductor('${item.id}')"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="../images/edit.png" alt="Edit" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Edit</span>
                  </button>
                  <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                    onclick="deleteDriverConductor('${item.id}')"
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                    <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
                    <span style="margin-right: 10px;">Delete</span>
                  </button>
                </div>
              </td>
      `;
      driverConductorTableBody.appendChild(row);
    });
  }
}

// Function to search the driver/conductor by name or vehicle number
function searchDriverConductorDetails() {
  document.getElementById("filtertype").value = "";
  showTransportLoadingAnimation();
  const query = document.getElementById("searchBar").value;

  query.trim().toLowerCase(); // Normalize the search query
  const searchResults = Object.values(driverConductorData).filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.vehicle_no.toLowerCase().includes(query)
  );

  displayDriverConductors(searchResults);
}

// Function to filter driver/conductor by type
function filterDriverConductorByType() {
  showTransportLoadingAnimation();
  const selectedType = document.getElementById("filtertype").value;

  // If no type is selected, display all records
  if (!selectedType) {
    displayDriverConductors(Object.values(driverConductorData));
    return;
  }

  // Filter data by the selected type
  const filteredData = Object.values(driverConductorData).filter(
    (item) => item.driver_conductor_type === selectedType
  );

  // Display the filtered results
  displayDriverConductors(filteredData);
}

async function deleteDriverConductor(id) {
  const confirmation = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this entry? This process cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
    reverseButtons: true
  });

  if (!confirmation.isConfirmed) {
    return; // User canceled the deletion
  }

  try {
    showTransportLoadingAnimation();
    const response = await fetch(`/deleteDriverConductor/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    hideTransportLoadingAnimation();

    if (!response.ok) {
      if (response.status === 400) {
        // Specific error when driver/conductor is tagged
        await Swal.fire({
          icon: "error",
          title: "Delete Failed",
          html: `Cannot delete the driver.<br>
                 <strong>Vehicle No:</strong> ${result.vehicle_no} [${result.driver_name}]<br><br>
                 Please detag this vehicle from <br> <strong>Tagging Console</strong>.`,
        });
      } else {
        // Generic error
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while deleting the entry. Please try again.",
        });
      }

      // Only throw an error for unexpected cases to avoid logging the specific error
      if (response.status !== 400) {
        throw new Error(result.error);
      }
    } else {
      await Swal.fire({
        icon: "success",
        title: "Delete Successful",
        html: `<strong>Driver/Conductor:</strong> ${result.name} <br> has been successfully deleted.`,
      });

      // Refresh the data and display after deletion
      await refreshDriverConductorData();
    }
  } catch (error) {
    hideTransportLoadingAnimation();
    console.error("Error:", error);
    if (error.message !== "Driver/Conductor is tagged to a route and shift. Please untag before deleting.") {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred whil deleting the entry. Please try again.",
      });
    }
  }
}


const typeSelect = document.getElementById("type");
const dynamicFields = document.getElementById("dynamicFields");
const addDriverForm = document.getElementById("addDriverForm");
const driverConductorTableBody = document.getElementById(
  "driverConductorTableBody"
);

typeSelect.addEventListener("change", function () {
  dynamicFields.innerHTML = ""; // Clear existing fields

  if (this.value === "driver") {
    dynamicFields.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <input type="text" class="form-control" id="vehicle_no" placeholder=" " maxlength="13" required>
            <span class="form-control-placeholder">Vehicle Number</span>
          </div>
          <div class="form-group">
            <select id="vehicle_type" class="form-control" required>
              <option value="">Select Vehicle Type</option>
              <option value="Bus">Bus</option>
              <option value="Van">Van</option>
              <option value="Car">Car</option>
              <option value="Other">Other</option>
            </select>
            <span class="form-control-placeholder">Vehicle Type</span>
          </div>
          <div class="form-group">
            <input type="number" class="form-control" id="vehicle_capacity" placeholder=" " required>
            <span class="form-control-placeholder">Capacity</span>
          </div>
        </div>
      `;

    const vehicleNoInput = document.getElementById("vehicle_no");
    vehicleNoInput.addEventListener("input", function () {
      this.value = formatVehicleNumber(this.value);
    });
  } else if (this.value === "conductor") {
    dynamicFields.innerHTML = `
        <div class="form-group">
          <input type="text" class="form-control" id="vehicle_no" placeholder=" " maxlength="13">
          <span class="form-control-placeholder">Vehicle Number</span>
        </div>
        <div id="suggestions" class="suggestions" style="position: unset;"></div>
      `;

    const vehicleNoInput = document.getElementById("vehicle_no");
    const suggestionsContainer = document.getElementById("suggestions");

    // Function to fetch driver details and update suggestions
    function fetchDriverDetails(query) {
      fetch(`/getDriverDetails?q=${query}`)
        .then((response) => response.json())
        .then((data) => {
          suggestionsContainer.style.display = "flex"; // Show suggestions container
          suggestionsContainer.innerHTML = "";

          if (data.length === 0) {
            const noResultsItem = document.createElement("div");
            noResultsItem.classList.add("suggestion-item", "no-results");
            noResultsItem.textContent = "No results found";
            suggestionsContainer.appendChild(noResultsItem);
          } else {
            data.forEach((driver) => {
              const suggestionItem = document.createElement("div");
              suggestionItem.classList.add("suggestion-item");
              suggestionItem.textContent = `${driver.vehicle_no} | ${driver.name}`;
              suggestionItem.dataset.vehicleNo = driver.vehicle_no;
              suggestionItem.dataset.name = driver.name;
              suggestionsContainer.appendChild(suggestionItem);
            });
          }
        })
        .catch((error) => console.error("Error:", error));
    }

    // Show initial suggestions on focus
    vehicleNoInput.addEventListener("focus", function () {
      fetchDriverDetails("");
    });

    // Update suggestions on input
    vehicleNoInput.addEventListener("input", function () {
      this.value = formatVehicleNumber(this.value);
      const query = this.value;
      fetchDriverDetails(query);
    });

    suggestionsContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("suggestion-item")) {
        const selectedDriver = event.target;
        vehicleNoInput.value = selectedDriver.dataset.vehicleNo;
        suggestionsContainer.style.display = "none"; // Hide suggestions container
        suggestionsContainer.innerHTML = "";
      }
    });

    document.addEventListener("click", function (event) {
      if (
        !suggestionsContainer.contains(event.target) &&
        !vehicleNoInput.contains(event.target)
      ) {
        suggestionsContainer.style.display = "none"; // Hide suggestions container
        suggestionsContainer.innerHTML = "";
      }
    });
  }
});

// Form submission handler
addDriverForm.addEventListener("submit", function (e) {
  showTransportLoadingAnimation();
  e.preventDefault();

  const formData = {
    name: capitalizeName(formatInput(document.getElementById("name")?.value || "")),
    contact: formatInput(document.getElementById("contact")?.value || ""),
    address: formatInput(document.getElementById("address")?.value || ""),
    type: formatInput(document.getElementById("type")?.value || ""),
    vehicle_no: document.getElementById("vehicle_no")
      ? formatInput(document.getElementById("vehicle_no").value)
      : null,
    vehicle_type:
      document.getElementById("type")?.value === "driver"
        ? formatInput(document.getElementById("vehicle_type")?.value || "")
        : null,
    vehicle_capacity:
      document.getElementById("type")?.value === "driver"
        ? formatInput(document.getElementById("vehicle_capacity")?.value || "")
        : null,
  };

  // Validate driver/conductor details before sending data to the server
  fetch("/validateDriverConductorDetails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((result) => {
      if (!result.isValid) {
        hideTransportLoadingAnimation();
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: result.message,
        });
        return;
      }

      // Send data to the server
      fetch("/addDriverConductor", {
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
            resetForm();
            refreshDriverConductorData(); // Refresh the table after adding a new entry
          }
        })
        .catch((error) => {
          hideTransportLoadingAnimation();
          console.error("Error:", error);
          showToast("An error occurred while submitting the form");
        });
    })
    .catch((error) => {
      console.error(error); // Correctly call console.error with the error
      hideTransportLoadingAnimation();
    });

});

// Function to reset the form and clear dynamic fields
function resetForm() {
  addDriverForm.reset(); // Reset the form fields
  dynamicFields.innerHTML = ""; // Clear dynamic fields
  typeSelect.value = ""; // Reset type select
}

document.getElementById('closeAddDriverOverlay').addEventListener('click', () => {
  resetForm();
});

// // Function to reset the form and clear dynamic fields
// function resetForm() {
//   addDriverForm.reset(); // Reset the form fields
//   dynamicFields.innerHTML = ""; // Clear dynamic fields
//   typeSelect.value = ""; // Reset type select
// }

// Function to format vehicle number
function formatVehicleNumber(value) {
  // Remove all non-alphanumeric characters except dashes
  value = value.replace(/[^a-zA-Z0-9]/g, "");

  // Automatically insert dashes at the correct positions
  if (value.length >= 2 && value[2] !== "-")
    value = value.slice(0, 2) + "-" + value.slice(2);
  if (value.length >= 5 && value[5] !== "-")
    value = value.slice(0, 5) + "-" + value.slice(5);
  if (value.length >= 8 && value[8] !== "-")
    value = value.slice(0, 8) + "-" + value.slice(8);

  return value.toUpperCase();
}

// Function to open the edit popup and populate it with data
function editDriverConductor(id) {
  const driverConductorDetails = driverConductorData[id];

  if (!driverConductorDetails) {
    console.error("Driver/Conductor not found");
    return;
  }

  const editFieldsContainer = document.getElementById("editFields");

  // Display the type as a span element
  document.getElementById("editTypeDisplay").textContent =
    driverConductorDetails.driver_conductor_type;

  // Clear previous fields
  editFieldsContainer.innerHTML = "";

  // Populate the form fields based on type
  if (driverConductorDetails.driver_conductor_type === "Driver") {
    editFieldsContainer.innerHTML = `
                 <div class="form-row">
        <div class="form-group">
            <input type="text" id="editName" name="name" class="form-control" value="${driverConductorDetails.name || ""
      }" style="text-align: center;">
            <span class="form-control-placeholder">Name</span>
        </div>
        
                  <div class="form-group">
            <input type="tel" maxlength="10" id="editContact" name="contact" class="form-control" value="${driverConductorDetails.contact || ""
      }" style="text-align: center;">
            <span class="form-control-placeholder">Contact</span>
        </div>


    </div>


<div class="form-group">
    <input type="text" id="editAddress" name="address" class="form-control" value="${driverConductorDetails.address || ""
      }" style="text-align: center;">
    <span class="form-control-placeholder">Address</span>
</div>

          <div class="form-group">
    <input readonly type="text" id="editVehicleNo" name="vehicleNo" class="form-control" value="${driverConductorDetails.vehicle_no || ""
      }" style="text-align: center;">
    <span class="form-control-placeholder">Vehicle Number</span>
</div>

          <div>
              <label for="editVehicleType">Vehicle Type:</label>
              <select id="editVehicleType" name="vehicleType" class="form-control">
                  <option value="Bus" ${driverConductorDetails.vehicle_type === "Bus"
        ? "selected"
        : ""
      }>Bus</option>
                  <option value="Van" ${driverConductorDetails.vehicle_type === "Van"
        ? "selected"
        : ""
      }>Van</option>
                  <option value="Car" ${driverConductorDetails.vehicle_type === "Car"
        ? "selected"
        : ""
      }>Car</option>
                  <option value="Other" ${driverConductorDetails.vehicle_type === "Other"
        ? "selected"
        : ""
      }>Other</option>
              </select>
          </div>
          <div style="display: flex; align-items: center; gap: 20px;">
             <div class="form-group">
    <input type="number" id="originalCapacity" name="originalCapacity" class="form-control" value="${driverConductorDetails.vehicle_capacity || 0
      }" readonly style="text-align: center;">
    <span class="form-control-placeholder">Current Capacity</span>
</div>

<div class="form-group">
    <input type="number" id="additionalCapacity" name="additionalCapacity" class="form-control" placeholder="" style="text-align: center;">
    <span class="form-control-placeholder">New Seats</span>
</div>

          </div>
          <div class="form-group" style="margin-top: 10px;">
    <span class="form-label">Total Capacity:</span>
    <span id="totalCapacity" class="form-control">${driverConductorDetails.vehicle_capacity || 0
      }</span>
</div>

      `;

    // Update total capacity dynamically
    const originalCapacityInput = document.getElementById("originalCapacity");
    const additionalCapacityInput =
      document.getElementById("additionalCapacity");
    const totalCapacitySpan = document.getElementById("totalCapacity");

    additionalCapacityInput.addEventListener("input", function () {
      const originalCapacity = parseInt(originalCapacityInput.value, 10);
      const additionalCapacity =
        parseInt(additionalCapacityInput.value, 10) || 0;
      totalCapacitySpan.textContent = originalCapacity + additionalCapacity;
    });

    const vehicleNoInput = document.getElementById("editVehicleNo");
    vehicleNoInput.addEventListener("input", function () {
      this.value = formatVehicleNumber(this.value);
    });
  } else if (driverConductorDetails.driver_conductor_type === "Conductor") {
    editFieldsContainer.innerHTML = `
          <div>
              <label for="editName">Name:</label>
              <input type="text" id="editName" name="name" class="form-control" value="${driverConductorDetails.name || ""
      }">
          </div>
          <div>
              <label for="editContact">Contact:</label>
              <input type="tel" maxlength="10" id="editContact" name="contact" class="form-control" value="${driverConductorDetails.contact || ""
      }">
          </div>
          <div>
              <label for="editAddress">Address:</label>
              <input type="text" id="editAddress" name="address" class="form-control" value="${driverConductorDetails.address || ""
      }">
          </div>
          <div>
              <label for="editVehicleNo">Vehicle Number:</label>
              <input type="text" id="editVehicleNo" name="vehicleNo" class="form-control" readonly value="${driverConductorDetails.vehicle_no || ""
      }">

              <div id="editSuggestions" class="edit-suggestions"></div>
          </div>
      `;

    const vehicleNoInput = document.getElementById("editVehicleNo");
    const suggestionsContainer = document.getElementById("editSuggestions");

    // Function to fetch driver details and update suggestions
    function fetchDriverDetails(query) {
      fetch(`/getDriverDetails?q=${query}`)
        .then((response) => response.json())
        .then((data) => {
          suggestionsContainer.style.display = "flex"; // Show suggestions container
          suggestionsContainer.innerHTML = "";

          if (data.length === 0) {
            const noResultsItem = document.createElement("div");
            noResultsItem.classList.add("edit-suggestion-item", "no-results");
            noResultsItem.textContent = "No results found";
            suggestionsContainer.appendChild(noResultsItem);
          } else {
            data.forEach((driver) => {
              const suggestionItem = document.createElement("div");
              suggestionItem.classList.add("edit-suggestion-item");
              suggestionItem.textContent = `${driver.vehicle_no} | ${driver.name}`;
              suggestionItem.dataset.vehicleNo = driver.vehicle_no;
              suggestionItem.dataset.name = driver.name;
              suggestionsContainer.appendChild(suggestionItem);
            });
          }
        })
        .catch((error) => console.error("Error:", error));
    }

    // Show initial suggestions on focus
    vehicleNoInput.addEventListener("focus", function () {
      fetchDriverDetails("");
    });

    // Update suggestions on input
    vehicleNoInput.addEventListener("input", function () {
      this.value = formatVehicleNumber(this.value);
      const query = this.value;
      fetchDriverDetails(query);
    });

    suggestionsContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("edit-suggestion-item")) {
        const selectedDriver = event.target;
        vehicleNoInput.value = selectedDriver.dataset.vehicleNo;
        suggestionsContainer.style.display = "none"; // Hide suggestions container
        suggestionsContainer.innerHTML = "";
      }
    });

    document.addEventListener("click", function (event) {
      if (
        !suggestionsContainer.contains(event.target) &&
        !vehicleNoInput.contains(event.target)
      ) {
        suggestionsContainer.style.display = "none"; // Hide suggestions container
        suggestionsContainer.innerHTML = "";
      }
    });
  }

  // Show the popup
  document.getElementById("editPopupOverlay").style.display = "flex";
  document.getElementById("editPopup").style.display = "flex";

  // Store the current ID in a hidden field for later use
  document.getElementById("editDriverConductorForm").dataset.currentId = id;
}

// Function to close the edit popup
function closeEditPopup() {
  document.getElementById("editPopupOverlay").style.display = "none";
  document.getElementById("editPopup").style.display = "none";
}

// async function saveDriverConductorDetails() {
//   showTransportLoadingAnimation();
//   const id = document.getElementById("editDriverConductorForm").dataset.currentId;
//   const driverConductorType = document.getElementById("editTypeDisplay").textContent;

//   const originalCapacity = parseInt(document.getElementById("originalCapacity").value, 10) || 0;
//   const additionalCapacity = parseInt(document.getElementById("additionalCapacity").value, 10) || 0;
//   const totalVehicleCapacity = originalCapacity + additionalCapacity;

//   const updatedDetails = {
//       id,
//       name: formatInput(document.getElementById("editName").value),
//       contact: formatInput(document.getElementById("editContact").value),
//       address: formatInput(document.getElementById("editAddress").value),
//       driver_conductor_type: driverConductorType,
//       vehicle_no: formatInput(document.getElementById("editVehicleNo").value),
//       vehicle_type: formatInput(document.getElementById("editVehicleType").value),
//       vehicle_capacity: totalVehicleCapacity,
//       new_seats: additionalCapacity,
//   };

//   try {
//       const response = await fetch("/updateAllDetails", {
//           method: "PUT",
//           headers: {
//               "Content-Type": "application/json",
//           },
//           body: JSON.stringify(updatedDetails),
//       });

//       if (!response.ok) {
//           throw new Error("Failed to update details");
//       }

//       showToast("All details updated successfully");
//       refreshDriverConductorData();
//       // refreshTable();
//       closeEditPopup();
//   } catch (error) {
//       console.error("Error saving driver/conductor details:", error);
//       showToast("An error occurred while updating the details.");
//   } finally {
//       hideTransportLoadingAnimation();
//   }
// }

function stripHtmlTags(str) {
  return str.replace(/<\/?[^>]+(>|$)/g, "");
}

async function saveDriverConductorDetails() {
  showTransportLoadingAnimation();
  const id = document.getElementById("editDriverConductorForm").dataset.currentId;
  const driverConductorType = document.getElementById("editTypeDisplay").textContent;

  const originalCapacity = parseInt(document.getElementById("originalCapacity").value, 10) || 0;
  const additionalCapacity = parseInt(document.getElementById("additionalCapacity").value, 10) || 0;
  const totalVehicleCapacity = originalCapacity + additionalCapacity;

  const updatedDetails = {
    id,
    name: formatInput(document.getElementById("editName").value),
    contact: formatInput(document.getElementById("editContact").value),
    address: formatInput(document.getElementById("editAddress").value),
    driver_conductor_type: driverConductorType,
    vehicle_no: formatInput(document.getElementById("editVehicleNo").value),
    vehicle_type: formatInput(document.getElementById("editVehicleType").value),
    vehicle_capacity: totalVehicleCapacity,
    new_seats: additionalCapacity,
  };

  try {
    // Perform validation before saving
    const validationResponse = await fetch("/validateDriverConductorDetails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: updatedDetails.id,
        name: updatedDetails.name,
        type: updatedDetails.driver_conductor_type,
        vehicle_no: updatedDetails.vehicle_no,
      }),
    });

    const validationResult = await validationResponse.json();
    if (!validationResult.isValid) {
      const messageWithoutHtml = stripHtmlTags(validationResult.message);
      showToast(messageWithoutHtml, true);
      return;
    }

    // If validation passes, proceed to update the details
    const response = await fetch("/updateAllDetails", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDetails),
    });

    if (!response.ok) {
      throw new Error("Failed to update details");
    }

    showToast("All details updated successfully");
    refreshDriverConductorData();
    closeEditPopup();
  } catch (error) {
    console.error("Error saving driver/conductor details:", error);
    showToast("An error occurred while updating the details.");
  } finally {
    hideTransportLoadingAnimation();
  }
}
