const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginPatient = async (req, res) => {
    try {
        const { email, password } = req.body;

        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, patient.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: patient._id, role: "patient" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            patient,
        });
    } catch (error) {
        console.error("Patient login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
