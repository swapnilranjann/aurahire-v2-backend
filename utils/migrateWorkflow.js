import sequelize from "../config/db.js";

export const migrateWorkflow = async () => {
  try {
    console.log("🔄 Starting workflow migration...");

    // Add new columns to applicants table if they don't exist
    await sequelize.query(`
      ALTER TABLE applicants 
      ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50) DEFAULT 'application_check',
      ADD COLUMN IF NOT EXISTS stage_status VARCHAR(50) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS total_interview_rounds INT DEFAULT 3,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
    `).catch(err => {
      if (!err.message.includes('Duplicate column')) {
        console.error("Error adding columns to applicants:", err);
      }
    });

    // Create application_stages table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS application_stages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        stage VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        interview_type VARCHAR(50),
        scheduled_date DATE,
        scheduled_time TIME,
        interview_link VARCHAR(500),
        interviewer_name VARCHAR(255),
        interviewer_email VARCHAR(255),
        notes TEXT,
        feedback TEXT,
        score INT,
        completed_at DATETIME,
        created_by INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applicants(id) ON DELETE CASCADE,
        INDEX idx_application_id (application_id),
        INDEX idx_stage (stage),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `).catch(err => {
      if (!err.message.includes('already exists')) {
        console.error("Error creating application_stages table:", err);
      }
    });

    // Update existing applications to have initial stage
    await sequelize.query(`
      UPDATE applicants 
      SET current_stage = 'application_check', 
          stage_status = CASE 
            WHEN status = 'rejected' THEN 'rejected'
            WHEN status = 'hired' THEN 'hired'
            ELSE 'pending'
          END
      WHERE current_stage IS NULL OR current_stage = ''
    `);

    console.log("✅ Workflow migration completed!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  }
};

