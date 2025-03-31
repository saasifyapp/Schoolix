document.addEventListener("DOMContentLoaded", function () {
    // Get button and overlay elements
    const button1 = document.getElementById("button1");
    const button2 = document.getElementById("button2");
    const overlay1 = document.getElementById("overlay1");
    const overlay2 = document.getElementById("overlay2");
    const closeOverlay1 = document.getElementById("closeFeeCategoryOverlay1");
    const closeOverlay2 = document.getElementById("closeFeeCategoryOverlay2");
    
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
    });

    closeOverlay2.addEventListener("click", function () {
        closeOverlay(overlay2);
    });
});


/////////////////////////////// ENROLL BUTTON FUNCTIONALITY /////////////////

document.addEventListener('DOMContentLoaded', () => {
    // Function to set up image slot functionality
    function setupImageSlot(slotNumber) {
        const startWebcamButton = document.getElementById(`startWebcam${slotNumber}`);
        const captureImageButton = document.getElementById(`captureImage${slotNumber}`);
        const stopWebcamButton = document.getElementById(`stopWebcam${slotNumber}`);
        const webcam = document.getElementById(`webcam${slotNumber}`);
        const webcamCanvas = document.getElementById(`webcamCanvas${slotNumber}`);
        const imageUpload = document.getElementById(`imageUpload${slotNumber}`);
        const imagePreview = document.getElementById(`imagePreview${slotNumber}`);
        let stream = null;

        // Start Webcam
        startWebcamButton.addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                webcam.srcObject = stream;
                webcam.style.display = 'block';
                startWebcamButton.style.display = 'none';
                captureImageButton.style.display = 'inline-block';
                stopWebcamButton.style.display = 'inline-block';
            } catch (error) {
                console.error(`Error accessing webcam for slot ${slotNumber}:`, error);
                alert('Could not access the webcam. Please ensure it is connected and permissions are granted.');
            }
        });

        // Capture Image from Webcam
        captureImageButton.addEventListener('click', () => {
            const context = webcamCanvas.getContext('2d');
            webcamCanvas.width = webcam.videoWidth;
            webcamCanvas.height = webcam.videoHeight;
            context.drawImage(webcam, 0, 0, webcamCanvas.width, webcamCanvas.height);

            // Convert canvas to JPG image and display in preview
            const imageDataUrl = webcamCanvas.toDataURL('image/jpeg');
            imagePreview.src = imageDataUrl;
            imagePreview.style.display = 'block';

            // Store image data in sessionStorage
            sessionStorage.setItem(`userImage${slotNumber}`, imageDataUrl);

            // Stop the webcam after capturing
            stopWebcam();
        });

        // Stop Webcam
        stopWebcamButton.addEventListener('click', () => {
            stopWebcam();
        });

        function stopWebcam() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                webcam.srcObject = null;
                webcam.style.display = 'none';
                startWebcamButton.style.display = 'inline-block';
                captureImageButton.style.display = 'none';
                stopWebcamButton.style.display = 'none';
            }
        }

        // Handle Image Upload from Device
        imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';

                    // Store image data in sessionStorage
                    sessionStorage.setItem(`userImage${slotNumber}`, e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Set up all 5 image slots
    for (let i = 1; i <= 5; i++) {
        setupImageSlot(i);
    }

    // Handle form submission
    document.getElementById('enrollFaceForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get the form data
        const formData = {};
        const formElements = document.getElementById('enrollFaceForm').elements;
        for (let element of formElements) {
            if (element.name && element.type !== 'file') {
                formData[element.name] = element.value;
            }
        }

        // Append images from sessionStorage
        const images = [];
        for (let i = 1; i <= 5; i++) {
            const userImageData = sessionStorage.getItem(`userImage${i}`);
            if (userImageData) {
                images.push(userImageData);
            }
        }

        console.log('Form data:', formData);
        console.log('Images stored in session:', images);

        // Send data to the backend for embedding
        try {
            const response = await fetch('/send-face-data-to-enroll', { // Modified endpoint name
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    images
                })
            });

            if (!response.ok) {
                throw new Error(`An error occurred: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Enroll process completed successfully:', result);
        } catch (error) {
            console.error('Error during enroll process:', error);
        }
    });

    // Optional: Reset all previews if form is reset
    document.getElementById('enrollFaceForm').addEventListener('reset', () => {
        for (let i = 1; i <= 5; i++) {
            const imagePreview = document.getElementById(`imagePreview${i}`);
            const webcam = document.getElementById(`webcam${i}`);
            const startWebcamButton = document.getElementById(`startWebcam${i}`);
            const captureImageButton = document.getElementById(`captureImage${i}`);
            const stopWebcamButton = document.getElementById(`stopWebcam${i}`);

            imagePreview.src = '';
            imagePreview.style.display = 'none';
            sessionStorage.removeItem(`userImage${i}`);
            if (webcam.srcObject) {
                webcam.srcObject.getTracks().forEach(track => track.stop());
                webcam.srcObject = null;
                webcam.style.display = 'none';
                startWebcamButton.style.display = 'inline-block';
                captureImageButton.style.display = 'none';
                stopWebcamButton.style.display = 'none';
            }
        }
    });
});