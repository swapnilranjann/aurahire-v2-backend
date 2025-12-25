import express from "express";
import sequelize from "../config/db.js"; // ✅ Use the same sequelize connection
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

// ✅ Public route - no auth required to view job details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Job ID received:", id);

    if (!id) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    const jobId = parseInt(id, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    // ✅ Corrected Query
    const [result] = await sequelize.query("SELECT * FROM job WHERE id = ?", {
      replacements: [jobId],
      type: sequelize.QueryTypes.SELECT, // 👈 Ensures correct query execution
    });

    if (!result) {
      return res.status(404).json({ error: "Job not found" });
    }

    console.log("✅ Job Found:", result);
    res.json(result);
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
