import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./config/db.js";

// Auth Routes
import authRoutes from "./routes/authRoutes.js";
import authRoutesHr from "./routes/authRoutesHr.js";

// Job Routes
import getAllJobs from "./routes/getAlljobs.js";
import jobDetails from "./routes/jobDetails.js";
import applyJob from "./routes/applyJob.js";
import createJob from "./routes/createJob.js";

// Profile Routes
import profile from "./routes/profile.js";
import hrProfile from "./routes/hrProfile.js";
import enhancedProfile from "./routes/enhancedProfile.js";

// New Feature Routes
import savedJobs from "./routes/savedJobs.js";
import applicationStatus from "./routes/applicationStatus.js";
import upload from "./routes/upload.js";

// Other Routes
import contact from "./routes/contact.js";
import applicants from "./routes/applicants.js";

// Import Models for sync
import SavedJob from "./models/SavedJob.js";
import Profile from "./models/Profile.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================
// 🔐 AUTHENTICATION ROUTES
// ============================
app.use("/api/users", authRoutes);          // User signup/login/password reset/email verify
app.use("/api", authRoutesHr);              // HR signup/login

// ============================
// 💼 JOB ROUTES
// ============================
app.use("/api/jobs", getAllJobs);           // GET all jobs with filters + categories/locations
app.use("/api/job", jobDetails);            // GET single job details
app.use("/api/apply", applyJob);            // POST apply for job
app.use("/api", createJob);                 // POST create job (HR)

// ============================
// 👤 PROFILE ROUTES
// ============================
app.use("/api/profile", profile);           // Basic profile (legacy)
app.use("/api/profile", hrProfile);         // HR profile
app.use("/api/enhanced-profile", enhancedProfile); // Enhanced profile with skills/experience

// ============================
// ⭐ NEW FEATURES
// ============================
app.use("/api/saved-jobs", savedJobs);      // Save/unsave jobs (bookmark)
app.use("/api/applications", applicationStatus); // Application status tracking
app.use("/api/upload", upload);             // File upload (resume/photo)

// ============================
// 📞 OTHER ROUTES
// ============================
app.use("/api/contact", contact);           // Contact form
app.use("/api", applicants);                // Get applicants (HR)

// ============================
// 🏥 HEALTH CHECK
// ============================
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "AuraHire API is running",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
});

// ============================
// 🔄 DATABASE SYNC
// ============================
sequelize.sync({ alter: true })
  .then(() => console.log("✅ Database Synced"))
  .catch(err => console.error("❌ Sync Error:", err));

const PORT = process.env.PORT || 15000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
