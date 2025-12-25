import express from "express";
import jwt from "jsonwebtoken";
import sequelize from "../config/db.js";
import { sendApplicationStatusEmail } from "../utils/emailService.js";

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

// ✅ Get all applications for a user (Job Seeker)
router.get("/my-applications", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [applications] = await sequelize.query(
      `SELECT a.id, a.job_id, a.status, a.notes, a.created_on,
              j.title, j.company, j.location, j.category
       FROM applicants a
       JOIN job j ON a.job_id = j.id
       WHERE a.user_id = ?
       ORDER BY a.created_on DESC`,
      { replacements: [userId] }
    );

    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get application details
router.get("/my-applications/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = parseInt(req.params.id);

    const [application] = await sequelize.query(
      `SELECT a.*, j.title, j.company, j.location, j.category, j.description
       FROM applicants a
       JOIN job j ON a.job_id = j.id
       WHERE a.id = ? AND a.user_id = ?`,
      { replacements: [applicationId, userId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Withdraw application (User)
router.delete("/my-applications/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = parseInt(req.params.id);

    // Check if application exists and belongs to user
    const [application] = await sequelize.query(
      `SELECT * FROM applicants WHERE id = ? AND user_id = ?`,
      { replacements: [applicationId, userId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Only allow withdrawal if status is pending
    if (application.status && application.status !== 'pending') {
      return res.status(400).json({ error: "Cannot withdraw application that has been processed" });
    }

    await sequelize.query(
      `DELETE FROM applicants WHERE id = ? AND user_id = ?`,
      { replacements: [applicationId, userId] }
    );

    res.json({ message: "Application withdrawn successfully" });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get all applicants for HR (with status filter)
router.get("/hr/applicants", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;
    const { status, job_id } = req.query;

    let query = `
      SELECT a.id, a.user_id, a.email, a.name, a.job_id, a.status, a.notes, a.created_on,
             j.title as job_title, j.company
      FROM applicants a
      JOIN job j ON a.job_id = j.id
      WHERE a.hr_id = ?
    `;
    
    const replacements = [hrId];

    if (status) {
      query += ` AND a.status = ?`;
      replacements.push(status);
    }

    if (job_id) {
      query += ` AND a.job_id = ?`;
      replacements.push(parseInt(job_id));
    }

    query += ` ORDER BY a.created_on DESC`;

    const [applicants] = await sequelize.query(query, { replacements });

    res.json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Update application status (HR only)
router.put("/hr/applicants/:id/status", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;
    const applicationId = parseInt(req.params.id);
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Check if application belongs to HR's job
    const [application] = await sequelize.query(
      `SELECT a.*, j.title as job_title FROM applicants a 
       JOIN job j ON a.job_id = j.id 
       WHERE a.id = ? AND a.hr_id = ?`,
      { replacements: [applicationId, hrId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Update status
    await sequelize.query(
      `UPDATE applicants SET status = ?, notes = ? WHERE id = ?`,
      { replacements: [status, notes || null, applicationId] }
    );

    // Send email notification to applicant
    await sendApplicationStatusEmail(
      application.email,
      application.name,
      application.job_title,
      status
    );

    res.json({ message: "Application status updated successfully" });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get application stats for HR dashboard
router.get("/hr/stats", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;

    const [stats] = await sequelize.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' OR status IS NULL THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
        SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN status = 'interview' THEN 1 ELSE 0 END) as interview,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired
       FROM applicants WHERE hr_id = ?`,
      { replacements: [hrId] }
    );

    res.json(stats[0]);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

