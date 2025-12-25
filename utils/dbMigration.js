import sequelize from "../config/db.js";

// Run this script to add new columns to existing tables
// node utils/dbMigration.js

// Helper function to check if column exists
const columnExists = async (table, column) => {
  try {
    const [results] = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      { replacements: [table, column] }
    );
    return results.length > 0;
  } catch (err) {
    return false;
  }
};

// Helper function to add column if not exists
const addColumnIfNotExists = async (table, column, definition) => {
  const exists = await columnExists(table, column);
  if (!exists) {
    await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`✅ Added ${column} to ${table}`);
    return true;
  } else {
    console.log(`⏭️  ${column} already exists in ${table}`);
    return false;
  }
};

const runMigrations = async () => {
  try {
    console.log("🔄 Running database migrations...\n");

    // Add new columns to Users table
    await addColumnIfNotExists('users', 'isEmailVerified', 'BOOLEAN DEFAULT false');
    await addColumnIfNotExists('users', 'emailVerificationToken', 'VARCHAR(255)');
    await addColumnIfNotExists('users', 'emailVerificationExpires', 'DATETIME');
    await addColumnIfNotExists('users', 'passwordResetToken', 'VARCHAR(255)');
    await addColumnIfNotExists('users', 'passwordResetExpires', 'DATETIME');
    await addColumnIfNotExists('users', 'refreshToken', 'VARCHAR(500)');

    // Add status column to applicants table (try both schemas)
    try {
      await addColumnIfNotExists('applicants', 'status', "ENUM('pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired') DEFAULT 'pending'");
      await addColumnIfNotExists('applicants', 'notes', 'TEXT');
    } catch (err) {
      // Try with swapnil_db schema
      try {
        await sequelize.query(`ALTER TABLE swapnil_db.applicants ADD COLUMN status ENUM('pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired') DEFAULT 'pending'`);
        console.log("✅ Added status column to swapnil_db.applicants");
      } catch (e) {
        console.log("⏭️  status column might already exist or table not found");
      }
      try {
        await sequelize.query(`ALTER TABLE swapnil_db.applicants ADD COLUMN notes TEXT`);
        console.log("✅ Added notes column to swapnil_db.applicants");
      } catch (e) {
        console.log("⏭️  notes column might already exist or table not found");
      }
    }

    // Create saved_jobs table if not exists
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS saved_jobs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          job_id INT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_save (user_id, job_id)
        )
      `);
      console.log("✅ Created saved_jobs table");
    } catch (err) {
      if (err.original?.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log("⏭️  saved_jobs table already exists");
      } else {
        console.log("⚠️  saved_jobs:", err.message);
      }
    }

    // Create profiles table if not exists
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS profiles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          photo VARCHAR(500),
          resume VARCHAR(500),
          headline VARCHAR(255),
          summary TEXT,
          currentLocation VARCHAR(255),
          preferredLocations JSON,
          experience JSON,
          education JSON,
          skills JSON,
          certifications JSON,
          expectedSalary VARCHAR(100),
          noticePeriod VARCHAR(100),
          jobType ENUM('full-time', 'part-time', 'contract', 'internship', 'remote'),
          linkedinUrl VARCHAR(500),
          githubUrl VARCHAR(500),
          portfolioUrl VARCHAR(500),
          isProfilePublic BOOLEAN DEFAULT true,
          isOpenToWork BOOLEAN DEFAULT true,
          completionPercentage INT DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Created profiles table");
    } catch (err) {
      if (err.original?.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log("⏭️  profiles table already exists");
      } else {
        console.log("⚠️  profiles:", err.message);
      }
    }

    console.log("\n✅ Database migrations completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

runMigrations();

