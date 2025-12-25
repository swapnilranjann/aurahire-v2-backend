import express from "express";
import db from "../config/db.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";  // Import jwt for token verification

dotenv.config();
const router = express.Router();

// JWT Authentication Middleware
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

// Fetch HR Profile (GET)
router.get("/hr", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from JWT token payload
    console.log("Fetching profile for userId:", userId);

    const query = `SELECT email, name, phone, photo, resume FROM swapnil_db.hrprofile WHERE id = ?`;
    const [results] = await db.query(query, [userId]); // Use userId as parameter in the query

    if (results.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(results[0]); // Return the first result (there should only be one profile)
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Create New HR Profile (POST)
router.post("/hr", authenticateJWT, async (req, res) => {
  try {
    const { email, name, phone, photo, resume } = req.body;
    const userId = req.user.id;  // Get user ID from JWT payload

    if (!email || !name || !phone || !photo || !resume) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Insert Profile into the hrprofile table
    const query = `
      INSERT INTO swapnil_db.hrprofile (id, email, name, phone, photo, resume, created_on)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    await db.query(query, [userId, email, name, phone, photo, resume]);

    res.status(201).json({ message: "Profile created successfully." });
  } catch (error) {
    console.error("Error adding profile:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Update HR Profile (PUT)
router.put("/hr", authenticateJWT, async (req, res) => {
  try {
    const { phone, photo, resume } = req.body;
    const userId = req.user.id;  // Get user ID from JWT payload

    if (!phone || !photo || !resume) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const query = `
      UPDATE swapnil_db.hrprofile
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
