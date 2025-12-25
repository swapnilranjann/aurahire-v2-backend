import express from 'express';\nimport { verifyToken } from '../../middleware/auth.js';
import jwt from "jsonwebtoken";
import sequelize from "../config/db.js";
import SavedJob from "../models/SavedJob.js";

const router = express.Router();

// Middleware to verify JWT token


// ✅ Get all saved jobs for a user
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [savedJobs] = await sequelize.query(
      `SELECT sj.id as saved_id, sj.createdAt as saved_at, 
              j.id, j.title, j.company, j.location, j.category, j.description, j.hr_id
       FROM saved_jobs sj
       JOIN job j ON sj.job_id = j.id
       WHERE sj.user_id = ?
       ORDER BY sj.createdAt DESC`,
      { replacements: [userId] }
    );

    res.json(savedJobs);
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Save a job
router.post("/:jobId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = parseInt(req.params.jobId);

    // Check if job exists
    const [job] = await sequelize.query(
      `SELECT id FROM job WHERE id = ?`,
      { replacements: [jobId], type: sequelize.QueryTypes.SELECT }
    );

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({
      where: { user_id: userId, job_id: jobId }
    });

    if (existingSave) {
      return res.status(400).json({ error: "Job already saved" });
    }

    await SavedJob.create({ user_id: userId, job_id: jobId });

    res.status(201).json({ message: "Job saved successfully" });
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Unsave a job
router.delete("/:jobId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = parseInt(req.params.jobId);

    const result = await SavedJob.destroy({
      where: { user_id: userId, job_id: jobId }
    });

    if (result === 0) {
      return res.status(404).json({ error: "Saved job not found" });
    }

    res.json({ message: "Job removed from saved list" });
  } catch (error) {
    console.error("Error removing saved job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Check if a job is saved
router.get("/check/:jobId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = parseInt(req.params.jobId);

    const savedJob = await SavedJob.findOne({
      where: { user_id: userId, job_id: jobId }
    });

    res.json({ isSaved: !!savedJob });
  } catch (error) {
    console.error("Error checking saved job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

