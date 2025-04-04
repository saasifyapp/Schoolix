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
  console.log("Enroll Face Button:", enrollFaceBtn);
  console.log("Manage Button:", manageBtn);

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
    console.log("Enroll Face clicked");
    hideOverlay(overlay1);
    showOverlay(enrollFaceOverlay);
  });

  // Open manage overlay
  manageBtn.addEventListener("click", function () {
    refreshManageData();
    console.log("Manage clicked");
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


async function refreshManageData() {
  try {
    const response = await fetch('/get-manage-enrollments');

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();

    if (result.data && result.data.length > 0) {
      displayManageTable(result.data);
    } else {
      document.getElementById('manageTableBody').innerHTML = `
              <tr><td colspan="8" style="text-align:center;">No enrollments found.</td></tr>
          `;
      Swal.fire({
        icon: 'info',
        title: 'No Records',
        text: result.message || 'No enrollment data available.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  } catch (error) {
    console.error('[REFRESH ERROR]:', error.message);
    Swal.fire({
      icon: 'error',
      title: 'Error Fetching Data',
      text: error.message,
      confirmButtonText: 'Retry'
    });
  }
}

function displayManageTable(enrollments) {
  const tableBody = document.getElementById('manageTableBody');
  tableBody.innerHTML = '';

  enrollments.forEach(enroll => {
    const row = document.createElement('tr');

    row.innerHTML = `
          <td>${enroll.face_record_id}</td>
          <td>${enroll.name}</td>
          <td>${enroll.user_id}</td>
          <td>${enroll.section}</td>
          <td>${enroll.standard_division}</td>
          <td>
              <button onclick="handleDelete('${enroll.face_record_id}', '${enroll.name}', '${enroll.user_id}')">
  Delete
</button>

          </td>
      `;

    tableBody.appendChild(row);
  });
}

async function handleDelete(faceRecordId, name, user_id) {
  const confirmDelete = await Swal.fire({
    title: 'Are you sure?',
    html: `
      <strong>This will permanently delete the following record:</strong><br><br>
      <b>Name:</b> ${name}<br>
      <b>Gr/ID:</b> ${user_id}<br>
      <b>Record ID:</b> ${faceRecordId}
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  });

  if (confirmDelete.isConfirmed) {
    try {
      const response = await fetch(`/delete-enrollment/${faceRecordId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted Successfully',
          html: `
            <b>${name}</b> with Gr/ID <b>${user_id}</b> (Record ID: <b>${faceRecordId}</b>) has been deleted.
          `,
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6',
          showConfirmButton: true
        });
        
        refreshManageData(); // refresh table
      } else {
        throw new Error(result.message || 'Deletion failed.');
      }

    } catch (error) {
      console.error('[DELETE ERROR]:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  }
}


