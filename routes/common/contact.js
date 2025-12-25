import express from "express";
import sequelize from "../config/db.js"; // Ensure correct path to db.js
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Raw SQL query to insert data
    const query = `
      INSERT INTO swapnil_db.contact (name, email, phone, subject, message, created_on)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    await sequelize.query(query, {
      replacements: [name, email, phone, subject, message],
    });

    res.status(201).json({ message: "Contact form submitted successfully." });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
