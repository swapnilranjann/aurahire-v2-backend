import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./config/db.js";

// Auth Routes
import authRoutes from "./routes/auth/authRoutes.js";
import authRoutesHr from "./routes/auth/authRoutesHr.js";

// Job Routes
import getAllJobs from "./routes/jobs/getAlljobs.js";
import jobDetails from "./routes/jobs/jobDetails.js";
import applyJob from "./routes/jobs/applyJob.js";
import createJob from "./routes/jobs/createJob.js";
import jobTests from "./routes/jobs/jobTests.js";

// Profile Routes
import profile from "./routes/profile/profile.js";
import hrProfile from "./routes/profile/hrProfile.js";
import enhancedProfile from "./routes/profile/enhancedProfile.js";

// Application Routes
import applicationStatus from "./routes/applications/applicationStatus.js";

// Job Seeker Features
import savedJobs from "./routes/jobSeeker/savedJobs.js";
import jobAlerts from "./routes/jobSeeker/jobAlerts.js";
import resumeBuilder from "./routes/jobSeeker/resumeBuilder.js";
import skillTests from "./routes/jobSeeker/skillTests.js";
import careerAdvice from "./routes/jobSeeker/careerAdvice.js";

// Employer Features
import resumeSearch from "./routes/employer/resumeSearch.js";
import recruitmentSolutions from "./routes/employer/recruitmentSolutions.js";
import applicants from "./routes/employer/applicants.js";

// Common Routes
import upload from "./routes/common/upload.js";
import contact from "./routes/common/contact.js";
import homeData from "./routes/common/homeData.js";

// Import Models for sync
import SavedJob from "./models/SavedJob.js";
import Profile from "./models/Profile.js";
import JobAlert from "./models/JobAlert.js";
import CareerAdvice from "./models/CareerAdvice.js";
import { SkillTest, SkillTestResult } from "./models/SkillTest.js";
import Question from "./models/Question.js";
import RecruitmentPlan from "./models/RecruitmentPlan.js";
import Application from "./models/Application.js";
import ApplicationStage from "./models/ApplicationStage.js";
import JobTest from "./models/JobTest.js";
import CustomQuestion from "./models/CustomQuestion.js";
// Note: Job model should be imported if it exists, or we use the 'job' table directly

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
app.use("/api/jobs", createJob);            // POST create job, GET/PUT/DELETE my-jobs (HR) - Mount first for specific routes
app.use("/api/jobs", getAllJobs);           // GET all jobs with filters + categories/locations
app.use("/api/job", jobDetails);            // GET single job details
app.use("/api/apply", applyJob);            // POST apply for job
app.use("/api/job-tests", jobTests);        // Job test management (create tests, add questions)

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
// 👨‍💼 JOB SEEKER FEATURES
// ============================
app.use("/api/resume", resumeBuilder);      // Resume builder (create, update, download)
app.use("/api/job-alerts", jobAlerts);      // Job alerts (create, manage alerts)
app.use("/api/career-advice", careerAdvice); // Career advice articles
app.use("/api/skill-tests", skillTests);    // Skill tests (take tests, view results)

// ============================
// 🏢 EMPLOYER FEATURES
// ============================
app.use("/api/resume-search", resumeSearch); // Search resumes/candidates (HR)
app.use("/api/recruitment", recruitmentSolutions); // Recruitment solutions & pricing

// ============================
// 📞 OTHER ROUTES
// ============================
app.use("/api/contact", contact);           // Contact form
app.use("/api", applicants);                // Get applicants (HR)
app.use("/api/home", homeData);             // Home page data (featured jobs, companies, news)

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
// 🔄 DATABASE SYNC & SEED DATA
// ============================
sequelize.sync({ alter: true })
  .then(async () => {
    console.log("✅ Database Synced");
    
    // Run workflow migration
    const { migrateWorkflow } = await import("./utils/migrateWorkflow.js");
    await migrateWorkflow();
    
    // Seed initial data
    const { seedCareerAdvice, seedSkillTests, seedRecruitmentPlans } = await import("./utils/seedData.js");
    const { seedQuestions } = await import("./utils/seedQuestions.js");
    
    await seedCareerAdvice();
    await seedSkillTests();
    await seedRecruitmentPlans();
    
    // Seed questions after tests are created
    console.log("🌱 Seeding questions (this may take a while)...");
    await seedQuestions();
  })
  .catch(err => console.error("❌ Sync Error:", err));

const PORT = process.env.PORT || 15000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
