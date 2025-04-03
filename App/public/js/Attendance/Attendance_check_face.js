document.addEventListener("DOMContentLoaded", function () {
    const captureButton = document.getElementById("captureImageBtn");
    const videoElement = document.getElementById("videoPreview");
    const canvasElement = document.getElementById("capturedCanvas");

    let stream = null;
    let isDetecting = false;
    let detectionConfirmed = 0;
    let modelLoaded = false;
    let storedEmbeddings = [];

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
            storedEmbeddings = data.embeddings;  // Assuming the endpoint returns { embeddings: [...] }

            //console.log('Embeddings retrieved:', storedEmbeddings);
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

        sessionStorage.removeItem("liveUserFaces"); // Clear previous images

        videoElement.width = 640; // Reset video element size
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
                Swal.close(); // Close loading screen only when everything is ready
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

        // Stop the camera stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        try {
            const storedFaces = getStoredImages();
            const latestImage = storedFaces[storedFaces.length - 1];

            const response = await fetch('/check-user-face-existence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: latestImage, embeddings: storedEmbeddings })
            });

            const result = await response.json();
            //console.log(result.message);  // Display server response in console
        } catch (error) {
            console.error('Error calling endpoint:', error);
        }
    }

    function saveImageToSession(base64Image) {
        let storedFaces = getStoredImages();
        storedFaces.push(base64Image);
        sessionStorage.setItem("liveUserFaces", JSON.stringify(storedFaces));
    }

    function getStoredImages() {
        return JSON.parse(sessionStorage.getItem("liveUserFaces")) || [];
    }

    captureButton.addEventListener("click", startWebcam);
});