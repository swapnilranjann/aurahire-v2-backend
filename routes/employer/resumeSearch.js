import express from "express";
import jwt from "jsonwebtoken";
import sequelize from "../config/db.js";
import Profile from "../models/Profile.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Middleware to verify JWT token and HR role
const verifyHR = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'hr') {
      return res.status(403).json({ error: "Access denied. HR only." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

// SEARCH resumes/candidates
router.get("/search", verifyHR, async (req, res) => {
  try {
    const { keyword, skills, location, experience_years, education, salary_range, limit = 20, offset = 0 } = req.query;

    let whereConditions = ['isProfilePublic = 1', 'isOpenToWork = 1'];
    let replacements = [];

    // Keyword search (name, headline, summary)
    if (keyword) {
      whereConditions.push(`(name LIKE ? OR headline LIKE ? OR summary LIKE ?)`);
      const keywordPattern = `%${keyword}%`;
      replacements.push(keywordPattern, keywordPattern, keywordPattern);
    }

    // Skills search (JSON array search)
    if (skills) {
      const skillList = skills.split(',').map(s => s.trim());
      whereConditions.push(`JSON_CONTAINS(skills, ?)`);
      replacements.push(JSON.stringify(skillList));
    }

    // Location search
    if (location) {
      whereConditions.push(`(currentLocation LIKE ? OR preferredLocations LIKE ?)`);
      const locationPattern = `%${location}%`;
      replacements.push(locationPattern, locationPattern);
    }

    // Experience years (simplified - would need to calculate from experience JSON)
    if (experience_years) {
      // This is a simplified check - in production, calculate from experience array
      whereConditions.push(`experience IS NOT NULL`);
    }

    // Education filter
    if (education) {
      whereConditions.push(`JSON_CONTAINS(education, ?)`);
      replacements.push(JSON.stringify([{ degree: education }]));
    }

    const whereClause = whereConditions.join(' AND ');
    replacements.push(parseInt(limit), parseInt(offset));

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM profiles WHERE ${whereClause}`;
    const [countResult] = await sequelize.query(countQuery, {
      replacements: replacements.slice(0, -2),
    });

    // Get profiles
    const searchQuery = `
      SELECT id, user_id, name, email, phone, headline, summary, currentLocation,
             experience, education, skills, certifications, expectedSalary,
             linkedinUrl, githubUrl, portfolioUrl, resume, photo,
             createdAt, updatedAt
      FROM profiles
      WHERE ${whereClause}
      ORDER BY updatedAt DESC
      LIMIT ? OFFSET ?
    `;

    const [profiles] = await sequelize.query(searchQuery, { replacements });

    res.json({
      candidates: profiles,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + profiles.length < countResult[0].total,
      },
    });
  } catch (error) {
    console.error("Error searching resumes:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// GET candidate profile details
router.get("/candidate/:userId", verifyHR, async (req, res) => {
  try {
    const userId = req.params.userId;

    const profile = await Profile.findOne({
      where: { user_id: userId, isProfilePublic: true },
    });

    if (!profile) {
      return res.status(404).json({ error: "Candidate profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET search filters/suggestions
router.get("/filters", verifyHR, async (req, res) => {
  try {
    // Get distinct skills from all public profiles
    const [skillsResult] = await sequelize.query(`
      SELECT DISTINCT JSON_EXTRACT(skills, '$[*]') as skill
      FROM profiles
      WHERE isProfilePublic = 1 AND skills IS NOT NULL
      LIMIT 50
    `);

    // Get distinct locations
    const [locationsResult] = await sequelize.query(`
      SELECT DISTINCT currentLocation as location
      FROM profiles
      WHERE isProfilePublic = 1 AND currentLocation IS NOT NULL
      ORDER BY currentLocation
      LIMIT 50
    `);

    res.json({
      skills: skillsResult.map(s => s.skill).filter(Boolean).flat(),
      locations: locationsResult.map(l => l.location).filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

