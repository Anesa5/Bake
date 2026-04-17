const Doctor = require("../models/Doctor");

exports.registerDoctor = async (req, res) => {
    try {
        const doctor = new Doctor({
            ...req.body,
            profileImage: req.file?.path
        });

        await doctor.save();

        res.status(201).json({
            message: "Doctor registered. Waiting for verification"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
