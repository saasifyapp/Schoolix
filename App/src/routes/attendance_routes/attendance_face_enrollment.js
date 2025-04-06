const express = require('express');
const router = express.Router();

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);


router.post('/send-face-data-to-enroll', async (req, res) => {
    try {
        const { category, name, grId, section, standard, ...imageData } = req.body;

        const images = Object.values(imageData).filter(img => img !== "");

        if (images.length === 0) {
            console.error("⚠️ No valid images provided.");
            return res.status(400).json({ error: "No valid images provided." });
        }

        console.log("📤 Sending images to FastAPI for embedding extraction...");

        const fetchUrl = 'https://ominous-succotash-pj7577gjvjx7hrjq5-8000.app.github.dev/extract-embedding';
        let response;

        try {
            response = await fetch(fetchUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images })
            });
        } catch (fetchError) {
            console.error("❌ Fetch failed:", fetchError.message);
            console.error("🔍 Full fetch error:", fetchError);
            return res.status(500).json({ error: 'Failed to communicate with FastAPI server', details: fetchError.message });
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ FastAPI responded with error:", errorText);
            return res.status(502).json({ error: 'Bad response from FastAPI', details: errorText });
        }

        const result = await response.json();
        const embeddingsArray = result.embeddings;

        if (!embeddingsArray || embeddingsArray.length === 0) {
            console.warn("⚠️ No valid embeddings returned from FastAPI.");
            return res.status(400).json({ error: 'No valid embeddings found' });
        }

        const embeddingsString = JSON.stringify(embeddingsArray);

        const insertQuery = `
            INSERT INTO attendance_user_info (user_id, name, section, standard_division, image_decode)
            VALUES (?, ?, ?, ?, ?)
        `;

        console.log("💾 Inserting face data into database...");

        req.connectionPool.query(
            insertQuery,
            [grId, name, section, standard, embeddingsString],
            (error, results) => {
                if (error) {
                    console.error('❌ Database insertion failed:', error);
                    return res.status(500).json({ error: 'Database insertion failed' });
                }

                console.log(`✅ Face enrolled for GR No: ${grId}, Name: ${name}`);
                res.status(201).json({
                    message: 'Face enrolled successfully!',
                    grId, name, standard
                });
            }
        );

    } catch (error) {
        console.error('❌ Unhandled error:', error.message);
        if (error.cause) console.error('🔍 Cause:', error.cause);
        console.error('🧠 Stack Trace:', error.stack);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


router.get('/get-manage-enrollments', async (req, res) => {
    try {
        const query = `
            SELECT 
                face_record_id, 
                user_id, 
                name, 
                section, 
                standard_division
            FROM attendance_user_info
        `;

        req.connectionPool.query(query, [], (err, results) => {
            if (err) {
                console.error('[DB ERROR]:', err.message);
                return res.status(500).json({
                    message: '❌ Database query failed while fetching enrollments.',
                    error: err.message
                });
            }

            if (!results.length) {
                return res.status(200).json({ message: 'ℹ️ No enrollments found.', data: [] });
            }

            res.status(200).json({
                message: '✅ Enrollments fetched successfully.',
                data: results
            });
        });
    } catch (error) {
        console.error('[SERVER ERROR]:', error.message);
        res.status(500).json({
            message: '🚨 Internal server error.',
            error: error.message
        });
    }
});

router.delete('/delete-enrollment/:id', async (req, res) => {
    const faceRecordId = req.params.id;
  
    try {
      const query = `DELETE FROM attendance_user_info WHERE face_record_id = ?`;
  
      req.connectionPool.query(query, [faceRecordId], (err, result) => {
        if (err) {
          console.error('[DB DELETE ERROR]:', err.message);
          return res.status(500).json({
            message: '❌ Database error while deleting record.',
            error: err.message
          });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: `⚠️ No record found with ID ${faceRecordId}.`
          });
        }
  
        res.status(200).json({
          message: `✅ Record with ID ${faceRecordId} deleted successfully.`
        });
      });
  
    } catch (error) {
      console.error('[SERVER DELETE ERROR]:', error.message);
      res.status(500).json({
        message: '🚨 Internal server error during deletion.',
        error: error.message
      });
    }
  });
  

module.exports = router;