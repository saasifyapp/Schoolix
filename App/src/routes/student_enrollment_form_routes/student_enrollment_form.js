const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path

// Use the connection manager middleware
router.use(connectionManager);



// GET Endpoint to fetch unique castes from combined tables
router.get('/getUniqueCastes', (req, res) => {
    const query = `
        SELECT Caste 
        FROM primary_student_details
        UNION
        SELECT Caste 
        FROM pre_primary_student_details;
    `;

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching unique castes:', error);
            return res.status(500).json({ error: 'Error fetching unique castes' });
        }
        res.status(200).json(results);
    });
});


// Endpoint to fetch sections from both tables
router.get('/getSections', (req, res) => {
    const queryPrimary = `SELECT DISTINCT Section FROM primary_student_details`;
    const queryPrePrimary = `SELECT DISTINCT Section FROM pre_primary_student_details`;

    Promise.all([
        new Promise((resolve, reject) => {
            req.connectionPool.query(queryPrimary, (error, results) => {
                if (error) return reject(error);
                resolve(results.map(result => result.Section));
            });
        }),
        new Promise((resolve, reject) => {
            req.connectionPool.query(queryPrePrimary, (error, results) => {
                if (error) return reject(error);
                resolve(results.map(result => result.Section));
            });
        })
    ])
    .then(([primarySections, prePrimarySections]) => {
        const sections = [...new Set([...primarySections, ...prePrimarySections])]; // Combine and remove duplicates
        res.status(200).json({ sections });
    })
    .catch(error => {
        console.error('Error fetching sections:', error);
        res.status(500).json({ error: 'Error fetching sections' });
    });
});


// New endpoint to fetch the next GR Number based on section
router.get('/getNextGrno', (req, res) => {
    const { section } = req.query; // Get the section parameter from query string
   // console.log(`Received section: ${section}`); // For testing, just log the section value

    // Map section values to corresponding table names
    const tableMap = {
        "primary": "primary_student_details",
        "pre primary": "pre_primary_student_details"
    };

    const normalizedSection = section ? section.toLowerCase().replace("-", " ") : "";
    const tableName = tableMap[normalizedSection];

    if (!tableName) {
        return res.status(400).json({ error: 'Invalid section value' });
    }

    const query = `SELECT MAX(Grno) AS maxGrno FROM ${tableName}`;

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching GR Number:', error);
            return res.status(500).json({ error: 'Error fetching GR Number' });
        }
        const maxGrno = results[0].maxGrno || 0; // If no records, start from 0
        const nextGrno = maxGrno + 1;
        res.status(200).json({ nextGrno, section });
    });
});



// New endpoint to fetch standards based on section
router.get('/getStandards', (req, res) => {
    const { section } = req.query;
    const tableMap = {
        "primary": "primary_student_details",
        "pre primary": "pre_primary_student_details"
    };

    const normalizedSection = section ? section.toLowerCase().replace("-", " ") : "";
    const tableName = tableMap[normalizedSection];

    if (!tableName) {
        return res.status(400).json({ error: 'Invalid section value' });
    }

    const query = `SELECT DISTINCT Standard FROM ${tableName}`;

    req.connectionPool.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching Standards:', error);
            return res.status(500).json({ error: 'Error fetching Standards' });
        }
        if (!results) {
            return res.status(400).json({ error: 'No results found' });
        }

        const standards = results
            .map(result => result.Standard)
            // Sorting standards based on custom logic. We'll sort them in ascending order.
            .sort((a, b) => {
                const order = ["pre-primary", "nursery", "kg", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
                return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase());
            });

        res.status(200).json({ standards });
    });
});


// New endpoint to fetch divisions based on section and standard
router.get('/getDivisions', (req, res) => {
    const { section, standard } = req.query;
    const tableMap = {
        "primary": "primary_student_details",
        "pre primary": "pre_primary_student_details"
    };

    const normalizedSection = section ? section.toLowerCase().replace("-", " ") : "";
    const tableName = tableMap[normalizedSection];

    if (!tableName) {
        return res.status(400).json({ error: 'Invalid section value' });
    }

    if (!standard) {
        return res.status(400).json({ error: 'Standard is required' });
    }

    const query = `
        SELECT DISTINCT Division 
        FROM ${tableName}
        WHERE Standard = ?
    `;

    req.connectionPool.query(query, [standard], (error, results) => {
        if (error) {
            console.error('Error fetching Divisions:', error);
            return res.status(500).json({ error: 'Error fetching Divisions' });
        }
        const divisions = results.map(result => result.Division);
        res.status(200).json({ divisions });
    });
});


// New endpoint to fetch Fee Categories based on Standard (class grade)
router.get('/getFeeCategory', (req, res) => {
    const { standard } = req.query; // Get the standard parameter from the query string

    if (!standard) {
        return res.status(400).json({ error: 'Standard is required' });
    }

    const query = `SELECT category_name FROM fee_structures WHERE class_grade = ?`;

    req.connectionPool.query(query, [standard], (error, results) => {
        if (error) {
            console.error('Error fetching fee categories:', error);
            return res.status(500).json({ error: 'Error fetching fee categories' });
        }

        const categories = results.map(result => result.category_name);
        res.status(200).json({ categories });
    });
});


// New endpoint to fetch amount based on category_name and class_grade
router.get('/getAmount', (req, res) => {
    const { category_name, class_grade } = req.query; // Get the category_name and class_grade parameters from the query string

    if (!category_name || !class_grade) {
        return res.status(400).json({ error: 'category_name and class_grade are required' });
    }

    const query = `SELECT amount FROM fee_structures WHERE category_name = ? AND class_grade = ?`;

    req.connectionPool.query(query, [category_name, class_grade], (error, results) => {
        if (error) {
            console.error('Error fetching amount:', error);
            return res.status(500).json({ error: 'Error fetching amount' });
        }

        if (results.length > 0) {
            res.status(200).json({ amount: results[0].amount });
        } else {
            res.status(404).json({ error: 'No matching record found' });
        }
    });
});

module.exports = router;