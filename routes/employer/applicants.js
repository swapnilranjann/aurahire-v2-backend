import express from 'express';\nimport { verifyToken } from '../../middleware/auth.js';
import jwt from "jsonwebtoken";
import sequelize from "../config/db.js";

const router = express.Router();

// Middleware to verify JWT token


// Route to get applicants
router.get("/applicants", verifyToken, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    console.log("🔹 HR ID from Token:", req.user.id);

    const applicants = await sequelize.query(
      `SELECT id, email, name, created_on, hr_id FROM applicants WHERE hr_id = ?`,
      {
        replacements: [req.user.id], // Ensure this matches the database
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log("🔹 Query Result:", applicants);

    if (applicants.length === 0) {
      console.log("❌ No applicants found for HR ID:", req.user.id);
      return res.status(404).json({ message: "No applicants found for your jobs." });
    }

    res.json(applicants);
  } catch (error) {
    console.error("❌ Error fetching applicants:", error.message);
    res.status(500).json({ error: "Failed to fetch applicants" });
  }
});

export default router;
