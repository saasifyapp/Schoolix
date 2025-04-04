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
