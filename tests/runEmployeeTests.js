#!/usr/bin/env node

/**
 * Employee API Test Runner
 * 
 * This script tests all employee/job seeker APIs:
 * - Authentication (Signup, Login, Refresh Token)
 * - Profile (Get, Update, Completion)
 * - Jobs (Get All, Search, Categories, Locations, Details)
 * - Saved Jobs (Save, Get All, Delete)
 * - Applications (Apply, Get All, Get Workflow, Withdraw)
 * - Job Alerts (Create, Get All, Update, Delete)
 * - Resume Builder (Get, Create/Update, Download)
 * - Skill Tests (Get All, Get Results)
 * - Career Advice (Get All, Get Featured)
 * 
 * Usage: node tests/runEmployeeTests.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runTests() {
  console.log('\n🚀 Starting Employee API Tests...\n');
  
  try {
    const { stdout, stderr } = await execAsync('node tests/testEmployeeAPIs.js');
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
  } catch (error) {
    console.error('Test execution error:', error.message);
    process.exit(1);
  }
}

runTests();

