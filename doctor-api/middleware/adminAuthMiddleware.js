import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const adminAuthMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization || req.header("Authorization");
        
        console.log("=== Admin Auth Middleware Debug ===");
        console.log("Auth Header:", authHeader);
        
        if (!authHeader) {
            console.log("No Authorization header found");
            return res.status(401).json({
                success: false,
                message: "No authentication token"
            });
        }
        
        if (!authHeader.startsWith("Bearer ")) {
            console.log("Authorization header doesn't start with 'Bearer '");
            return res.status(401).json({
                success: false,
                message: "Invalid token format. Use: Bearer <token>"
            });
        }
        
        const token = authHeader.replace("Bearer ", "").trim();
        console.log("Token extracted:", token.substring(0, 20) + "...");
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No authentication token"
            });
        }

        // Verify token - MUST match login route secret
        const secret = process.env.JWT_SECRET || "admin-secret-key";
        console.log("Using JWT secret:", secret ? "Set" : "Not set");
        
        const decoded = jwt.verify(token, secret);
        console.log("Token decoded successfully. ID:", decoded.id);
        
        // Check if admin exists
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            console.log("Admin not found in database for ID:", decoded.id);
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin not found."
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated"
            });
        }

        // Attach to request
        req.adminId = decoded.id;
        req.admin = admin;
        req.user = { id: decoded.id, role: 'admin' }; // For compatibility
        
        console.log("Middleware passed. Admin ID:", decoded.id);
        console.log("================================");
        
        next();
    } catch (error) {
        console.error("=== Admin Auth Error ===");
        console.error("Error:", error.message);
        console.error("Error name:", error.name);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Token is not valid"
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token has expired"
            });
        }
        res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

export default adminAuthMiddleware;
