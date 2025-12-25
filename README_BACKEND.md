# AuraHire Backend - Organized Structure

## 📁 Current Structure

```
backend/
├── config/
│   └── db.js                    # Database configuration
│
├── models/                      # Sequelize models
│   ├── User.js
│   ├── Application.js
│   ├── ApplicationStage.js
│   ├── Profile.js
│   ├── SavedJob.js
│   ├── JobAlert.js
│   ├── CareerAdvice.js
│   ├── SkillTest.js
│   ├── SkillTestResult.js
│   ├── Question.js
│   ├── RecruitmentPlan.js
│   ├── JobTest.js
│   └── CustomQuestion.js
│
├── routes/
│   ├── auth/                    # Authentication
│   │   ├── authRoutes.js        # User signup/login/password reset
│   │   └── authRoutesHr.js      # HR signup/login
│   │
│   ├── jobs/                    # Job management
│   │   ├── getAlljobs.js        # Get all jobs, search, filters
│   │   ├── jobDetails.js        # Single job details
│   │   ├── applyJob.js          # Apply for job
│   │   ├── createJob.js         # HR: Create/update/delete jobs
│   │   └── jobTests.js          # Custom job tests
│   │
│   ├── profile/                 # Profile management
│   │   ├── profile.js           # Basic profile (legacy)
│   │   ├── hrProfile.js        # HR profile
│   │   └── enhancedProfile.js  # Enhanced profile
│   │
│   ├── applications/            # Application management
│   │   └── applicationStatus.js # Application tracking & workflow
│   │
│   ├── jobSeeker/              # Job seeker features
│   │   ├── savedJobs.js        # Save/unsave jobs
│   │   ├── jobAlerts.js        # Job alert management
│   │   ├── resumeBuilder.js    # Resume builder
│   │   ├── skillTests.js       # Take skill tests
│   │   └── careerAdvice.js     # Career advice articles
│   │
│   ├── employer/               # Employer/HR features
│   │   ├── resumeSearch.js     # Search resumes
│   │   ├── recruitmentSolutions.js # Pricing & solutions
│   │   └── applicants.js       # Get applicants (legacy)
│   │
│   └── common/                 # Common/shared routes
│       ├── upload.js           # File uploads
│       ├── contact.js          # Contact form
│       └── homeData.js         # Home page data
│
├── middleware/
│   └── auth.js                 # JWT authentication middleware
│
├── utils/                       # Utility functions
│   ├── emailService.js         # Email sending
│   ├── dbMigration.js          # Database migrations
│   ├── migrateWorkflow.js      # Workflow migration
│   ├── seedData.js             # Seed initial data
│   └── seedQuestions.js        # Seed skill test questions
│
├── tests/                       # Test scripts
│   ├── testEmployeeAPIs.js     # Comprehensive employee API tests
│   └── runEmployeeTests.js     # Test runner
│
├── uploads/                     # Uploaded files
│   ├── photos/                 # User photos
│   └── resumes/                # Resume files
│
├── server.js                    # Main application entry point
├── package.json                 # Dependencies
└── .env                         # Environment variables
```

## 🧪 Testing

### Run Employee API Tests

```bash
# Install dependencies (if axios not installed)
npm install

# Run all employee API tests
npm run test:employee

# Or directly
node tests/testEmployeeAPIs.js
```

### Test Coverage

The test script covers all employee/job seeker APIs:

1. **Authentication**
   - ✅ User Signup
   - ✅ User Login
   - ✅ Refresh Token

2. **Profile**
   - ✅ Get Profile
   - ✅ Update Profile
   - ✅ Get Profile Completion

3. **Jobs (Read)**
   - ✅ Get All Jobs
   - ✅ Get Job Categories
   - ✅ Get Job Locations
   - ✅ Get Job Details
   - ✅ Search Jobs with Filters

4. **Saved Jobs**
   - ✅ Save Job (POST)
   - ✅ Get All Saved Jobs (GET)
   - ✅ Delete Saved Job (DELETE)

5. **Applications**
   - ✅ Apply for Job (POST)
   - ✅ Get My Applications (GET)
   - ✅ Get Application Workflow (GET)
   - ✅ Withdraw Application (DELETE)

6. **Job Alerts**
   - ✅ Create Job Alert (POST)
   - ✅ Get All Job Alerts (GET)
   - ✅ Update Job Alert (PUT)
   - ✅ Delete Job Alert (DELETE)

7. **Resume Builder**
   - ✅ Get Resume (GET)
   - ✅ Create/Update Resume (POST)
   - ✅ Download Resume (GET)

8. **Skill Tests**
   - ✅ Get All Skill Tests (GET)
   - ✅ Get Test Results (GET)

9. **Career Advice**
   - ✅ Get All Articles (GET)
   - ✅ Get Featured Articles (GET)

## 🚀 API Endpoints

### Base URL
```
http://localhost:15000/api
```

### Employee/Job Seeker Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/signup` | User registration |
| POST | `/users/login` | User login |
| POST | `/users/refresh-token` | Refresh access token |
| GET | `/enhanced-profile` | Get user profile |
| PUT | `/enhanced-profile` | Update user profile |
| GET | `/enhanced-profile/completion` | Get profile completion % |
| GET | `/jobs` | Get all jobs |
| GET | `/jobs/categories` | Get job categories |
| GET | `/jobs/locations` | Get job locations |
| GET | `/job/:id` | Get job details |
| POST | `/saved-jobs/:jobId` | Save a job |
| GET | `/saved-jobs` | Get all saved jobs |
| DELETE | `/saved-jobs/:id` | Delete saved job |
| POST | `/apply/:jobId` | Apply for job |
| GET | `/applications/my-applications` | Get my applications |
| GET | `/applications/my-applications/:id/workflow` | Get application workflow |
| DELETE | `/applications/my-applications/:id` | Withdraw application |
| POST | `/job-alerts` | Create job alert |
| GET | `/job-alerts` | Get all job alerts |
| PUT | `/job-alerts/:id` | Update job alert |
| DELETE | `/job-alerts/:id` | Delete job alert |
| GET | `/resume` | Get resume |
| POST | `/resume` | Create/update resume |
| GET | `/resume/download` | Download resume |
| GET | `/skill-tests` | Get all skill tests |
| GET | `/skill-tests/results` | Get test results |
| GET | `/career-advice` | Get all articles |
| GET | `/career-advice/featured` | Get featured articles |

## 📝 Notes

- All routes are organized by domain/feature
- Middleware is centralized in `middleware/auth.js`
- Test script provides color-coded output for easy debugging
- All CRUD operations are tested for each feature

## 🔧 Development

```bash
# Start development server
npm run dev

# Start production server
npm start
```

## 📦 Dependencies

- express - Web framework
- sequelize - ORM
- mysql2 - MySQL driver
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- multer - File uploads
- nodemailer - Email service
- axios - HTTP client (for tests)

