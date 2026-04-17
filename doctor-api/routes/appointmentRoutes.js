import express from "express";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();

// Create appointment
router.post("/", async (req, res) => {
    try {
        const { doctorId, patientId, clinicId, date, time } = req.body;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: "Doctor not found" });

        const appointment = await Appointment.create({
            doctor: doctorId,
            patient: patientId,
            clinic: clinicId,
            date,
            time,
        });

        res.json({ message: "Appointment booked", appointment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
