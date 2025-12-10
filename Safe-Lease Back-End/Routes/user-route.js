const express = require("express");
const router = express.Router();
const User = require("../models/User-model");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// ------------------ MULTER FOR PROFILE PICS ------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/profilePics/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// ------------------ GET USER PROFILE ------------------
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------ UPDATE USER PROFILE ------------------
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { name, bio, profilePic } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, bio, profilePic },
            { new: true }
        ).select("-password");

        if (!updatedUser)
            return res.status(404).json({ message: "User not found" });

        res.json(updatedUser);
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------ UPLOAD PROFILE PIC ------------------
router.post(
    "/:id/avatar",
    authMiddleware,
    upload.single("avatar"),
    async (req, res) => {
        try {
            if (!req.file)
                return res.status(400).json({ message: "No file uploaded" });

            const imageUrl = `/uploads/profilePics/${req.file.filename}`;

            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { profilePic: imageUrl },
                { new: true }
            ).select("-password");

            res.json(updatedUser);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;
