const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);

////////////////////////////////////////////////////////////////////////

// Endpoint to retrive stored embeddings when model is loading //

// Fetches and sends it to FASTAPI server to store //

router.post('/retrieve-stored-embeddings', async (req, res) => {
    try {
        // Retrieve stored embeddings from the database
        const selectQuery = `
            SELECT user_id, name, section, standard_division, image_decode
            FROM attendance_user_info
        `;

        req.connectionPool.query(selectQuery, [], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Database query failed' });
            }

            const storedEmbeddings = results.map(row => {
                let embeddings;
                try {
                    embeddings = JSON.parse(row.image_decode);
                } catch (e) {
                    embeddings = [];
                }

                return {
                    user_id: row.user_id,
                    name: row.name,
                    section: row.section,
                    standard_division: row.standard_division,
                    embedding: embeddings
                };
            });

            // Send stored embeddings to FastAPI server
            fetch('https://ominous-succotash-pj7577gjvjx7hrjq5-8000.app.github.dev/store-retrieve-embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storedEmbeddings)
            })
            .then(response => response.json())
            .then(data => {
                // Perform consistency check
                const isConsistent = JSON.stringify(storedEmbeddings) === JSON.stringify(data.data);
                
                res.status(200).json({
                    message: isConsistent ? "Consistency check passed" : "Consistency check failed",
                    result: isConsistent,
                    count: data.count,
                });
            })
            .catch(error => {
                res.status(500).json({ error: 'Internal Server Error', details: error.message });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

///////////////////////////////////////////////////////////////////////////////

///////////////////////// Endpoint to embedd live feed from webcam ////////////////


router.post("/check-user-face-existence", async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'No image provided.' });
    }

    const base64Data = image;

    try {
        // Send the image to the FastAPI server for embedding extraction and comparison
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
            console.log('No match found or embedding failed.');
            return res.status(400).json({ error: result.error });
        }

        console.log('Matches found:', result.matches);

        // Insert data into the attendance_user_logs table
        const { user_id, name, section, standard_division, confidence, live_face_embedding } = result.matches[0]; // Assuming we only have one match
        const in_time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // Current time in HH:MM format

        // Convert the embedding to a string format to store in the database
        const embeddingString = JSON.stringify(live_face_embedding);

        const insertQuery = `
            INSERT INTO attendance_user_logs (user_id, name, section, standard_division, date_of_attendance, in_time, out_time, image_decode, confidence)
            VALUES (?, ?, ?, ?, CURDATE(), ?, NULL, ?, ?)
        `;

        // Using the connection pool from req.connectionPool
        req.connectionPool.query(insertQuery, [user_id, name, section, standard_division, in_time, embeddingString, confidence], (error, results) => {
            if (error) {
                console.error("Error inserting data into the database:", error.message);
                return res.status(500).json({ error: "Database Insertion Error", details: error.message });
            }

            console.log("Data inserted successfully into attendance_user_logs.");
            return res.status(200).json(result);
        });
    } catch (error) {
        console.error('Error calling FastAPI server:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


module.exports = router;