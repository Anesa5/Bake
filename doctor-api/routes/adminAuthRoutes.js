// routes/adminAuthRoutes.js
import express from 'express';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
    try {
        console.log("=== Admin Login Attempt ===");
        console.log("Email:", req.body.email);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find admin
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log("Admin not found for email:", email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            console.log("Password mismatch for admin:", email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        admin.lastLogin = Date.now();
        await admin.save();

        // Create token
        const token = jwt.sign(
            {
                id: admin._id,
                role: 'admin'  // MUST be 'admin' (not 'superadmin')
            },
            process.env.JWT_SECRET,  // Use the SAME JWT_SECRET from .env
            { expiresIn: '24h' }
        );

        console.log("Login successful for:", email);
        console.log("Token generated:", token.substring(0, 20) + "...");

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create First Super Admin (One-time setup)
router.post('/setup', async (req, res) => {
    try {
        // Check if any admin exists
        const adminExists = await Admin.findOne();
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists'
            });
        }

        const { name, email, password } = req.body;

        // Validate
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Create super admin
        const admin = new Admin({
            name,
            email,
            password,
            role: 'superadmin'
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: 'Super admin created successfully'
        });

    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get admin profile
router.get('/profile', adminAuthMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId).select('-password');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            data: admin
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Create new admin (superadmin only)
router.post('/create-admin', adminAuthMiddleware, async (req, res) => {
    try {
        console.log("=== Create Admin Attempt ===");
        console.log("Requester adminId:", req.adminId);
        console.log("Request body:", req.body);

        // Get current admin from database
        const currentAdmin = await Admin.findById(req.adminId);

        if (!currentAdmin) {
            console.log("Current admin not found for ID:", req.adminId);
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        console.log("Current admin role:", currentAdmin.role);

        // Check if current admin is superadmin
        if (currentAdmin.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Only superadmin can create new admins'
            });
        }

        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Check if email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create new admin
        const admin = new Admin({
            name,
            email,
            password,
            role: role || 'admin'
        });

        await admin.save();

        console.log("New admin created:", email);

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;
