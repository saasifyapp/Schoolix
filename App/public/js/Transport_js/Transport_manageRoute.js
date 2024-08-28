document.addEventListener("DOMContentLoaded", function () {
    const manageRoutesForm = document.getElementById("manageRoutesForm");
    const routesTableBody = document.getElementById("routesTableBody");

    // Form submission handler
    manageRoutesForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = {
            routeName: document.getElementById("routeName").value,
            citiesAddress: document.getElementById("citiesAddress").value
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
    }

    // Function to fetch and display route details
    function displayRoutes() {
        fetch("/displayRoutes")
        .then((response) => response.json())
        .then((data) => {
            routesTableBody.innerHTML = ""; // Clear existing table rows

            if (data.length === 0) {
                const noResultsRow = document.createElement("tr");
                noResultsRow.innerHTML = '<td colspan="3">No results found</td>';
                routesTableBody.appendChild(noResultsRow);
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
        })
        .catch((error) => console.error("Error:", error));
    }

    // Initial fetch and display of route details
    displayRoutes();
});