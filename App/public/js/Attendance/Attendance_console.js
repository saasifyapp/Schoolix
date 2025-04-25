// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get all necessary elements
  const button1 = document.getElementById("button1");
  const overlay1 = document.getElementById("overlay1");
  const closeOverlay1 = document.getElementById("closeAttendanceOverlay1");
  const enrollFaceOverlay = document.getElementById("enrollFaceOverlay");
  const manageOverlay = document.getElementById("manageOverlay");

  const attendanceBtn = document.getElementById("attendanceBtn");
  const attendanceOverlay = document.getElementById("attendanceOverlay");
  const closeAttendanceOverlay = document.getElementById(
    "closeAttendanceOverlay"
  );

  const attendanceSummaryBtn = document.getElementById(
    "attendanceSummaryButton"
  );
  const attendanceSummaryOverlay = document.getElementById(
    "attendanceSummaryOverlay"
  );
  const closeAttendanceSummaryOverlay = document.getElementById(
    "closeAttendanceSummaryOverlay"
  );

  // Select the buttons more precisely
  const enrollFaceBtn = overlay1.querySelector(
    ".button-container .enrollAndManageCard:nth-child(1) span"
  );
  const manageBtn = overlay1.querySelector(
    ".button-container .enrollAndManageCard:nth-child(2) span"
  );

  // Debugging to ensure correct elements are selected
  //console.log("Enroll Face Button:", enrollFaceBtn);
 // console.log("Manage Button:", manageBtn);

  // Function to show overlay
  function showOverlay(overlay) {
    overlay.style.display = "flex";
    setTimeout(() => {
      overlay.style.opacity = "1";
    }, 10);
  }

  // Function to hide overlay
  function hideOverlay(overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.style.display = "none";
    }, 300);
  }

  // Initial click to open first overlay
  button1.addEventListener("click", function () {
    showOverlay(overlay1);
  });

  // Close first overlay
  closeOverlay1.addEventListener("click", function () {
    hideOverlay(overlay1);
  });

  // Open enroll face overlay
  enrollFaceBtn.addEventListener("click", function () {
    //console.log("Enroll Face clicked");
    hideOverlay(overlay1);
    showOverlay(enrollFaceOverlay);
  });

  // Open manage overlay
  manageBtn.addEventListener("click", function () {
    refreshManageData();
    //console.log("Manage clicked");
    hideOverlay(overlay1);
    showOverlay(manageOverlay);
  });

  // Close enroll face overlay
  if (enrollFaceOverlay) {
    enrollFaceOverlay
      .querySelector(".close-button")
      .addEventListener("click", function () {
        hideOverlay(enrollFaceOverlay);
      });
  }

  // Close manage overlay
  if (manageOverlay) {
    manageOverlay
      .querySelector(".close-button")
      .addEventListener("click", function () {
        hideOverlay(manageOverlay);
      });
  }

  // Open attendance overlay
  attendanceBtn.addEventListener("click", function () {
    showOverlay(attendanceOverlay);
    populateAttendanceTable();
  });

  // Close attendance overlay
  closeAttendanceOverlay.addEventListener("click", function () {
    hideOverlay(attendanceOverlay);
  });

  // Open attendance summary overlay
  attendanceSummaryBtn.addEventListener("click", function () {
    showOverlay(attendanceSummaryOverlay);
    populateAttendanceSummaryTable();

  });

  // Close attendance summary overlay
  closeAttendanceSummaryOverlay.addEventListener("click", function () {
    hideOverlay(attendanceSummaryOverlay);
  });
});

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get the start capture button
  const startCaptureBtn = document.getElementById("startCaptureBtn");

  // Add click event to start capture button
  startCaptureBtn.addEventListener("click", function () {
    // Open the existing CaptureImage.html in a new tab
    const newWindow = window.open("CaptureImage.html", "_blank");
    if (!newWindow) {
      alert("Please allow pop-ups for this site to open the capture window.");
    }
  });
});


////////////// UNIFIED EXPORT FOR ALL OVERLAYS ///////////


