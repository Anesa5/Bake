const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            role: decoded.role  // This will be 'admin', 'doctor', or 'user'
        };
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;