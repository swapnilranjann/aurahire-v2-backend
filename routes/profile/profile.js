import express from "express";
import db from "../config/db.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";  // Import jwt for token verification

dotenv.config();
const router = express.Router();
const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

router.get("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `SELECT email, name, phone, photo, resume FROM swapnil_db.profile WHERE id = ?`;
    const [results] = await db.query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(results[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ ADD (POST) New Profile (Authenticated)
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { email, name, phone, photo, resume } = req.body;
    const userId = req.user.id;  // Get user ID from JWT payload

    if (!email || !name || !phone || !photo || !resume) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if user exists in the `users` table before inserting profile
    const [userExists] = await db.query(`SELECT id FROM swapnil_db.users WHERE id = ?`, [userId]);

    if (userExists.length === 0) {
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    // Insert Profile
    const query = `
      INSERT INTO swapnil_db.profile (id, email, name, phone, photo, resume, created_on)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    await db.query(query, [userId, email, name, phone, photo, resume]);

    res.status(201).json({ message: "Profile created successfully." });
  } catch (error) {
    console.error("Error adding profile:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ UPDATE Profile by User ID (Authenticated)
router.put("/", authenticateJWT, async (req, res) => {
  try {
    const { phone, photo, resume } = req.body;
    const userId = req.user.id;  // Get user ID from JWT payload

    if (!phone || !photo || !resume) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const query = `
      UPDATE swapnil_db.profile
      SET phone = ?, photo = ?, resume = ?
      WHERE id = ?
    `;

    const [results] = await db.query(query, [phone, photo, resume, userId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
