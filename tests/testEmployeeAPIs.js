import axios from 'axios';
import dotenv from 'dotenv';
import sequelize from '../config/db.js';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:15000';
let accessToken = '';
let refreshToken = '';
let userId = '';
let testJobId = null;
let savedJobId = null;
let applicationId = null;
let alertId = null;
let resumeId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');
const logSection = (message) => log(`\n${'='.repeat(60)}\n${message}\n${'='.repeat(60)}`, 'cyan');

// Test helper function
const testAPI = async (name, method, url, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
};

// ============================================
// AUTHENTICATION TESTS
// ============================================
async function testAuthentication() {
  logSection('🔐 AUTHENTICATION APIs');

  // 1. User Signup
  logInfo('1. Testing User Signup...');
  const signupData = {
    name: 'Test Employee',
    email: `testemployee${Date.now()}@test.com`,
    password: 'Test@123456',
    role: 'user',
  };

  let result = await testAPI('Signup', 'POST', '/api/users/signup', signupData);
  if (result.success) {
    logSuccess(`Signup successful: ${signupData.email}`);
    userId = result.data.user?.id || result.data.id;
  } else {
    logError(`Signup failed: ${JSON.stringify(result.error)}`);
    // Try login if user already exists
    logInfo('User might exist, trying login...');
    result = await testAPI('Login', 'POST', '/api/users/login', {
      email: signupData.email,
      password: signupData.password,
    });
    if (result.success) {
      accessToken = result.data.accessToken;
      refreshToken = result.data.refreshToken;
      userId = result.data.user?.id;
      logSuccess('Login successful (user exists)');
    } else {
      logError('Both signup and login failed');
      return false;
    }
  }

  // 2. User Login
  if (!accessToken) {
    logInfo('2. Testing User Login...');
    result = await testAPI('Login', 'POST', '/api/users/login', {
      email: signupData.email,
      password: signupData.password,
    });
    if (result.success) {
      accessToken = result.data.accessToken;
      refreshToken = result.data.refreshToken;
      userId = result.data.user?.id;
      logSuccess('Login successful');
    } else {
      logError(`Login failed: ${JSON.stringify(result.error)}`);
      return false;
    }
  }

  // 3. Refresh Token
  logInfo('3. Testing Refresh Token...');
  result = await testAPI('Refresh Token', 'POST', '/api/users/refresh-token', {
    refreshToken,
  });
  if (result.success) {
    accessToken = result.data.accessToken;
    logSuccess('Token refreshed successfully');
  } else {
    logWarning(`Refresh token failed: ${JSON.stringify(result.error)}`);
  }

  return true;
}

// ============================================
// PROFILE APIs
// ============================================
async function testProfile() {
  logSection('👤 PROFILE APIs');

  const headers = { Authorization: `Bearer ${accessToken}` };

  // 1. Get Profile
  logInfo('1. Testing GET Profile...');
  let result = await testAPI('Get Profile', 'GET', '/api/enhanced-profile', null, headers);
  if (result.success) {
    logSuccess('Profile retrieved successfully');
  } else {
    logError(`Get profile failed: ${JSON.stringify(result.error)}`);
  }

  // 2. Update Profile
  logInfo('2. Testing UPDATE Profile...');
  const profileData = {
    phone: '+1234567890',
    bio: 'Experienced software developer',
    location: 'New York, USA',
    skills: ['JavaScript', 'React', 'Node.js'],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'Test University',
        year: '2020',
      },
    ],
    experience: [
      {
        title: 'Software Developer',
        company: 'Test Company',
        startDate: '2021-01-01',
        endDate: '2023-12-31',
        description: 'Developed web applications',
      },
    ],
  };
  result = await testAPI('Update Profile', 'PUT', '/api/enhanced-profile', profileData, headers);
  if (result.success) {
    logSuccess('Profile updated successfully');
  } else {
    logError(`Update profile failed: ${JSON.stringify(result.error)}`);
  }

  // 3. Get Profile Completion
  logInfo('3. Testing GET Profile Completion...');
  result = await testAPI('Get Completion', 'GET', '/api/enhanced-profile/completion', null, headers);
  if (result.success) {
    logSuccess(`Profile completion: ${result.data.completion || 0}%`);
  } else {
    logWarning(`Get completion failed: ${JSON.stringify(result.error)}`);
  }
}

