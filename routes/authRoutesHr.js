import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from "uuid";
import User from '../models/User.js';
import { sendVerificationEmail } from "../utils/emailService.js";

const router = express.Router();

// Generate tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
    { expiresIn: "7d" }
  );
};

// ✅ Register HR User (Signup) at /signup-hr
router.post("/signup-hr", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'hr',
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Send verification email
    await sendVerificationEmail(email, name, emailVerificationToken);

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    await newUser.update({ refreshToken });

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified,
    };

    res.status(201).json({ 
      message: "Signup successful. Please check your email to verify your account.", 
      accessToken,
      refreshToken,
      user: userResponse 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Login HR User at /login-hr
router.post("/login-hr", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Verify user is actually an HR
    if (user.role !== 'hr') {
      return res.status(403).json({ error: "Access denied. Not an HR account." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.update({ refreshToken });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    res.json({ 
      message: "Login successful", 
      accessToken,
      refreshToken,
      user: userResponse 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Refresh Token for HR
router.post("/refresh-token-hr", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh"
    );

    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken || user.role !== 'hr') {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await user.update({ refreshToken: newRefreshToken });

    res.json({ 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    });
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

export default router;
