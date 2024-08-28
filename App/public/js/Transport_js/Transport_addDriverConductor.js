document.addEventListener("DOMContentLoaded", function () {
  const typeSelect = document.getElementById("type");
  const dynamicFields = document.getElementById("dynamicFields");
  const addDriverForm = document.getElementById("addDriverForm");
  const driverConductorTableBody = document.getElementById("driverConductorTableBody");

  typeSelect.addEventListener("change", function () {
    dynamicFields.innerHTML = ""; // Clear existing fields

    if (this.value === "driver") {
      dynamicFields.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <input type="text" class="form-control" id="vehicle_no" placeholder=" " maxlength="13">
            <span class="form-control-placeholder">Vehicle Number</span>
          </div>
          <div class="form-group">
            <select id="vehicle_type" class="form-control">
              <option value="">Select Vehicle Type</option>
              <option value="Bus">Bus</option>
              <option value="Van">Van</option>
              <option value="Car">Car</option>
              <option value="Other">Other</option>
            </select>
            <span class="form-control-placeholder">Vehicle Type</span>
          </div>
          <div class="form-group">
            <input type="number" class="form-control" id="vehicle_capacity" placeholder=" ">
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
        <div id="suggestions" class="suggestions"></div>
      `;

      const vehicleNoInput = document.getElementById("vehicle_no");
      const suggestionsContainer = document.getElementById("suggestions");

      // Add event listener to format vehicle number
      vehicleNoInput.addEventListener("input", function () {
        this.value = formatVehicleNumber(this.value);
        const query = this.value;
        if (query.length >= 0) {
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
        } else {
          suggestionsContainer.style.display = "none"; // Hide suggestions container
          suggestionsContainer.innerHTML = "";
        }
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
    e.preventDefault();

    const formData = {
      name: document.getElementById("name").value,
      contact: document.getElementById("contact").value,
      address: document.getElementById("address").value,
      type: document.getElementById("type").value,
      vehicle_no: document.getElementById("vehicle_no")
        ? document.getElementById("vehicle_no").value
        : null,
      vehicle_type:
        document.getElementById("type").value === "driver"
          ? document.getElementById("vehicle_type").value
          : null,
      vehicle_capacity:
        document.getElementById("type").value === "driver"
          ? document.getElementById("vehicle_capacity").value
          : null,
    };

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
          alert(data.error);
        } else {
          alert(data.message);
          resetForm();
          //hideOverlay('addDriverOverlay');
          displayDriverConductors(); // Refresh the table after adding a new entry
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while submitting the form");
      });
  });

  // Function to reset the form and clear dynamic fields
  function resetForm() {
    addDriverForm.reset(); // Reset the form fields
    dynamicFields.innerHTML = ""; // Clear dynamic fields
    typeSelect.value = ""; // Reset type select
  }

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

  // Function to fetch and display driver/conductor details
  function displayDriverConductors() {
    fetch("/displayDriverConductors")
      .then((response) => response.json())
      .then((data) => {
        driverConductorTableBody.innerHTML = ""; // Clear existing table rows

        if (data.length === 0) {
          const noResultsRow = document.createElement("tr");
          noResultsRow.innerHTML = '<td colspan="8">No results found</td>';
          driverConductorTableBody.appendChild(noResultsRow);
        } else {
          // Reverse the data array
          data.reverse();

          // Dynamically create table rows
          data.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${item.name || ""}</td>
              <td>${item.contact || ""}</td>
              <td>${item.address || ""}</td>
              <td>${item.driver_conductor_type || ""}</td>
              <td>${item.vehicle_no || ""}</td>
              <td>${item.vehicle_type || ""}</td>
              <td>${item.vehicle_capacity || ""}</td>
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
      })
      .catch((error) => console.error("Error:", error));
  }

  // Initial fetch and display of driver/conductor details
  displayDriverConductors();
});