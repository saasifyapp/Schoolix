document.addEventListener("DOMContentLoaded", function () {
    const captureButton = document.getElementById("captureImageBtn");
    const stopCaptureButton = document.getElementById("stopCaptureBtn");
    const videoElement = document.getElementById("videoPreview");
    const canvasElement = document.getElementById("capturedCanvas");
    const statusText = document.getElementById("statusText");

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
            statusText.innerText = "❌ Error Loading Face Model";
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
            statusText.innerText = "❌ Error retrieving embeddings";
            console.error('❌ Error retrieving embeddings:', error);
        }
    }

    async function startWebcam() {
        statusText.innerText = "🤖 Loading AI Vision...";
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
                statusText.innerText = "✅ Camera Access Granted";
                detectFace();
            };
        } catch (error) {
            statusText.innerText = "🚫 Camera Access Denied!";
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
                    statusText.innerText = `👤 Face detected (${detectionConfirmed}/3)`;
                    if (detectionConfirmed >= 3) {
                        await captureImage();
                        return;
                    }
                } else if (results.length > 1) {
                    statusText.innerText = "👥 Multiple faces detected";
                    detectionConfirmed = 0;
                } else {
                    statusText.innerText = "😕 Face not detected";
                    detectionConfirmed = 0;
                }
            } catch (error) {
                statusText.innerText = "❌ Face detection error";
                console.error("Face detection error:", error);
            }

            setTimeout(checkForFace, 500);
        }

        checkForFace();
    }

    async function captureImage() {
        isDetecting = false;
    
        if (videoElement.readyState < 2) {
            console.warn("⏳ Video not ready to draw yet.");
            statusText.innerText = "⏳ Waiting for video stream...";
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    
        const targetWidth = 300; // Increased width
        const targetHeight = 150; // Increased height to match the new size
        canvasElement.width = targetWidth;
        canvasElement.height = targetHeight;
    
        //console.log("🎯 Canvas Size:", canvasElement.width, canvasElement.height);
        if (canvasElement.width === 0 || canvasElement.height === 0) {
            console.error("❌ Canvas has zero dimensions!");
            statusText.innerText = "❌ Failed to capture image – video not ready";
            return;
        }
    
        const context = canvasElement.getContext("2d");
        await new Promise(resolve => setTimeout(resolve, 100));
        context.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
    
        const imageData = canvasElement.toDataURL("image/png");
        if (!imageData.startsWith("data:image/png;base64,")) {
            console.error("❌ Invalid base64 format from canvas");
            statusText.innerText = "❌ Error converting image";
            return;
        }
    
        saveImageToSession(imageData);
        beepSound.play().catch(error => console.error("🔈 Error playing beep sound:", error));
        statusText.innerText = "📸 Image captured";
    
        try {
            const storedFaces = getStoredImages();
            const latestImage = storedFaces[storedFaces.length - 1];
            //console.log("🧬 Base64 Image Length:", latestImage.length);
    
            const response = await fetch('/check-user-face-existence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: latestImage, embeddings: storedEmbeddings })
            });
    
            const result = await response.json();
            if (response.ok) {
                statusText.innerText = "✅ Face processed";
                detectFace();
            } else {
                console.error("❌ Face verification failed:", result);
                statusText.innerText = "❌ Face verification failed";
            }
        } catch (error) {
            console.error('❌ Error calling endpoint:', error);
            statusText.innerText = '❌ Error calling endpoint';
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

        statusText.innerText = "🛑 Detection stopped";
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
        statusText.innerText = "📷 Starting camera...";
    });

    // Event listener for stop button
    stopCaptureButton.addEventListener("click", stopCapture);


});

