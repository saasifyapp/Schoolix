///////////////////////////////   OVERLAY 1  //////////////////////////

/////////////////////////////// IMAGE CAPTURING FUNCTIONALITY /////////////////

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

///////////////////////////////////////// ENROLL BUTTON FUNCTIONALITY //////////////////////    

document.getElementById('enrollFaceForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get form data & validate required fields
    let isFormValid = true;
    let missingFields = [];
    const formData = {};
    const requiredFields = ["category", "name", "grId", "section", "standard"];
    const formElements = document.getElementById('enrollFaceForm').elements;

    for (let element of formElements) {
        if (element.name && element.type !== 'file') {
            formData[element.name] = element.value.trim();
            if (requiredFields.includes(element.name) && !formData[element.name]) {
                isFormValid = false;
                missingFields.push(element.name);
            }
        }
    }

    // Append images directly into formData & check at least 1 image is provided
    let imageCount = 0;
    for (let i = 1; i <= 5; i++) {
        const userImageData = sessionStorage.getItem(`userImage${i}`);
        if (userImageData) {
            formData[`image${i}`] = userImageData;
            imageCount++;
        }
    }

    if (imageCount === 0) {
        isFormValid = false;
        missingFields.push("at least one image");
    }

    // If validation fails, show error and stop execution
    if (!isFormValid) {
        await Swal.fire({
            icon: "warning",
            title: "Missing Information!",
            html: `Please fill out: <strong>${missingFields.join(", ")}</strong>`,
        });
        return;  // Stop execution if validation fails
    }

    // Initialize Swal loader
    const updateSwal = async (message) => {
        Swal.update({
            title: "Enrolling Face...",
            html: message,
            allowOutsideClick: false,
            showConfirmButton: false,
        });
        Swal.showLoading();
        await new Promise((resolve) => setTimeout(resolve, 1000));  // Smooth UI transition
    };

    // Show initial Swal loader
    Swal.fire({
        title: "Processing...",
        html: "🔄 Sending images for embedding...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
    });

    try {
        await updateSwal("🔄 Embedding images...");
        const response = await fetch('/send-face-data-to-enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.statusText}`);
        }

        const result = await response.json();
        await updateSwal("🔄 Storing face details...");

        // Success Alert with Dynamic Data
        await Swal.fire({
            icon: "success",
            title: "✅ Face Enrolled Successfully!",
            html: `Face enrolled for <strong>GR No: ${formData.grId}</strong> | <strong>Name: ${formData.name}</strong> | <strong>Standard: ${formData.standard}</strong>`,
        });

        // Clear form fields
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

    } catch (error) {
        await Swal.fire({
            icon: "error",
            title: "❌ Enrollment Failed",
            text: error.message || "An unexpected error occurred. Please try again.",
        });
    }
});



/////////////////////////////////////////////////////////////////////////////////

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


/////////////////////////////////////////////////////////////////////////////////