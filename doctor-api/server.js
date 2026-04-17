import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Import routes
import doctorRoutes from "./routes/doctorRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import doctorAuthRoutes from "./routes/doctorAuthRoutes.js";
import doctorPublicRoutes from "./routes/doctorPublicRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import adminDoctorRoutes from "./routes/adminDoctorRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import homepageRoutes from "./routes/homepageRoutes.js";
import doctorDashboard from "./routes/doctorDashboard.js";
import doctorProfileRoutes from "./routes/doctorProfile.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import './models/Review.js';
import patientRoutes from './routes/patientRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/doctor", doctorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorAuthRoutes);
app.use("/api/doctors", doctorPublicRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/home", homepageRoutes);
app.use("/api/doctor-dashboard", doctorDashboard);
app.use("/api/doctor-profile", doctorProfileRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/doctors", adminDoctorRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/patients', patientRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({ message: "Doctor API is running" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
);