// ============================================
// JOB APIs (Read)
// ============================================
async function testJobRead() {
  logSection('💼 JOB READ APIs');

  // 1. Get All Jobs
  logInfo('1. Testing GET All Jobs...');
  let result = await testAPI('Get All Jobs', 'GET', '/api/jobs');
  if (result.success) {
    const jobs = result.data.jobs || result.data;
    logSuccess(`Retrieved ${jobs.length} jobs`);
    if (jobs.length > 0) {
      testJobId = jobs[0].id;
      logInfo(`Using job ID ${testJobId} for further tests`);
    }
  } else {
    logError(`Get all jobs failed: ${JSON.stringify(result.error)}`);
  }

  // 2. Get Job Categories
  logInfo('2. Testing GET Job Categories...');
  result = await testAPI('Get Categories', 'GET', '/api/jobs/categories');
  if (result.success) {
    logSuccess(`Retrieved ${result.data.length} categories`);
  } else {
    logError(`Get categories failed: ${JSON.stringify(result.error)}`);
  }

  // 3. Get Job Locations
  logInfo('3. Testing GET Job Locations...');
  result = await testAPI('Get Locations', 'GET', '/api/jobs/locations');
  if (result.success) {
    logSuccess(`Retrieved ${result.data.length} locations`);
  } else {
    logError(`Get locations failed: ${JSON.stringify(result.error)}`);
  }

  // 4. Get Job Details
  if (testJobId) {
    logInfo('4. Testing GET Job Details...');
    result = await testAPI('Get Job Details', 'GET', `/api/job/${testJobId}`);
    if (result.success) {
      logSuccess('Job details retrieved successfully');
    } else {
      logError(`Get job details failed: ${JSON.stringify(result.error)}`);
    }
  }

  // 5. Search Jobs with Filters
  logInfo('5. Testing GET Jobs with Filters...');
  result = await testAPI('Search Jobs', 'GET', '/api/jobs?keyword=developer&location=Bangalore');
  if (result.success) {
    const jobs = result.data.jobs || result.data;
    logSuccess(`Search returned ${jobs.length} jobs`);
  } else {
    logWarning(`Search failed: ${JSON.stringify(result.error)}`);
  }
}

// ============================================
// SAVED JOBS APIs
// ============================================
async function testSavedJobs() {
  logSection('⭐ SAVED JOBS APIs');

  const headers = { Authorization: `Bearer ${accessToken}` };

  if (!testJobId) {
    logWarning('No job ID available, skipping saved jobs tests');
    return;
  }

  // 1. Save Job (POST)
  logInfo('1. Testing POST Save Job...');
  let result = await testAPI('Save Job', 'POST', `/api/saved-jobs/${testJobId}`, null, headers);
  if (result.success) {
    savedJobId = result.data.savedJob?.id || result.data.id;
    logSuccess('Job saved successfully');
  } else {
    logError(`Save job failed: ${JSON.stringify(result.error)}`);
  }

  // 2. Get All Saved Jobs (GET)
  logInfo('2. Testing GET All Saved Jobs...');
  result = await testAPI('Get Saved Jobs', 'GET', '/api/saved-jobs', null, headers);
  if (result.success) {
    const savedJobs = result.data.savedJobs || result.data;
    logSuccess(`Retrieved ${savedJobs.length} saved jobs`);
  } else {
    logError(`Get saved jobs failed: ${JSON.stringify(result.error)}`);
  }

  // 3. Delete Saved Job (DELETE)
  if (savedJobId || testJobId) {
    logInfo('3. Testing DELETE Saved Job...');
    const deleteId = savedJobId || testJobId;
    result = await testAPI('Delete Saved Job', 'DELETE', `/api/saved-jobs/${deleteId}`, null, headers);
    if (result.success) {
      logSuccess('Saved job deleted successfully');
    } else {
      logError(`Delete saved job failed: ${JSON.stringify(result.error)}`);
    }
  }
}

