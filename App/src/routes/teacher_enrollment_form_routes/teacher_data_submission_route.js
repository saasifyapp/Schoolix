const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const connectionManager = require('../../middleware/connectionManager'); // Adjust relative path
const { connection_auth } = require('../../../main_server'); // Adjust the path as needed

// Use the connection manager middleware
router.use(connectionManager);

// Insert new teacher 
router.post('/submitTeacherForm', (req, res) => {
    const data = req.body;
    console.log(data)
    // Validate required fields
    const requiredFields = [
        'name', 'first_name', 'last_name', 'designation', 'gender', 'date_of_birth', 'date_of_joining',
        'mobile_no', 'address_city', 'teacher_uid_no', 'department', 'qualification', 'experience'
    ];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
    if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const query = `
        INSERT INTO teacher_details (
            name, first_name, last_name, designation, gender, date_of_birth, date_of_joining, mobile_no, address_city, 
            teacher_uid_no, department, qualification, experience, subjects_taught, salary, transport_needed, 
            transport_tagged, transport_pickup_drop, classes_alloted, is_active, subject_class_mapping, 
            previous_employment_details, guardian_name, guardian_contact, relation_with_guardian, guardian_address, 
            teacher_landmark, teacher_pincode, app_uid, category, taluka, district, state, teacher_caste, 
            teacher_category, teacher_religion, teacher_nationality
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        data.name || null,
        data.first_name || null,
        data.last_name || null,
        data.designation || null,
        data.gender || null,
        data.date_of_birth || null,
        data.date_of_joining || null,
        data.mobile_no || null,
        data.address_city || null,
        data.teacher_uid_no || null,
        data.department || null,
        data.qualification || null,
        data.experience || null,
        data.subjects_taught || null,
        data.salary || null,
        data.transport_needed || 0,
        data.transport_tagged || null,
        data.transport_pickup_drop || null,
        data.classes_alloted || null,
        data.is_active || '1',
        data.subject_class_mapping || '[]',
        data.previous_employment_details || null,
        data.guardian_name || null,
        data.guardian_contact || null,
        data.relation_with_guardian || null,
        data.guardian_address || null,
        data.teacher_landmark || null,
        data.teacher_pincode || null,
        data.app_uid || null,
        data.category || null,
        data.taluka || null,
        data.district || null,
        data.state || null,
        data.teacher_caste || null,
        data.teacher_category || null,
        data.teacher_religion || null,
        data.teacher_nationality || null
    ];

    req.connectionPool.query(query, values, (error, result) => {
        if (error) {
            console.error('Insert error:', error);
            return res.status(500).json({ error: 'Failed to insert teacher data' });
        }
        res.json({ success: true, id: result.insertId });
    });
});

module.exports = router;