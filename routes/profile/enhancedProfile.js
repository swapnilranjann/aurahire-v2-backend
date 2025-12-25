import express from 'express';\nimport { verifyToken } from '../../middleware/auth.js';
import jwt from "jsonwebtoken";
import sequelize from "../config/db.js";
import Profile from "../models/Profile.js";

const router = express.Router();

// Middleware to verify JWT token


// Calculate profile completion percentage
const calculateCompletion = (profile) => {
  const fields = [
    { name: 'name', weight: 10 },
    { name: 'email', weight: 10 },
    { name: 'phone', weight: 5 },
    { name: 'photo', weight: 5 },
    { name: 'resume', weight: 10 },
    { name: 'headline', weight: 5 },
    { name: 'summary', weight: 10 },
    { name: 'currentLocation', weight: 5 },
    { name: 'experience', weight: 15, isArray: true },
    { name: 'education', weight: 10, isArray: true },
    { name: 'skills', weight: 10, isArray: true },
    { name: 'linkedinUrl', weight: 5 },
  ];

  let totalWeight = 0;
  let completedWeight = 0;

  fields.forEach(field => {
    totalWeight += field.weight;
    if (profile[field.name]) {
      if (field.isArray) {
        if (Array.isArray(profile[field.name]) && profile[field.name].length > 0) {
          completedWeight += field.weight;
        }
      } else {
        completedWeight += field.weight;
      }
    }
  });

  return Math.round((completedWeight / totalWeight) * 100);
};

// ✅ Get user profile
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      // Get user info from users table
      const [user] = await sequelize.query(
        `SELECT id, name, email FROM users WHERE id = ?`,
        { replacements: [userId], type: sequelize.QueryTypes.SELECT }
      );

      if (user) {
        // Create a basic profile
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
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Update profile
router.put("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name, phone, photo, resume, headline, summary,
      currentLocation, preferredLocations, experience, education,
      skills, certifications, expectedSalary, noticePeriod, jobType,
      linkedinUrl, githubUrl, portfolioUrl, isProfilePublic, isOpenToWork
    } = req.body;

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      // Get user info
      const [user] = await sequelize.query(
        `SELECT id, name, email FROM users WHERE id = ?`,
        { replacements: [userId], type: sequelize.QueryTypes.SELECT }
      );

      profile = await Profile.create({
        user_id: userId,
        name: user?.name || name,
        email: user?.email,
      });
    }

    // Update profile fields
    const updateData = {
      name: name || profile.name,
      phone,
      photo,
      resume,
      headline,
      summary,
      currentLocation,
      preferredLocations,
      experience,
      education,
      skills,
      certifications,
      expectedSalary,
      noticePeriod,
      jobType,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      isProfilePublic: isProfilePublic !== undefined ? isProfilePublic : profile.isProfilePublic,
      isOpenToWork: isOpenToWork !== undefined ? isOpenToWork : profile.isOpenToWork,
    };

    // Calculate completion percentage
    updateData.completionPercentage = calculateCompletion({ ...profile.toJSON(), ...updateData });

    await profile.update(updateData);

    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Add work experience
router.post("/experience", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { company, title, location, startDate, endDate, current, description } = req.body;

    if (!company || !title || !startDate) {
      return res.status(400).json({ error: "Company, title and start date are required" });
    }

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const newExperience = {
      id: Date.now().toString(),
      company,
      title,
      location,
      startDate,
      endDate: current ? null : endDate,
      current: current || false,
      description
    };

    const experiences = profile.experience || [];
    experiences.push(newExperience);

    await profile.update({ 
      experience: experiences,
      completionPercentage: calculateCompletion({ ...profile.toJSON(), experience: experiences })
    });

    res.status(201).json({ message: "Experience added successfully", experience: newExperience });
  } catch (error) {
    console.error("Error adding experience:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Delete work experience
router.delete("/experience/:expId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const expId = req.params.expId;

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const experiences = (profile.experience || []).filter(exp => exp.id !== expId);

    await profile.update({ 
      experience: experiences,
      completionPercentage: calculateCompletion({ ...profile.toJSON(), experience: experiences })
    });

    res.json({ message: "Experience deleted successfully" });
  } catch (error) {
    console.error("Error deleting experience:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Add education
router.post("/education", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { institution, degree, field, startDate, endDate, grade } = req.body;

    if (!institution || !degree || !field) {
      return res.status(400).json({ error: "Institution, degree and field are required" });
    }

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const newEducation = {
      id: Date.now().toString(),
      institution,
      degree,
      field,
      startDate,
      endDate,
      grade
    };

    const educations = profile.education || [];
    educations.push(newEducation);

    await profile.update({ 
      education: educations,
      completionPercentage: calculateCompletion({ ...profile.toJSON(), education: educations })
    });

    res.status(201).json({ message: "Education added successfully", education: newEducation });
  } catch (error) {
    console.error("Error adding education:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Delete education
router.delete("/education/:eduId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const eduId = req.params.eduId;

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const educations = (profile.education || []).filter(edu => edu.id !== eduId);

    await profile.update({ 
      education: educations,
      completionPercentage: calculateCompletion({ ...profile.toJSON(), education: educations })
    });

    res.json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("Error deleting education:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Update skills
router.put("/skills", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: "Skills must be an array" });
    }

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    await profile.update({ 
      skills,
      completionPercentage: calculateCompletion({ ...profile.toJSON(), skills })
    });

    res.json({ message: "Skills updated successfully", skills });
  } catch (error) {
    console.error("Error updating skills:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get profile completion percentage
router.get("/completion", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      return res.json({ completion: 0 });
    }

    const completion = calculateCompletion(profile);
    res.json({ completion });
  } catch (error) {
    console.error("Error fetching completion:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get profile completion tips
router.get("/completion-tips", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    let profile = await Profile.findOne({ where: { user_id: userId } });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const tips = [];

    if (!profile.photo) tips.push({ field: 'photo', tip: 'Add a professional photo to increase profile visibility by 40%' });
    if (!profile.headline) tips.push({ field: 'headline', tip: 'Add a headline to let recruiters know your expertise' });
    if (!profile.summary) tips.push({ field: 'summary', tip: 'Write a summary to stand out from other candidates' });
    if (!profile.resume) tips.push({ field: 'resume', tip: 'Upload your resume for easy applications' });
    if (!profile.experience || profile.experience.length === 0) tips.push({ field: 'experience', tip: 'Add work experience to showcase your career' });
    if (!profile.education || profile.education.length === 0) tips.push({ field: 'education', tip: 'Add education details' });
    if (!profile.skills || profile.skills.length === 0) tips.push({ field: 'skills', tip: 'Add skills to match with relevant jobs' });
    if (!profile.linkedinUrl) tips.push({ field: 'linkedinUrl', tip: 'Link your LinkedIn profile for credibility' });
    if (!profile.phone) tips.push({ field: 'phone', tip: 'Add phone number for recruiters to contact you' });

    res.json({
      completionPercentage: profile.completionPercentage,
      tips
    });
  } catch (error) {
    console.error("Error fetching tips:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;