// ============================================
// APPLICATION APIs
// ============================================
async function testApplications() {
  logSection('📝 APPLICATION APIs');

  const headers = { Authorization: `Bearer ${accessToken}` };

  if (!testJobId) {
    logWarning('No job ID available, skipping application tests');
    return;
  }

  // 1. Apply for Job (POST)
  logInfo('1. Testing POST Apply for Job...');
  // Get user info from token
  const [userInfo] = await sequelize.query(
    `SELECT id, name, email FROM users WHERE id = ?`,
    { replacements: [userId], type: sequelize.QueryTypes.SELECT }
  );
  const applicationData = {
    user_id: userId,
    name: userInfo?.name || 'Test Employee',
    email: userInfo?.email || `testemployee${Date.now()}@test.com`,
    job_id: testJobId,
  };
  let result = await testAPI('Apply Job', 'POST', `/api/apply/${testJobId}`, applicationData, headers);
  if (result.success) {
    applicationId = result.data.application?.id || result.data.id;
    logSuccess('Job application submitted successfully');
  } else {
    logError(`Apply job failed: ${JSON.stringify(result.error)}`);
  }

  // 2. Get My Applications (GET)
  logInfo('2. Testing GET My Applications...');
  result = await testAPI('Get Applications', 'GET', '/api/applications/my-applications', null, headers);
  if (result.success) {
    const applications = result.data.applications || result.data;
    logSuccess(`Retrieved ${applications.length} applications`);
    if (applications.length > 0 && !applicationId) {
      applicationId = applications[0].id;
    }
  } else {
    logError(`Get applications failed: ${JSON.stringify(result.error)}`);
  }

  // 3. Get Application Workflow (GET)
  if (applicationId) {
    logInfo('3. Testing GET Application Workflow...');
    result = await testAPI('Get Workflow', 'GET', `/api/applications/my-applications/${applicationId}/workflow`, null, headers);
    if (result.success) {
      logSuccess('Application workflow retrieved successfully');
    } else {
      logWarning(`Get workflow failed: ${JSON.stringify(result.error)}`);
    }
  }

  // 4. Withdraw Application (DELETE)
  if (applicationId) {
    logInfo('4. Testing DELETE Withdraw Application...');
    result = await testAPI('Withdraw Application', 'DELETE', `/api/applications/my-applications/${applicationId}`, null, headers);
    if (result.success) {
      logSuccess('Application withdrawn successfully');
    } else {
      logWarning(`Withdraw application failed: ${JSON.stringify(result.error)}`);
    }
  }
}

// ============================================
// JOB ALERTS APIs
// ============================================
async function testJobAlerts() {
  logSection('🔔 JOB ALERTS APIs');

  const headers = { Authorization: `Bearer ${accessToken}` };

  // 1. Create Job Alert (POST)
  logInfo('1. Testing POST Create Job Alert...');
  const alertData = {
    keywords: 'developer',
    location: 'Bangalore',
    category: 'IT',
    frequency: 'daily',
  };
  let result = await testAPI('Create Alert', 'POST', '/api/job-alerts', alertData, headers);
  if (result.success) {
    alertId = result.data.alert?.id || result.data.id;
    logSuccess('Job alert created successfully');
  } else {
    logError(`Create alert failed: ${JSON.stringify(result.error)}`);
  }

  // 2. Get All Job Alerts (GET)
  logInfo('2. Testing GET All Job Alerts...');
  result = await testAPI('Get Alerts', 'GET', '/api/job-alerts', null, headers);
  if (result.success) {
    const alerts = result.data.alerts || result.data;
    logSuccess(`Retrieved ${alerts.length} job alerts`);
    if (alerts.length > 0 && !alertId) {
      alertId = alerts[0].id;
    }
  } else {
    logError(`Get alerts failed: ${JSON.stringify(result.error)}`);
  }

  // 3. Update Job Alert (PUT)
  if (alertId) {
    logInfo('3. Testing PUT Update Job Alert...');
    result = await testAPI('Update Alert', 'PUT', `/api/job-alerts/${alertId}`, {
      keywords: 'software engineer',
      frequency: 'weekly',
    }, headers);
    if (result.success) {
      logSuccess('Job alert updated successfully');
    } else {
      logWarning(`Update alert failed: ${JSON.stringify(result.error)}`);
    }
  }

  // 4. Delete Job Alert (DELETE)
  if (alertId) {
    logInfo('4. Testing DELETE Job Alert...');
    result = await testAPI('Delete Alert', 'DELETE', `/api/job-alerts/${alertId}`, null, headers);
    if (result.success) {
      logSuccess('Job alert deleted successfully');
    } else {
      logWarning(`Delete alert failed: ${JSON.stringify(result.error)}`);
    }
  }
}

