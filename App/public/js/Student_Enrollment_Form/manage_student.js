document.addEventListener("DOMContentLoaded", () => {
    // Update Student Overlay (Make sure overlay is in HTML)
    const updateStudentButton = document.getElementById("updateStudent");
    const updateStudentOverlay = document.getElementById("updateStudentOverlay"); // Ensure this exists in HTML
    const closeOverlayUpdateButton = document.getElementById("closeOverlayUpdate");

    if (updateStudentButton && updateStudentOverlay && closeOverlayUpdateButton) {
        updateStudentButton.addEventListener("click", () => {
            updateStudentOverlay.style.display = "flex";
        });

        closeOverlayUpdateButton.addEventListener("click", () => {
            updateStudentOverlay.style.display = "none";
        });
    }

    // Search Student Overlay
    const searchStudentButton = document.getElementById("searchStudent");
    const searchStudentOverlay = document.getElementById("searchStudentOverlay");
    const closeOverlaySearchButton = document.getElementById("closeSearchStudentOverlay");

    if (searchStudentButton && searchStudentOverlay && closeOverlaySearchButton) {
        searchStudentButton.addEventListener("click", () => {
            searchStudentOverlay.style.display = "flex"; // Show overlay when button clicked
        });

        closeOverlaySearchButton.addEventListener("click", () => {
            searchStudentOverlay.style.display = "none"; // Hide overlay when close button clicked
        });
    }

    // Delete Student Overlay
    const deleteStudentButton = document.getElementById("deleteStudent");
    const deleteStudentOverlay = document.getElementById("deleteStudentOverlay");
    const closeOverlayDeleteButton = document.getElementById("closeOverlayDelete");

    if (deleteStudentButton && deleteStudentOverlay && closeOverlayDeleteButton) {
        deleteStudentButton.addEventListener("click", () => {
            deleteStudentOverlay.style.display = "flex";
        });

        closeOverlayDeleteButton.addEventListener("click", () => {
            deleteStudentOverlay.style.display = "none";
        });
    }
});

// Open filter overlay when the "Filter" button is clicked
document.querySelector('.filterButton').addEventListener('click', function() {
    document.getElementById('filterOverlay').style.display = 'flex';
});

// Close filter overlay when the "X" button is clicked
document.getElementById('closeFilterOverlay').addEventListener('click', function() {
    document.getElementById('filterOverlay').style.display = 'none';
});

// Function to update the right-side content based on selected checkboxes
function updateRightSide() {
    const selectedFiltersDiv = document.getElementById("selectedFilters");
    selectedFiltersDiv.innerHTML = ''; // Clear existing selected filters

    // Get all checked checkboxes
    const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');

    // Loop through all checked checkboxes and add their labels to the right side
    checkedCheckboxes.forEach(checkbox => {
        const labelText = checkbox.parentElement.textContent.trim();
        const newDiv = document.createElement("div");
        newDiv.textContent = labelText;
        selectedFiltersDiv.appendChild(newDiv);
    });
}


function openUpdateStudentOverlay() {
    document.getElementById("updateStudentOverlay").style.display = "flex";
}

document.getElementById("closeUpdateStudentOverlay").addEventListener("click", function() {
    document.getElementById("updateStudentOverlay").style.display = "none";
});

document.querySelector(".search-button").addEventListener("click", function () {
    let searchType = document.querySelector('input[name="searchType"]:checked').value;
    let searchValue = document.getElementById("searchInput").value.trim();

    if (searchValue) {
        // Redirect with query parameters
        window.location.href = `/Student_Enrollment_Form/update_student?${searchType}=${encodeURIComponent(searchValue)}`;
    } else {
        alert("Please enter a valid search value.");
    }
});
