import express from "express";
import Doctor from "../models/Doctor.js";

const router = express.Router();

// GET /api/doctors?specialization=cardiologist
router.get("/", async (req, res) => {
    const filter = {
        isVerified: true
    };

    if (req.query.specialization) {
        filter.specialization = req.query.specialization;
    }

    const doctors = await Doctor.find(filter)
        .select("-password");

    res.json(doctors);
});

export default router;