// ============================================
// RESUME BUILDER APIs
// ============================================
async function testResumeBuilder() {
  logSection('📄 RESUME BUILDER APIs');

  const headers = { Authorization: `Bearer ${accessToken}` };

  // 1. Get Resume (GET)
  logInfo('1. Testing GET Resume...');
  let result = await testAPI('Get Resume', 'GET', '/api/resume', null, headers);
  if (result.success) {
    logSuccess('Resume retrieved successfully');
    resumeId = result.data.resume?.id;
  } else {
    logWarning(`Get resume failed: ${JSON.stringify(result.error)}`);
  }

  // 2. Create/Update Resume (POST)
  logInfo('2. Testing POST Create Resume...');
  const resumeData = {
    personalInfo: {
      name: 'Test Employee',
      email: `testemployee${Date.now()}@test.com`,
      phone: '+1234567890',
      location: 'New York, USA',
    },
    summary: 'Experienced software developer',
    experience: [
      {
        title: 'Software Developer',
        company: 'Test Company',
        duration: '2021-2023',
        description: 'Developed web applications',
      },
    ],
    education: [
      {
        degree: 'BS Computer Science',
        institution: 'Test University',
        year: '2020',
      },
    ],
    skills: ['JavaScript', 'React', 'Node.js'],
  };
  result = await testAPI('Create Resume', 'POST', '/api/resume', resumeData, headers);
  if (result.success) {
    logSuccess('Resume created/updated successfully');
  } else {
    logError(`Create resume failed: ${JSON.stringify(result.error)}`);
  }

  // 3. Download Resume (GET)
  logInfo('3. Testing GET Download Resume...');
  result = await testAPI('Download Resume', 'GET', '/api/resume/download', null, headers);
  if (result.success) {
    logSuccess('Resume download initiated');
  } else {
    logWarning(`Download resume failed: ${JSON.stringify(result.error)}`);
  }
}

// ============================================
// SKILL TESTS APIs
// ============================================
async function testSkillTests() {
  logSection('🧪 SKILL TESTS APIs');

  const headers = { Authorization: `Bearer ${accessToken}` };

  // 1. Get All Skill Tests (GET)
  logInfo('1. Testing GET All Skill Tests...');
  let result = await testAPI('Get Skill Tests', 'GET', '/api/skill-tests', null, headers);
  if (result.success) {
    const tests = result.data.tests || result.data;
    logSuccess(`Retrieved ${tests.length} skill tests`);
  } else {
    logError(`Get skill tests failed: ${JSON.stringify(result.error)}`);
  }

  // 2. Get Test Results (GET)
  logInfo('2. Testing GET Test Results...');
  result = await testAPI('Get Results', 'GET', '/api/skill-tests/results', null, headers);
  if (result.success) {
    const results = result.data.results || result.data;
    logSuccess(`Retrieved ${results.length} test results`);
  } else {
    logWarning(`Get results failed: ${JSON.stringify(result.error)}`);
  }
}

// ============================================
// CAREER ADVICE APIs
// ============================================
async function testCareerAdvice() {
  logSection('📚 CAREER ADVICE APIs');

  // 1. Get All Articles (GET)
  logInfo('1. Testing GET All Career Advice...');
  let result = await testAPI('Get Articles', 'GET', '/api/career-advice');
  if (result.success) {
    const articles = result.data.articles || result.data;
    logSuccess(`Retrieved ${articles.length} articles`);
  } else {
    logError(`Get articles failed: ${JSON.stringify(result.error)}`);
  }

  // 2. Get Featured Articles (GET)
  logInfo('2. Testing GET Featured Articles...');
  result = await testAPI('Get Featured', 'GET', '/api/career-advice/featured');
  if (result.success) {
    const articles = result.data.articles || result.data;
    logSuccess(`Retrieved ${articles.length} featured articles`);
  } else {
    logWarning(`Get featured failed: ${JSON.stringify(result.error)}`);
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 STARTING EMPLOYEE API TESTS', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  try {
    // Authentication
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
      logError('Authentication failed. Stopping tests.');
      return;
    }

    // Wait a bit between tests
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Profile
    await testProfile();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Job Read
    await testJobRead();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Saved Jobs
    await testSavedJobs();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Applications
    await testApplications();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Job Alerts
    await testJobAlerts();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Resume Builder
    await testResumeBuilder();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Skill Tests
    await testSkillTests();
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Career Advice
    await testCareerAdvice();

    logSection('✅ ALL TESTS COMPLETED');
    logInfo(`Test Summary:`);
    logInfo(`- User ID: ${userId}`);
    logInfo(`- Job ID: ${testJobId || 'N/A'}`);
    logInfo(`- Application ID: ${applicationId || 'N/A'}`);
    logInfo(`- Alert ID: ${alertId || 'N/A'}`);
  } catch (error) {
    logError(`Test execution error: ${error.message}`);
    console.error(error);
  }
}

// Run tests
runAllTests().catch(console.error);

