# Backend Structure

## 📁 Directory Organization

```
backend/
├── config/                 # Configuration files
│   └── db.js              # Database configuration
│
├── models/                 # Sequelize models
│   ├── User.js            # User authentication model
│   ├── Application.js     # Job application model
│   ├── ApplicationStage.js # Application workflow stages
│   ├── Profile.js         # Enhanced user profile
│   ├── SavedJob.js        # Saved/bookmarked jobs
│   ├── JobAlert.js        # Job alert subscriptions
│   ├── ResumeBuilder.js   # Resume data (if separate)
│   ├── CareerAdvice.js    # Career advice articles
│   ├── SkillTest.js       # Skill tests
│   ├── SkillTestResult.js # Test results
│   ├── Question.js        # Skill test questions
│   ├── RecruitmentPlan.js # Pricing plans
│   ├── JobTest.js         # Custom job tests
│   └── CustomQuestion.js  # Custom test questions
│
├── routes/                 # API route handlers
│   ├── auth/              # Authentication routes
│   │   ├── authRoutes.js      # User auth (signup, login, password reset)
│   │   └── authRoutesHr.js    # HR auth
│   │
│   ├── jobs/              # Job-related routes
│   │   ├── getAlljobs.js      # Get all jobs, search, filters
│   │   ├── jobDetails.js      # Single job details
│   │   ├── applyJob.js        # Apply for job
│   │   ├── createJob.js       # HR: Create/update/delete jobs
│   │   └── jobTests.js        # Custom job tests
│   │
│   ├── profile/           # Profile routes
│   │   ├── profile.js          # Basic profile (legacy)
│   │   ├── hrProfile.js       # HR profile
│   │   └── enhancedProfile.js # Enhanced profile with skills/exp
│   │
│   ├── applications/      # Application management
│   │   └── applicationStatus.js # Application tracking & workflow
│   │
│   ├── jobSeeker/         # Job seeker specific features
│   │   ├── savedJobs.js       # Save/unsave jobs
│   │   ├── jobAlerts.js       # Job alert management
│   │   ├── resumeBuilder.js   # Resume builder
│   │   ├── skillTests.js      # Take skill tests
│   │   └── careerAdvice.js    # Career advice articles
│   │
│   ├── employer/          # Employer/HR specific features
│   │   ├── resumeSearch.js    # Search resumes
│   │   ├── recruitmentSolutions.js # Pricing & solutions
│   │   └── applicants.js      # Get applicants (legacy)
│   │
│   └── common/            # Common/shared routes
│       ├── upload.js          # File uploads
│       ├── contact.js         # Contact form
│       └── homeData.js        # Home page data
│
├── middleware/            # Express middleware
│   └── auth.js            # JWT authentication middleware
│
├── utils/                 # Utility functions
│   ├── emailService.js    # Email sending (nodemailer)
│   ├── dbMigration.js     # Database migrations
│   ├── migrateWorkflow.js # Workflow migration
│   ├── seedData.js        # Seed initial data
│   └── seedQuestions.js    # Seed skill test questions
│
├── tests/                 # Test scripts
│   └── testEmployeeAPIs.js # Employee API tests
│
├── uploads/               # Uploaded files
│   ├── photos/            # User photos
│   └── resumes/          # Resume files
│
├── server.js              # Main application entry point
├── package.json           # Dependencies
├── .env                   # Environment variables
└── README.md              # Documentation

```

## 🔄 Migration Plan

The current structure will be reorganized as follows:

1. **Routes Organization:**
   - Group routes by feature/domain
   - Separate auth, jobs, profile, applications, jobSeeker, employer, common

2. **Middleware:**
   - Extract auth middleware to separate file

3. **Tests:**
   - Create tests directory for all test scripts

4. **Documentation:**
   - Add structure documentation

