document.addEventListener("DOMContentLoaded", function () {
    const captureButton = document.getElementById("captureImageBtn");
    const stopCaptureButton = document.getElementById("stopCaptureBtn");
    const videoElement = document.getElementById("videoPreview");
    const canvasElement = document.getElementById("capturedCanvas");

    let stream = null;
    let isDetecting = false;
    let detectionConfirmed = 0;
    let modelLoaded = false;
    let storedEmbeddings = [];

    const beepSound = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');

    // Initial button states when page loads
    captureButton.disabled = false;  // Enable capture button
    stopCaptureButton.disabled = true; // Disable stop button

    async function loadFaceModel() {
        if (modelLoaded) return;
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri("https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights");
            modelLoaded = true;
        } catch (error) {
            console.error("❌ Error Loading Face Model:", error);
        }
    }

    async function fetchEmbeddings() {
        try {
            const response = await fetch('/retrieve-stored-embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            storedEmbeddings = data.embeddings;
        } catch (error) {
            console.error('❌ Error retrieving embeddings:', error);
        }
    }

    async function startWebcam() {
        Swal.fire({
            title: "🤖 Loading AI Vision...",
            html: "Initializing Face Detection & Camera...",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });

        sessionStorage.removeItem("liveUserFaces");

        videoElement.width = 640;
        videoElement.height = 480;

        try {
            await loadFaceModel();
            await fetchEmbeddings();

            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }

            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (!stream) throw new Error("Webcam access denied or unavailable.");

            videoElement.srcObject = stream;

            videoElement.onloadedmetadata = () => {
                Swal.close();
                detectFace();
            };
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "🚫 Camera Access Denied!",
                text: "Please allow webcam access in your browser settings.",
            });
            console.error("❌ Unable to access webcam:", error);
        }
    }

    async function detectFace() {
        isDetecting = true;
        detectionConfirmed = 0;
        const options = new faceapi.TinyFaceDetectorOptions();

        async function checkForFace() {
            if (!isDetecting) return;

            try {
                const results = await faceapi.detectAllFaces(videoElement, options);

                if (results.length === 1) {
                    detectionConfirmed++;
                    if (detectionConfirmed >= 3) {
                        await captureImage();
                        return;
                    }
                } else {
                    detectionConfirmed = 0;
                }
            } catch (error) {
                console.error("Face detection error:", error);
            }

            setTimeout(checkForFace, 500);
        }

        checkForFace();
    }

    async function captureImage() {
        isDetecting = false;

        const context = canvasElement.getContext("2d");
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

        const imageData = canvasElement.toDataURL("image/png");
        saveImageToSession(imageData);

        beepSound.play().catch(error => console.error("Error playing beep sound:", error));

        try {
            const storedFaces = getStoredImages();
            const latestImage = storedFaces[storedFaces.length - 1];

            const response = await fetch('/check-user-face-existence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: latestImage, embeddings: storedEmbeddings })
            });

            const result = await response.json();

            if (response.ok) {
                detectFace(); // Restart detection
            }
        } catch (error) {
            console.error('Error calling endpoint:', error);
        }
    }

    function stopCapture() {
        isDetecting = false;

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        // Reset button states after stopping
        captureButton.disabled = false;  // Re-enable capture button
        stopCaptureButton.disabled = true; // Disable stop button
    }

    function saveImageToSession(base64Image) {
        let storedFaces = getStoredImages();
        storedFaces.push(base64Image);
        sessionStorage.setItem("liveUserFaces", JSON.stringify(storedFaces));
    }

    function getStoredImages() {
        return JSON.parse(sessionStorage.getItem("liveUserFaces")) || [];
    }

    // Event listener for capture button
    captureButton.addEventListener("click", function () {
        startWebcam();
        captureButton.disabled = true;   // Disable capture button
        stopCaptureButton.disabled = false; // Enable stop button
    });

    // Event listener for stop button
    stopCaptureButton.addEventListener("click", stopCapture);
});