const Category = require("../models/Category");

// GET all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find(); // fetch all
        res.status(200).json(categories);
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
