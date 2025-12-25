import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailService.js";

const router = express.Router();

// Generate tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" } // Access token valid for 30 days
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
    { expiresIn: "30d" } // Refresh token valid for 30 days
  );
};

// ✅ Register User (Signup) with Email Verification
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Send verification email
    await sendVerificationEmail(email, name, emailVerificationToken);

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Save refresh token to database
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

// ✅ Verify Email
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ 
      where: { 
        emailVerificationToken: token 
      } 
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ error: "Verification token has expired" });
    }

    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Resend Verification Email
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({
      emailVerificationToken,
      emailVerificationExpires,
    });

    await sendVerificationEmail(email, user.name, emailVerificationToken);

    res.json({ message: "Verification email sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if user is a regular user (not HR)
    if (user.role !== 'user') {
      return res.status(403).json({ error: "Please use HR login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
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

// ✅ Refresh Token
router.post("/refresh-token", async (req, res) => {
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

    if (!user || user.refreshToken !== refreshToken) {
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

// ✅ Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: "If an account exists with this email, you will receive a password reset link." });
    }

    // Generate password reset token
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({
      passwordResetToken,
      passwordResetExpires,
    });

    await sendPasswordResetEmail(email, user.name, passwordResetToken);

    res.json({ message: "If an account exists with this email, you will receive a password reset link." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({ 
      where: { 
        passwordResetToken: token 
      } 
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    if (new Date() > user.passwordResetExpires) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    res.json({ message: "Password reset successfully! You can now login with your new password." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Logout (Invalidate refresh token)
router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh"
      );
      
      const user = await User.findByPk(decoded.id);
      if (user) {
        await user.update({ refreshToken: null });
      }
    }

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    // Even if token is invalid, we consider logout successful
    res.json({ message: "Logged out successfully" });
  }
});

// ✅ Change Password (Authenticated)
router.post("/change-password", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const { currentPassword, newPassword } = req.body;

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
