const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


// Endpoint to receive form data and images
router.post('/send-face-data-to-enroll', async (req, res) => {
    const { images } = req.body;

    // Log the number of images received to the console
    console.log('Number of Images:', images.length);

    // Send images to Python backend for embedding
    try {
        const response = await fetch('http://python-backend-address:5000/enroll-embeed', { // Replace with your Python backend address and port
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ images })
        });

        if (!response.ok) {
            throw new Error(`An error occurred: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Embedding process completed successfully:', result);

        // Send response back to client
        res.status(200).json(result);
    } catch (error) {
        console.error('Error during embedding process:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;