const Doctor = require("../models/Doctor");
const Category = require("../models/Category");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ======================
    REGISTER DOCTOR
====================== */
exports.registerDoctor = async (req, res) => {
    try {
        console.log("Received registration data:", req.body);

        // Parse services if they come as string
        let services = [];
        if (req.body.services) {
            try {
                services = typeof req.body.services === 'string'
                    ? JSON.parse(req.body.services)
                    : req.body.services;
            } catch (e) {
                services = req.body.services;
            }
        }

        const {
            fullName,
            email,
            phone,
            password,
            qualification,
            experience,
            clinicAddress,
            categoryName,
        } = req.body;

        // 1️⃣ Validate required fields
        if (!fullName || !email || !password || !categoryName) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        // 2️⃣ Check if doctor already exists
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: "Doctor already exists" });
        }

        // 3️⃣ Find category
        const category = await Category.findOne({ name: categoryName });
        if (!category) {
            return res.status(400).json({ message: `Category '${categoryName}' not found` });
        }

        // 4️⃣ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5️⃣ Create doctor with ALL fields (including services)
        const doctor = await Doctor.create({
            fullName,
            email,
            phone,
            password: hashedPassword,
            qualification,
            experience,
            clinicAddress,
            specialization: categoryName,
            category: category._id,
            services: services,  // ✅ SERVICES YAHAN SAVE HO RAHI HAIN
        });

        // 6️⃣ Push doctor into category
        category.doctors.push(doctor._id);
        await category.save();

        res.status(201).json({
            message: "Doctor registered successfully",
            doctor,
        });

    } catch (error) {
        console.error("Register Doctor Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
};

/* ======================
    LOGIN DOCTOR
====================== */
exports.loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1️⃣ Find doctor
        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 2️⃣ Compare password
        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3️⃣ Generate JWT
        const token = jwt.sign(
            { id: doctor._id, role: "doctor" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            role: "doctor",
            doctor,
        });
    } catch (error) {
        console.error("Login Doctor Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
};

/* ======================
    GET DOCTOR PROFILE
====================== */
exports.getDoctorProfile = async (req, res) => {
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
        console.error("Get Doctor Profile Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ======================
    ADD CLINIC
====================== */
exports.addClinic = async (req, res) => {
    try {
        const { doctorId, name, address, city, lat, lng } = req.body;

        if (!doctorId || !name || !address || !city || !lat || !lng) {
            return res.status(400).json({ message: "Please provide all clinic details" });
        }

        // 1️⃣ Find doctor
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // 2️⃣ Create clinic object
        const newClinic = {
            name,
            address,
            city,
            location: { lat, lng },
        };

        // 3️⃣ Add clinic to doctor's clinics array
        doctor.clinics.push(newClinic);
        await doctor.save();

        res.status(201).json({
            message: "Clinic added successfully",
            clinic: newClinic,
            doctorId: doctor._id,
        });

    } catch (error) {
        console.error("Add Clinic Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
};