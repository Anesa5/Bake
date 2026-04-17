import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import upload from "../middleware/upload.js";
import Doctor from "../models/Doctor.js";
import auth from "../middleware/auth.js";
// Add this line with your other imports:
import doctorAuthMiddleware from '../middleware/doctorAuthMiddleware.js';

const router = express.Router();

import dotenv from "dotenv";
dotenv.config();

// ---------- DOCTOR REGISTER ----------
router.post("/register", upload.single("profileImage"), async (req, res) => {
    try {
        const { name, email, password, specialization, qualification, experience, clinics } = req.body;

        // Check if doctor already exists
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) return res.status(400).json({ message: "Email already exists" });

        // Create new doctor
        const doctor = new Doctor({
            name,
            email,
            password,
            specialization,
            qualification,
            experience,
            clinics: clinics ? JSON.parse(clinics) : [],
            profileImage: req.file?.path
        });

        await doctor.save();

        res.status(201).json({ message: "Doctor registered successfully. Waiting for verification." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// ---------- DOCTOR LOGIN ----------
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = await Doctor.findOne({ email });
        if (!doctor) return res.status(400).json({ message: "Invalid credentials" });
        if (!doctor.isVerified) return res.status(403).json({ message: "Doctor not verified yet" });

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: doctor._id, role: "doctor" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, doctor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// ---------- DOCTOR DASHBOARD (PROTECTED) ----------
router.get("/dashboard", auth, async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.user.id).select("-password");
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        res.json(doctor);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
// Add these routes to doctorRoutes.js
router.get('/stats', doctorAuthMiddleware, async (req, res) => {
    try {
        const stats = {
            totalDoctors: await Doctor.countDocuments(),
            activeDoctors: await Doctor.countDocuments({ status: 'active' }),
            // Add other stats you need
        };
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all doctors
router.get('/', doctorAuthMiddleware, async (req, res) => {
    try {
        const doctors = await Doctor.find().select('-password');
        res.json({ success: true, doctors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
