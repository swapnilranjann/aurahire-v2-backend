import express from 'express';\nimport { verifyToken } from '../../middleware/auth.js';
import jwt from "jsonwebtoken";
import sequelize from "../config/db.js";
import Profile from "../models/Profile.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Middleware to verify JWT token


// GET resume data
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      const [user] = await sequelize.query(
        `SELECT id, name, email FROM users WHERE id = ?`,
        { replacements: [userId], type: sequelize.QueryTypes.SELECT }
      );

      if (user) {
        profile = await Profile.create({
          user_id: userId,
          name: user.name,
          email: user.email,
        });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// CREATE/UPDATE resume (POST for compatibility)
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeData = req.body;

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      const [user] = await sequelize.query(
        `SELECT id, name, email FROM users WHERE id = ?`,
        { replacements: [userId], type: sequelize.QueryTypes.SELECT }
      );

      profile = await Profile.create({
        user_id: userId,
        name: user?.name || resumeData.name,
        email: user?.email,
      });
    }

    // Update all resume fields
    await profile.update({
      name: resumeData.name || profile.name,
      email: resumeData.email || profile.email,
      phone: resumeData.phone,
      photo: resumeData.photo,
      resume: resumeData.resume,
      headline: resumeData.headline,
      summary: resumeData.summary || resumeData.personalInfo?.summary,
      currentLocation: resumeData.currentLocation || resumeData.personalInfo?.location,
      experience: resumeData.experience || [],
      education: resumeData.education || [],
      skills: resumeData.skills || [],
      certifications: resumeData.certifications || [],
      linkedinUrl: resumeData.linkedinUrl,
      githubUrl: resumeData.githubUrl,
      portfolioUrl: resumeData.portfolioUrl,
    });

    res.json({ message: "Resume updated successfully", resume: profile });
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE resume
router.put("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeData = req.body;

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      const [user] = await sequelize.query(
        `SELECT id, name, email FROM users WHERE id = ?`,
        { replacements: [userId], type: sequelize.QueryTypes.SELECT }
      );

      profile = await Profile.create({
        user_id: userId,
        name: user?.name || resumeData.name,
        email: user?.email,
      });
    }

    // Update all resume fields
    await profile.update({
      name: resumeData.name || profile.name,
      email: resumeData.email || profile.email,
      phone: resumeData.phone,
      photo: resumeData.photo,
      resume: resumeData.resume,
      headline: resumeData.headline,
      summary: resumeData.summary,
      currentLocation: resumeData.currentLocation,
      preferredLocations: resumeData.preferredLocations,
      experience: resumeData.experience,
      education: resumeData.education,
      skills: resumeData.skills,
      certifications: resumeData.certifications,
      expectedSalary: resumeData.expectedSalary,
      noticePeriod: resumeData.noticePeriod,
      jobType: resumeData.jobType,
      linkedinUrl: resumeData.linkedinUrl,
      githubUrl: resumeData.githubUrl,
      portfolioUrl: resumeData.portfolioUrl,
      isProfilePublic: resumeData.isProfilePublic !== undefined ? resumeData.isProfilePublic : profile.isProfilePublic,
      isOpenToWork: resumeData.isOpenToWork !== undefined ? resumeData.isOpenToWork : profile.isOpenToWork,
    });

    res.json({ message: "Resume updated successfully", profile });
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET resume as PDF (placeholder - would need PDF generation library)
router.get("/download", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Return resume data (in production, generate PDF here)
    res.json({
      message: "Resume download (PDF generation would be implemented here)",
      resume: profile,
    });
  } catch (error) {
    console.error("Error downloading resume:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

