const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

router.post('/check-user-face-existence', async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'No image provided.' });
    }

    const base64Data = image;

    // Log first 50 characters of the base64 data
    console.log(`Received image base64 data: ${base64Data.substring(0, 50)}`);
    
    try {
        // Send the image to the FastAPI server for embedding extraction
        const response = await fetch('https://ominous-succotash-pj7577gjvjx7hrjq5-8000.app.github.dev/embedd-live-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Data })
        });

        if (!response.ok) {
            throw new Error("Failed to communicate with FastAPI for embedding extraction.");
        }

        const result = await response.json();
        
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        const embedding = result.embedding;
        console.log("Embedding received from FastAPI server:", embedding);

        return res.status(200).json({ embedding });

    } catch (error) {
        console.error('Error calling FastAPI server:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;