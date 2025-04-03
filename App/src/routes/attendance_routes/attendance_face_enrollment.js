const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


router.post('/send-face-data-to-enroll', async (req, res) => {
    try {
        const { category, name, grId, section, standard, ...imageData } = req.body;

        // Convert image fields into an array
        const images = Object.values(imageData).filter(img => img !== "");

        if (images.length === 0) {
            return res.status(400).json({ error: "No valid images provided." });
        }

        //console.log("🔄 Sending images for embedding...");

        // Step 1: Send images to FastAPI for embedding extraction
        const response = await fetch('http://localhost:8000/extract-embedding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images })
        });

        if (!response.ok) {
            throw new Error("Failed to communicate with FastAPI for embedding extraction.");
        }

        //console.log("🔄 Embedding images...");
        const result = await response.json();
        const embeddingsArray = result.embeddings;

        if (!embeddingsArray || embeddingsArray.length === 0) {
            return res.status(400).json({ error: 'No valid embeddings found' });
        }

        //console.log("✅ Embedding completed, storing face details...");

        // Convert embeddings array to a string format for SQL storage
        const embeddingsString = JSON.stringify(embeddingsArray);

        // Step 2: Insert into database
        const insertQuery = `
            INSERT INTO attendance_user_info (user_id, name, section, standard_division, image_decode)
            VALUES (?, ?, ?, ?, ?)
        `;

        req.connectionPool.query(
            insertQuery, 
            [grId, name, section, standard, embeddingsString],
            (error, results) => {
                if (error) {
                    console.error('❌ Database insertion failed:', error);
                    return res.status(500).json({ error: 'Database insertion failed' });
                }

                //console.log(`✅ Face enrolled successfully for GR No: ${grId}, Student: ${name}, Standard: ${standard}`);
                res.status(201).json({ 
                    message: 'Face enrolled successfully!', 
                    grId, name, standard
                });
            }
        );

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});



module.exports = router;