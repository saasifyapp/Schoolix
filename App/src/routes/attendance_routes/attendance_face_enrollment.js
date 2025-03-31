const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


router.post('/send-face-data-to-enroll', async (req, res) => {
    try {
        const response = await fetch('http://localhost:8000/extract-embedding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: req.body.images })
        });

        const result = await response.json();
        //console.log('📤 Step 3 - Received embeddings:', JSON.stringify(result, null, 2));

        // Create an array to hold the embeddings
        const embeddingsArray = result.embeddings;

        // Calculate number of non-null embeddings (objects) in the array
        const validEmbeddings = embeddingsArray.filter(embedding => embedding !== null);
        const count = validEmbeddings.length;

        // Check if the array is holding embeddings
        if (count > 0) {
            console.log(`✅ Array created successfully! It holds ${count} embeddings for images:`, validEmbeddings);
        } else {
            console.log('❌ No valid embeddings found.');
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Error calling FastAPI:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;