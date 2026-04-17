// routes/doctorDashboard.js - UPDATED WITH PROFILE MANAGEMENT
import express from "express";
import Doctor from "../models/Doctor.js";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/auth.js";
import doctorAuthMiddleware from "../middleware/doctorAuthMiddleware.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// ==================== DOCTOR DASHBOARD ROUTES ====================

// Get doctor's own profile (protected)
router.get("/profile", doctorAuthMiddleware, async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.doctorId)
            .select("-password")
            .populate("category", "name icon color");

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
        console.error("Error fetching doctor profile:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Update doctor's basic information
router.put("/profile/basic", doctorAuthMiddleware, async (req, res) => {
    try {
        const { name, phone, qualification, experience, specialization, bio } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (qualification) updateData.qualification = qualification;
        if (experience) updateData.experience = experience;
        if (specialization) updateData.specialization = specialization;
        if (bio) updateData.bio = bio;

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.doctorId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password").populate("category", "name icon color");

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: updatedDoctor
        });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Update profile picture
router.post("/profile/picture", doctorAuthMiddleware, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image"
            });
        }

        const profileImage = '/uploads/' + req.file.filename;

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.doctorId,
            { $set: { profileImage } },
            { new: true }
        ).select("-password");

        res.json({
            success: true,
            message: "Profile picture updated successfully",
            data: {
                profileImage: updatedDoctor.profileImage
            }
        });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Manage clinics (Add/Update/Delete)
router.post("/clinics", doctorAuthMiddleware, async (req, res) => {
    try {
        const { clinicName, address, consultationFees, timings, daysAvailable, city, state, contactPhone } = req.body;

        const newClinic = {
            clinicName,
            address,
            consultationFees: consultationFees || 0,
            timings: timings || [],
            daysAvailable: daysAvailable || [],
            city: city || "",
            state: state || "",
            contactPhone: contactPhone || ""
        };

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.doctorId,
            { $push: { clinics: newClinic } },
            { new: true }
        ).select("-password");

        res.json({
            success: true,
            message: "Clinic added successfully",
            data: updatedDoctor.clinics
        });
    } catch (error) {
        console.error("Error adding clinic:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Update specific clinic
router.put("/clinics/:clinicId", doctorAuthMiddleware, async (req, res) => {
    try {
        const { clinicId } = req.params;
        const updateData = req.body;

        const doctor = await Doctor.findById(req.doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        // Find and update the clinic
        const clinicIndex = doctor.clinics.findIndex(clinic => clinic._id.toString() === clinicId);
        if (clinicIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Clinic not found"
            });
        }

        // Update clinic data
        doctor.clinics[clinicIndex] = {
            ...doctor.clinics[clinicIndex].toObject(),
            ...updateData,
            _id: doctor.clinics[clinicIndex]._id
        };

        await doctor.save();

        res.json({
            success: true,
            message: "Clinic updated successfully",
            data: doctor.clinics[clinicIndex]
        });
    } catch (error) {
        console.error("Error updating clinic:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Delete clinic
router.delete("/clinics/:clinicId", doctorAuthMiddleware, async (req, res) => {
    try {
        const { clinicId } = req.params;

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.doctorId,
            { $pull: { clinics: { _id: clinicId } } },
            { new: true }
        ).select("-password");

        res.json({
            success: true,
            message: "Clinic deleted successfully",
            data: updatedDoctor.clinics
        });
    } catch (error) {
        console.error("Error deleting clinic:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Manage services
router.post("/services", doctorAuthMiddleware, async (req, res) => {
    try {
        const { services } = req.body;

        if (!Array.isArray(services)) {
            return res.status(400).json({
                success: false,
                message: "Services should be an array"
            });
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.doctorId,
            { $set: { services } },
            { new: true }
        ).select("-password");

        res.json({
            success: true,
            message: "Services updated successfully",
            data: updatedDoctor.services
        });
    } catch (error) {
        console.error("Error updating services:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Manage education
router.post("/education", doctorAuthMiddleware, async (req, res) => {
    try {
        const { education } = req.body;

        if (!Array.isArray(education)) {
            return res.status(400).json({
                success: false,
                message: "Education should be an array"
            });
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.doctorId,
            { $set: { education } },
            { new: true }
        ).select("-password");

        res.json({
            success: true,
            message: "Education updated successfully",
            data: updatedDoctor.education
        });
    } catch (error) {
        console.error("Error updating education:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Manage awards
router.post("/awards", doctorAuthMiddleware, async (req, res) => {
    try {
        const { awards } = req.body;

        if (!Array.isArray(awards)) {
            return res.status(400).json({
                success: false,
                message: "Awards should be an array"
            });
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.doctorId,
            { $set: { awards } },
            { new: true }
        ).select("-password");

        res.json({
            success: true,
            message: "Awards updated successfully",
            data: updatedDoctor.awards
        });
    } catch (error) {
        console.error("Error updating awards:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Manage languages
router.post("/languages", doctorAuthMiddleware, async (req, res) => {
    try {
        const { languages } = req.body;

        if (!Array.isArray(languages)) {
            return res.status(400).json({
                success: false,
                message: "Languages should be an array"
            });
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.doctorId,
            { $set: { languages } },
            { new: true }
        ).select("-password");

        res.json({
            success: true,
            message: "Languages updated successfully",
            data: updatedDoctor.languages
        });
    } catch (error) {
        console.error("Error updating languages:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Get doctor's appointments (for dashboard)
router.get("/appointments", doctorAuthMiddleware, async (req, res) => {
    try {
        // You'll need to populate this with your Appointment model
        const appointments = []; // Fetch appointments for this doctor

        res.json({
            success: true,
            data: appointments,
            message: "Appointments fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Update availability status
router.put("/availability", doctorAuthMiddleware, async (req, res) => {
    try {
        const { isAvailable } = req.body;

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            req.doctorId,
            { $set: { isAvailable } },
            { new: true }
        ).select("-password");

        res.json({
            success: true,
            message: `You are now ${isAvailable ? 'available' : 'unavailable'} for appointments`,
            data: { isAvailable: updatedDoctor.isAvailable }
        });
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

export default router;