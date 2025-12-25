# AuraHire Backend - Project Structure

## 📂 Directory Organization

```
AuraHire-Bend-Nodejs-master/
│
├── 📁 config/
│   └── db.js                    # Sequelize database configuration
│
├── 📁 models/                   # Sequelize ORM Models
│   ├── User.js                  # User authentication model
│   ├── Profile.js               # Enhanced user profile model
│   ├── SavedJob.js              # Saved jobs model
│   └── Application.js           # Job application model
│
├── 📁 routes/                   # API Route Handlers
│   │
│   ├── 🔐 Authentication Routes
│   ├── authRoutes.js            # User auth (signup, login, password reset, email verify)
│   └── authRoutesHr.js          # HR authentication
│   │
│   ├── 💼 Job Routes
│   ├── getAlljobs.js            # GET all jobs with search/filters (public)
│   ├── jobDetails.js            # GET single job details (public)
│   ├── createJob.js             # POST create job (HR only)
│   └── applyJob.js              # POST apply for job
│   │
│   ├── 👤 Profile Routes
│   ├── profile.js               # Basic profile (legacy)
│   ├── hrProfile.js             # HR profile management
│   └── enhancedProfile.js       # Enhanced profile (skills, education, experience)
│   │
│   ├── 📋 Application Routes
│   ├── applicationStatus.js     # Application status tracking
│   └── applicants.js            # Get applicants (HR)
│   │
│   ├── ⭐ Feature Routes
│   ├── savedJobs.js             # Save/unsave jobs (bookmark)
│   ├── upload.js                # File upload (resume, photo)
│   └── contact.js               # Contact form submission
│
├── 📁 utils/                    # Utility Functions
│   ├── emailService.js          # Nodemailer email service
│   └── dbMigration.js           # Database migration script
│
├── 📁 uploads/                   # Uploaded Files
│   ├── photos/                  # User profile photos
│   └── resumes/                 # User resumes
│
├── 📄 server.js                 # Main Express server file
├── 📄 package.json              # Dependencies
├── 📄 .env                      # Environment variables (not in git)
└── 📄 README.md                 # Project documentation
```

## 🔗 Route Organization

### Public Routes (No Authentication)
- `GET /api/health` - Health check
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/job/:id` - Get job details
- `GET /api/jobs/categories` - Get categories
- `GET /api/jobs/locations` - Get locations

### Authentication Routes
**User Auth** (`/api/users/*`)
- `POST /api/users/signup`
- `POST /api/users/login`
- `POST /api/users/refresh-token`
- `POST /api/users/logout`
- `POST /api/users/forgot-password`
- `POST /api/users/reset-password`
- `POST /api/users/verify-email/:token`
- `POST /api/users/resend-verification`

**HR Auth** (`/api/*`)
- `POST /api/signup-hr`
- `POST /api/login-hr`
- `POST /api/refresh-token-hr`

### Job Routes
- `POST /api/jobs` - Create job (HR)
- `POST /api/apply` - Apply for job

### Profile Routes
- `GET /api/enhanced-profile` - Get profile
- `PUT /api/enhanced-profile` - Update profile
- `PUT /api/enhanced-profile/skills` - Update skills
- `POST /api/enhanced-profile/education` - Add education
- `POST /api/enhanced-profile/experience` - Add experience

### Application Routes
- `GET /api/applications/my-applications` - Get user's applications
- `PUT /api/applications/:id/status` - Update status (HR)

### Saved Jobs Routes
- `GET /api/saved-jobs` - Get saved jobs
- `POST /api/saved-jobs` - Save job
- `DELETE /api/saved-jobs/:id` - Unsave job

### Upload Routes
- `POST /api/upload/resume` - Upload resume
- `POST /api/upload/photo` - Upload photo

## 📝 File Naming Conventions

- **Routes**: `camelCase.js` (e.g., `getAlljobs.js`, `authRoutes.js`)
- **Models**: `PascalCase.js` (e.g., `User.js`, `Profile.js`)
- **Utils**: `camelCase.js` (e.g., `emailService.js`)

## 🔧 Key Technologies

- **Express.js** - Web framework
- **Sequelize** - ORM for MySQL
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File upload handling

## 🗄️ Database Schema

### Tables
- `users` - User accounts
- `profiles` - Enhanced user profiles
- `job` - Job postings
- `applicants` - Job applications
- `saved_jobs` - Saved jobs
- `contact` - Contact form submissions

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Configure `.env` file
3. Run server: `node server.js`
4. Database auto-syncs on startup

