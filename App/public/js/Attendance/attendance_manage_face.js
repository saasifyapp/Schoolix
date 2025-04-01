document.addEventListener("DOMContentLoaded", function () {
    const captureButton = document.getElementById("captureImageBtn");
    const previewOverlay = document.getElementById("previewOverlay");
    const videoElement = document.getElementById("videoPreview");
    const canvasElement = document.getElementById("capturedCanvas");
    const faceDetectedMsg = document.getElementById("faceDetectedMsg");

    let stream = null;
    let isDetecting = false;
    let detectionConfirmed = 0;
    let modelLoaded = false;

    async function loadFaceModel() {
        if (modelLoaded) return;
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri("https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights");
            modelLoaded = true;
            console.log("✅ Face AI Model Loaded Successfully!");
        } catch (error) {
            console.error("❌ Error Loading Face Model:", error);
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

        // Reset UI elements before restarting
        previewOverlay.style.display = "none";
        videoElement.style.display = "block";
        canvasElement.style.display = "none";
        faceDetectedMsg.innerText = "";
        videoElement.width = 640; // Reset size
        videoElement.height = 480;

        try {
            await loadFaceModel();

            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }

            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (!stream) throw new Error("Webcam access denied or unavailable.");

            videoElement.srcObject = stream;

            videoElement.onloadedmetadata = () => {
                Swal.close(); // Close loading screen only when everything is ready

                setTimeout(() => {
                    previewOverlay.style.display = "flex"; // Show preview after a small delay
                    faceDetectedMsg.innerText = "🔍 Detecting face...";
                    detectFace();
                }, 300); // Allow time for reinitialization
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
                const result = await faceapi.detectSingleFace(videoElement, options);

                if (result) {
                    detectionConfirmed++;
                    if (detectionConfirmed >= 3) {
                        faceDetectedMsg.innerText = "✅ Face Detected! Capturing...";
                        captureImage();
                        return;
                    } else {
                        faceDetectedMsg.innerText = `🔍 Face Detected... Hold Still (${detectionConfirmed}/3)`;
                    }
                } else {
                    detectionConfirmed = 0;
                    faceDetectedMsg.innerText = "❌ No Face Detected...";
                }
            } catch (error) {
                console.error("Face detection error:", error);
            }

            setTimeout(checkForFace, 500);
        }

        checkForFace();
    }

    function captureImage() {
        isDetecting = false;

        const context = canvasElement.getContext("2d");
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

        const imageData = canvasElement.toDataURL("image/png");
        saveImageToSession(imageData);

        const storedImages = getStoredImages();
        faceDetectedMsg.innerText = `📸 Captured (${storedImages.length}/5)`;

        console.log("Stored Images:");
        storedImages.forEach((img, index) => console.log(`Image ${index + 1}: ${img.substring(0, 25)}`));

        if (storedImages.length < 5) {
            setTimeout(detectFace, 1000);
        } else {
            stopWebcam();
            previewOverlay.style.display = "none";
            console.log("✅ 5 images captured. Preview closed.");
        }
    }

    function saveImageToSession(base64Image) {
        let storedFaces = getStoredImages();
        if (storedFaces.length >= 5) storedFaces.shift();
        storedFaces.push(base64Image);
        sessionStorage.setItem("liveUserFaces", JSON.stringify(storedFaces));
    }

    function getStoredImages() {
        return JSON.parse(sessionStorage.getItem("liveUserFaces")) || [];
    }

    function stopWebcam() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        videoElement.style.display = "none";
        canvasElement.style.display = "block";
    }

    captureButton.addEventListener("click", startWebcam);
});
