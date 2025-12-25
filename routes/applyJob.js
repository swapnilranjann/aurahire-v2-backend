import express from "express";
import sequelize from "../config/db.js"; // ✅ Import Sequelize instance
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ Middleware to verify JWT token
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

// ✅ Apply for a job
router.post("/:id", verifyToken, async (req, res) => {
  try {
    const { user_id, email, name, job_id } = req.body;
    console.log("🔹 Received Payload:", req.body);

    if (!user_id || !email || !name || !job_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedJobId = parseInt(job_id, 10);
    if (isNaN(parsedJobId)) {
      return res.status(400).json({ error: "Invalid Job ID" });
    }

    // ✅ Fetch hr_id from the job table using job_id
    const [job] = await sequelize.query(
      "SELECT hr_id FROM swapnil_db.job WHERE id = ?",
      {
        replacements: [parsedJobId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const hr_id = job.hr_id;

    // Check if already applied
    const [existingApplication] = await sequelize.query(
      "SELECT id FROM swapnil_db.applicants WHERE user_id = ? AND job_id = ?",
      {
        replacements: [user_id, parsedJobId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    // ✅ Store application in the applicants table with hr_id and status
    await sequelize.query(
      "INSERT INTO swapnil_db.applicants (user_id, email, name, job_id, created_on, hr_id, status) VALUES (?, ?, ?, ?, NOW(), ?, 'pending')",
      {
        replacements: [user_id, email, name, parsedJobId, hr_id],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    console.log("✅ Application Submitted for Job ID:", parsedJobId);
    res.json({ success: true, message: "Application submitted successfully!" });

  } catch (error) {
    console.error("❌ Error submitting application:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
