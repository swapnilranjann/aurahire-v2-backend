import express from "express";
import jwt from "jsonwebtoken";
import JobAlert from "../models/JobAlert.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

// GET all job alerts for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const alerts = await JobAlert.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
    });

    res.json(alerts);
  } catch (error) {
    console.error("Error fetching job alerts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// CREATE job alert
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { keywords, location, category, experience_level, salary_range, job_type, frequency } = req.body;

    const alert = await JobAlert.create({
      user_id: userId,
      keywords,
      location,
      category,
      experience_level,
      salary_range,
      job_type,
      frequency: frequency || 'daily',
      is_active: true,
    });

    res.status(201).json({ message: "Job alert created successfully", alert });
  } catch (error) {
    console.error("Error creating job alert:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE job alert
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;
    const updateData = req.body;

    const alert = await JobAlert.findOne({
      where: { id: alertId, user_id: userId },
    });

    if (!alert) {
      return res.status(404).json({ error: "Job alert not found" });
    }

    await alert.update(updateData);

    res.json({ message: "Job alert updated successfully", alert });
  } catch (error) {
    console.error("Error updating job alert:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE job alert
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;

    const alert = await JobAlert.findOne({
      where: { id: alertId, user_id: userId },
    });

    if (!alert) {
      return res.status(404).json({ error: "Job alert not found" });
    }

    await alert.destroy();

    res.json({ message: "Job alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting job alert:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// TOGGLE job alert active status
router.patch("/:id/toggle", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;

    const alert = await JobAlert.findOne({
      where: { id: alertId, user_id: userId },
    });

    if (!alert) {
      return res.status(404).json({ error: "Job alert not found" });
    }

    await alert.update({ is_active: !alert.is_active });

    res.json({ message: "Job alert status updated", alert });
  } catch (error) {
    console.error("Error toggling job alert:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

