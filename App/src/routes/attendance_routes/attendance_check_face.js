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

    // Extract base64 data and decode to buffer
    const base64Data = image.replace(/^data:image\/png;base64,/, ""); // Remove the prefix
    const imageBuffer = Buffer.from(base64Data, 'base64'); // Convert to binary buffer

    //console.log("🧪 Decoded Image Buffer Length:", imageBuffer.length); // Add this


    try {
        const response = await fetch('https://ominous-succotash-pj7577gjvjx7hrjq5-8000.app.github.dev/embedd-live-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: image }) // Send the original base64 string to FastAPI
        });

        if (!response.ok) {
            throw new Error("Failed to communicate with FastAPI for embedding extraction.");
        }

        const result = await response.json();

        const formatDate = () => {
            const date = new Date();
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        const date_of_attendance = formatDate();
        const in_time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        if (result.error) {
            // No match found (visitor)
            const user_id = 'Unavailable';
            const name = 'Unavailable';
            const section = 'Visitor';
            const standard_division = 'Unavailable';
            const confidence = result.confidence || 'Unavailable';

            const insertQuery = `
                INSERT INTO attendance_user_logs 
                    (user_id, name, section, standard_division, date_of_attendance, in_time, out_time, image_decode, confidence)
                VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)
            `;

            req.connectionPool.query(
                insertQuery,
                [user_id, name, section, standard_division, date_of_attendance, in_time, imageBuffer, confidence],
                (error, results) => {
                    if (error) {
                        console.error("Error inserting data into the database:", error.message);
                        return res.status(500).json({ error: "Database Insertion Error", details: error.message });
                    }
                    return res.status(200).json({ message: 'No match found, visitor logged.' });
                }
            );
        } else {
            // Match found
            const { user_id, name, section, standard_division, confidence } = result.matches[0];

            const insertQuery = `
                INSERT INTO attendance_user_logs 
                    (user_id, name, section, standard_division, date_of_attendance, in_time, out_time, image_decode, confidence)
                VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)
            `;

            req.connectionPool.query(
                insertQuery,
                [user_id, name, section, standard_division, date_of_attendance, in_time, imageBuffer, confidence],
                (error, results) => {
                    if (error) {
                        console.error("Error inserting data into the database:", error.message);
                        return res.status(500).json({ error: "Database Insertion Error", details: error.message });
                    }
                    return res.status(200).json(result);
                }
            );
        }
    } catch (error) {
        console.error('Error calling FastAPI server:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});




module.exports = router;