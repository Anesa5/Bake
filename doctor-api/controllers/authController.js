const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token - FIXED WITH FALLBACK
const generateToken = (id, role) => {
    const secret = process.env.JWT_SECRET || 'doctor_api_default_secret_key_for_development';
    return jwt.sign({ id, role }, secret, {
        expiresIn: '30d'
    });
};

// Register User (Admin)
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'user'
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};












































// Get Current User
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};