function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  const rows = table.querySelectorAll('tbody tr'); // Select only rows within the table body

  let csvContent = '';

  // Collect headers dynamically, excluding the 'Action' and 'Preview' columns if present
  const headers = table.querySelectorAll('th');
  const headerData = [];
  headers.forEach((header) => {
      const headerText = header.textContent.trim().toLowerCase();
      if (headerText !== 'action' && headerText !== 'preview') {
          headerData.push(`"${header.textContent.trim()}"`);
      }
  });
  csvContent += headerData.join(',') + '\n';

  // Collect row data, excluding the 'Action' and 'Preview' columns if present
  rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      const rowData = [];
      cells.forEach((cell, index) => {
          const thElement = table.querySelector(`th:nth-child(${index + 1})`);
          const thText = thElement ? thElement.textContent.trim().toLowerCase() : '';

          if (thText !== 'action' && thText !== 'preview') {
              rowData.push(`"${cell.textContent.trim()}"`);
          }
      });
      // Check if rowData has content before adding to csvContent
      if (rowData.length > 0) {
          csvContent += rowData.join(',') + '\n';
      }
  });

  // Create and trigger CSV download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
  } else {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Function to clear all input fields and session storage within a given overlay
  function clearInputsAndSessionStorage(overlayId) {
      const overlay = document.getElementById(overlayId);
      if (overlay) {
          // Clear all input elements within the overlay
          const inputs = overlay.querySelectorAll('input');
          inputs.forEach(input => {
              if (input.type === 'file') {
                  // Clear file input
                  input.value = '';
              } else if (input.type === 'text' || input.type === 'date' || input.type === 'time' || input.type === 'hidden') {
                  // Clear text, date, time, and hidden inputs
                  input.value = '';
              }
          });

          // Clear select elements if any
          const selects = overlay.querySelectorAll('select');
          selects.forEach(select => {
              select.value = '';
          });

          // Reset image previews for enrollFaceOverlay
          if (overlayId === 'enrollFaceOverlay') {
              for (let i = 1; i <= 5; i++) {
                  const imagePreview = document.getElementById(`imagePreview${i}`);
                  if (imagePreview) {
                      imagePreview.src = '';
                      imagePreview.style.display = 'none';
                  }
              }

              // Clear sessionStorage keys for enrollFaceOverlay
              for (let i = 1; i <= 5; i++) {
                  sessionStorage.removeItem(`userImage${i}`);
              }
              sessionStorage.removeItem('liveUserFaces');
          }

          // Clear search bars if applicable
          if (overlayId.includes('SearchBar')) {
              const searchBar = overlay.querySelector('input[type="text"]');
              if (searchBar) {
                  searchBar.value = '';
              }
          }
      }
  }

  // Mapping of close buttons to their respective overlays
  const closeButtonMap = [
      { buttonId: 'closeAttendanceOverlay1', overlayId: 'overlay1' },
      { buttonId: 'closeAttendanceOverlay', overlayId: 'attendanceOverlay' },
      { buttonId: 'closeManageOverlay', overlayId: 'manageOverlay' },
      { buttonId: 'closeAttendanceSummaryOverlay', overlayId: 'attendanceSummaryOverlay' },
  ];

  // Add event listeners for close buttons with IDs
  closeButtonMap.forEach(({ buttonId, overlayId }) => {
      const closeButton = document.getElementById(buttonId);
      if (closeButton) {
          closeButton.addEventListener('click', () => {
              clearInputsAndSessionStorage(overlayId);
          });
      }
  });

  // Handle enrollFaceOverlay close button (has no ID, selected by class)
  const enrollFaceCloseButton = document.querySelector('#enrollFaceOverlay .close-button');
  if (enrollFaceCloseButton) {
      enrollFaceCloseButton.addEventListener('click', () => {
          clearInputsAndSessionStorage('enrollFaceOverlay');
      });
  }

  // Handle imagePreviewOverlay close button
  const imagePreviewCloseButton = document.querySelector('#imagePreviewOverlay .close-button');
  if (imagePreviewCloseButton) {
      imagePreviewCloseButton.addEventListener('click', () => {
          const previewInImage = document.getElementById('previewInImage');
          const previewOutImage = document.getElementById('previewOutImage');
          if (previewInImage) previewInImage.src = '';
          if (previewOutImage) previewOutImage.src = '';
      });
  }
});


// Show the loading animation with a blurred background
function showAttendanceLoadingAnimation() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
      loadingOverlay.style.display = 'flex'; // Show the overlay
  }
}

// Hide the loading animation and remove the blur
function hideAttendanceLoadingAnimation() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
      loadingOverlay.style.display = 'none'; // Hide the overlay
  }
}