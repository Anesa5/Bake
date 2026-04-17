// middleware/doctorAuthMiddleware.js
import jwt from "jsonwebtoken";

const doctorAuthMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No authentication token, access denied"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "doctor-secret-key");

        // Check if token is for a doctor
        if (decoded.role !== "doctor") {
            return res.status(401).json({
                success: false,
                message: "Not authorized as a doctor"
            });
        }

        // Add doctor ID to request
        req.doctorId = decoded.id;
        next();
    } catch (error) {
        console.error("Doctor auth middleware error:", error);
        res.status(401).json({
            success: false,
            message: "Token is not valid"
        });
    }
};

export default doctorAuthMiddleware;