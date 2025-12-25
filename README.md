# AuraHire Backend API

A comprehensive job portal backend built with Node.js, Express, and MySQL.

## 📁 Project Structure

```
AuraHire-Bend-Nodejs-master/
├── config/
│   └── db.js                 # Database configuration (Sequelize)
├── models/
│   ├── User.js               # User model (authentication)
│   ├── Profile.js            # Enhanced user profile model
│   ├── SavedJob.js           # Saved jobs model
│   └── Application.js       # Job application model
├── routes/
│   ├── auth/
│   │   ├── authRoutes.js     # User authentication (signup, login, password reset)
│   │   └── authRoutesHr.js   # HR authentication
│   ├── jobs/
│   │   ├── getAlljobs.js     # Get all jobs with filters
│   │   ├── jobDetails.js     # Get single job details
│   │   ├── createJob.js      # Create job (HR)
│   │   └── applyJob.js       # Apply for job
│   ├── profile/
│   │   ├── profile.js        # Basic profile (legacy)
│   │   ├── hrProfile.js      # HR profile
│   │   └── enhancedProfile.js # Enhanced profile (skills, education, experience)
│   ├── applications/
│   │   ├── applicationStatus.js # Application status tracking
│   │   └── applicants.js     # Get applicants (HR)
│   ├── savedJobs.js          # Save/unsave jobs
│   ├── upload.js             # File upload (resume, photo)
│   └── contact.js            # Contact form
├── utils/
│   ├── emailService.js       # Email service (Nodemailer)
│   └── dbMigration.js        # Database migration script
├── uploads/
│   ├── photos/               # User profile photos
│   └── resumes/              # User resumes
├── server.js                 # Main server file
├── package.json
└── .env                      # Environment variables
```

## 🚀 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/jobs` - Get all jobs (with filters: keyword, location, category)
- `GET /api/job/:id` - Get job details
- `GET /api/jobs/categories` - Get all job categories
- `GET /api/jobs/locations` - Get all job locations

### Authentication
- `POST /api/users/signup` - User signup
- `POST /api/users/login` - User login
- `POST /api/users/refresh-token` - Refresh access token
- `POST /api/users/logout` - Logout
- `POST /api/users/forgot-password` - Forgot password
- `POST /api/users/reset-password` - Reset password
- `POST /api/users/verify-email/:token` - Verify email
- `POST /api/users/resend-verification` - Resend verification email
- `POST /api/signup-hr` - HR signup
- `POST /api/login-hr` - HR login
- `POST /api/refresh-token-hr` - HR refresh token

### Jobs (Protected)
- `POST /api/jobs` - Create job (HR only)
- `POST /api/apply` - Apply for job

### Profile (Protected)
- `GET /api/enhanced-profile` - Get profile
- `PUT /api/enhanced-profile` - Update profile
- `PUT /api/enhanced-profile/skills` - Update skills
- `POST /api/enhanced-profile/education` - Add education
- `POST /api/enhanced-profile/experience` - Add experience
- `DELETE /api/enhanced-profile/education/:id` - Delete education
- `DELETE /api/enhanced-profile/experience/:id` - Delete experience

### Applications (Protected)
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update application status (HR)

### Saved Jobs (Protected)
- `GET /api/saved-jobs` - Get saved jobs
- `POST /api/saved-jobs` - Save a job
- `DELETE /api/saved-jobs/:id` - Unsave a job

### File Upload (Protected)
- `POST /api/upload/resume` - Upload resume
- `POST /api/upload/photo` - Upload profile photo

### Other
- `POST /api/contact` - Submit contact form
- `GET /api/applicants` - Get applicants (HR)

## 🔧 Environment Variables

Create a `.env` file with:

```env
# Server
PORT=15000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=swapnil_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email (Optional - for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

## 📦 Installation

```bash
npm install
```

## 🏃 Running

```bash
node server.js
```

Server runs on `http://localhost:15000`

## 🗄️ Database

The database is automatically synced using Sequelize. Tables are created/updated on server start.

## 📝 Features

- ✅ User & HR Authentication (JWT)
- ✅ Email Verification
- ✅ Password Reset
- ✅ Job Search & Filtering
- ✅ Job Application
- ✅ Saved Jobs (Bookmark)
- ✅ Application Status Tracking
- ✅ Enhanced User Profiles
- ✅ File Upload (Resume/Photo)
- ✅ Refresh Token Mechanism

