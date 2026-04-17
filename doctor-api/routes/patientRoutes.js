import express from 'express';
import Patient from '../models/Patient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ======================
// TEST ROUTE - PEHLE YEH TEST KARO
// ======================
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Patient routes are working!',
        endpoints: ['POST /register', 'POST /login', 'GET /profile/:id']
    });
});

// ======================
// PATIENT REGISTRATION
// ======================
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Patient registration received:', req.body);

        const { fullName, email, password } = req.body;

        // Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email and password are required'
            });
        }

        // Check if patient already exists
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(400).json({
                success: false,
                message: 'Patient already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create patient
        const patient = await Patient.create({
            fullName,
            email,
            password: hashedPassword
        });

        // Generate JWT
        const token = jwt.sign(
            { id: patient._id, role: 'patient' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Remove password from response
        const patientResponse = patient.toObject();
        delete patientResponse.password;

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            token,
            patient: patientResponse
        });

    } catch (error) {
        console.error('❌ Patient registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// ======================
// PATIENT LOGIN
// ======================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find patient
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: patient._id, role: 'patient' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Remove password from response
        const patientResponse = patient.toObject();
        delete patientResponse.password;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            patient: patientResponse
        });

    } catch (error) {
        console.error('❌ Patient login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// ======================
// GET PATIENT PROFILE
// ======================
router.get('/profile/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).select('-password');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        res.json({
            success: true,
            patient
        });

    } catch (error) {
        console.error('❌ Error fetching patient:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;