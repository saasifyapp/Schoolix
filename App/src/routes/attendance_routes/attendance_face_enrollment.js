const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


router.post('/send-face-data-to-enroll', async (req, res) => {
    try {
        const images = req.body.images; // Receive the 5 base64 images from frontend

        console.log('Step 1 - Received from UI:', images.length, 'images');

        // Debugging: Log first few characters of one base64 string
        console.log("Sample base64 from UI:", images[0]?.substring(0, 50));

        // Send the images to FastAPI for gender detection
        const response = await fetch('http://localhost:8000/detect-gender', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images })
        });

        if (!response.ok) {
            throw new Error(`FastAPI Error: ${response.statusText}`);
        }

        // Receive gender detection results from FastAPI
        const result = await response.json();
        console.log('Step 3 - Gender results:', result.genders);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error calling FastAPI:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;