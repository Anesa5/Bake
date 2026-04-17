// routes/authRoutes.js
import express from "express";
import Doctor from "../models/Doctor.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import upload from "../middleware/upload.js";
import Category from '../models/Category.js';

const router = express.Router();

// ========================
// DOCTOR REGISTRATION
// ========================
router.post("/register-doctor", upload.single("profileImage"), async (req, res) => {
    try {
        console.log("📥 Registration received:", req.body);
        console.log("📦 Services received:", req.body.services); // ✅ Debug

        // Parse services if they come as string
        let services = [];
        if (req.body.services) {
            try {
                services = typeof req.body.services === 'string'
                    ? JSON.parse(req.body.services)
                    : req.body.services;
                console.log("✅ Parsed services:", services);
            } catch (e) {
                console.error("❌ Services parse error:", e);
                services = [];
            }
        }

        const {
            fullName,
            email,
            password,
            categoryName,
            qualification,
            experience,
            phone,
            clinicAddress
        } = req.body;

        const profileImage = req.file ? `/uploads/doctors/${req.file.filename}` : null;

        // Validation
        if (!fullName || !email || !password || !categoryName) {
            return res.status(400).json({
                message: "Full name, email, password and category are required"
            });
        }

        // Find category by name to get its ID
        const category = await Category.findOne({ name: categoryName });

        if (!category) {
            return res.status(400).json({
                message: "Invalid category selected"
            });
        }

        // Check if email already exists
        const existing = await Doctor.findOne({ email });
        if (existing) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create doctor WITH SERVICES FIELD
        const doctor = new Doctor({
            name: fullName,
            email,
            password: hashedPassword,
            specialization: categoryName,
            category: category._id,
            qualification: qualification || "",
            experience: experience || "",
            phone: phone || "",
            clinicAddress: clinicAddress || "",
            profileImage,
            services: services,  // ✅ YEH LINE ADD KARO - SERVICES INCLUDE
            isVerified: false
        });

        await doctor.save();
        console.log("✅ Doctor saved with services:", doctor.services);

        // Remove password from response
        const doctorResponse = doctor.toObject();
        delete doctorResponse.password;

        // Generate JWT
        const token = jwt.sign(
            { id: doctor._id, role: "doctor" },
            process.env.JWT_SECRET || "default_secret_change_this",
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Doctor registered successfully!",
            success: true,
            token,
            doctor: doctorResponse
        });

    } catch (err) {
        console.error("❌ Registration error:", err);
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
});

// ========================
// DOCTOR LOGIN
// ========================
router.post("/login", async (req, res) => {
    try {
        console.log("Login attempt:", req.body);
        const { email, password } = req.body;

        // Find doctor
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Remove password from response
        const doctorResponse = doctor.toObject();
        delete doctorResponse.password;

        // Create token
        const token = jwt.sign(
            { id: doctor._id, role: "doctor" },
            process.env.JWT_SECRET || "test_secret",
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            doctor: doctorResponse
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// ========================
// GET DOCTOR PROFILE
// ========================
router.get("/profile/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .select('-password')
            .populate('category', 'name description');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error("❌ Get profile error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================
// TEST ROUTE
// ========================
router.get("/test", (req, res) => {
    res.json({
        message: "Auth routes are working!",
        endpoints: ["POST /login", "POST /register-doctor", "GET /profile/:id"]
    });
});

export default router;