exports.isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access only" });
    next();
};

exports.isDoctor = (req, res, next) => {
    if (req.user.role !== "doctor") return res.status(403).json({ message: "Doctor access only" });
    next();
};

exports.isPatient = (req, res, next) => {
    if (req.user.role !== "patient") return res.status(403).json({ message: "Patient access only" });
    next();
};
