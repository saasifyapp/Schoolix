document.addEventListener("DOMContentLoaded", function () {
    // Get button and overlay elements
    const button1 = document.getElementById("button1");
    const button2 = document.getElementById("button2");
    const overlay1 = document.getElementById("overlay1");
    const overlay2 = document.getElementById("overlay2");
    const closeOverlay1 = document.getElementById("closeAttendanceOverlay1");
    const closeOverlay2 = document.getElementById("closeAttendanceOverlay2");
    
    // Function to open an overlay
    function openOverlay(overlay) {
        overlay.style.display = "flex";
    }

    // Function to close an overlay
    function closeOverlay(overlay) {
        overlay.style.display = "none";
    }

    // Add event listeners
    button1.addEventListener("click", function () {
        openOverlay(overlay1);
    });

    button2.addEventListener("click", function () {
        openOverlay(overlay2);
    });

    closeOverlay1.addEventListener("click", function () {
        closeOverlay(overlay1);
        clearOverlayContents(overlay1);
    });

    closeOverlay2.addEventListener("click", function () {
        closeOverlay(overlay2);
    });
});



function clearOverlayContents(overlay) {
    if (overlay === overlay1) {
        // Reset form fields
        document.getElementById('enrollFaceForm').reset();

        // Remove images from sessionStorage
        for (let i = 1; i <= 5; i++) {
            sessionStorage.removeItem(`userImage${i}`);
        }

        // Clear image previews if displayed
        for (let i = 1; i <= 5; i++) {
            const imgPreview = document.getElementById(`imagePreview${i}`);
            if (imgPreview) imgPreview.src = "";
        }

        // Hide overlay
        overlay.style.display = "none";
    }
}



