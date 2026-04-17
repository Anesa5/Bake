// test-server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!', timestamp: new Date() });
});

// Specializations endpoint
app.get('/api/specializations', (req, res) => {
    const specializations = [
        'Dermatologist', 'Gynecologist', 'Urologist', 'Gastroenterologist',
        'Dentist', 'Obesity Specialist', 'ENT Specialist', 'Orthopedic Surgeon',
        'Neurologist', 'Child Specialist', 'Eye Specialist', 'General Physician'
    ];

    const data = specializations.map((name, index) => ({
        _id: `spec-${index + 1}`,
        name,
        description: `${name} - Medical specialist for related conditions`,
        totalDoctors: Math.floor(Math.random() * 15) + 3,
        averageRating: (Math.random() * 1.5 + 3.5).toFixed(1),
        doctors: [],
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    res.json({
        success: true,
        count: data.length,
        data: data
    });
});

// Individual specialization
app.get('/api/specializations/:name', (req, res) => {
    const name = req.params.name;
    const spec = {
        _id: 'spec-1',
        name: name,
        description: `${name} - Detailed description would be here`,
        totalDoctors: 12,
        averageRating: 4.5,
        doctors: [
            { _id: 'doc-1', name: `Dr. ${name} Expert`, rating: 4.7 },
            { _id: 'doc-2', name: `Dr. ${name} Specialist`, rating: 4.3 }
        ]
    };

    res.json({ success: true, data: spec });
});
// Add this route to test-server.js
app.get('/api/doctors', (req, res) => {
    const doctors = [
        {
            _id: 'doc-1',
            name: 'Dr. Sarah Johnson',
            specialization: 'Dermatologist',
            experience: 10,
            qualification: 'MBBS, MD',
            location: 'Medical Center, City',
            consultationFee: 800,
            phone: '9876543210'
        }
    ];

    res.json({
        success: true,
        count: doctors.length,
        doctors: doctors
    });
});

// Publish doctor
app.post('/api/specializations/publish/:doctorId', (req, res) => {
    res.json({
        success: true,
        message: `Doctor ${req.params.doctorId} published successfully`,
        data: {
            doctorId: req.params.doctorId,
            status: 'published',
            publishedAt: new Date()
        }
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        availableRoutes: [
            'GET /api/test',
            'GET /api/specializations',
            'GET /api/specializations/:name',
            'POST /api/specializations/publish/:doctorId'
        ]
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
    console.log(`🔗 Test: http://localhost:${PORT}/api/test`);
    console.log(`🔗 Specializations: http://localhost:${PORT}/api/specializations`);
});