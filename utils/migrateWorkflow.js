import sequelize from "../config/db.js";

export const migrateWorkflow = async () => {
  try {
    console.log("🔄 Starting workflow migration...");

    // Check and add columns one by one (MySQL doesn't support IF NOT EXISTS for ADD COLUMN)
    const columns = [
      { name: 'current_stage', type: "VARCHAR(50) DEFAULT 'application_check'" },
      { name: 'stage_status', type: "VARCHAR(50) DEFAULT 'pending'" },
      { name: 'total_interview_rounds', type: 'INT DEFAULT 3' },
      { name: 'rejection_reason', type: 'TEXT' }
    ];

    for (const col of columns) {
      try {
        // Check if column exists
        const results = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'applicants' 
          AND COLUMN_NAME = ?
        `, {
          replacements: [col.name],
          type: sequelize.QueryTypes.SELECT
        });

        if (!results || results.length === 0) {
          // Column doesn't exist, add it
          await sequelize.query(`
            ALTER TABLE applicants 
            ADD COLUMN ${col.name} ${col.type}
          `);
          console.log(`✅ Added column: ${col.name}`);
        } else {
          console.log(`✅ Column already exists: ${col.name}`);
        }
      } catch (err) {
        if (err.message.includes('Duplicate column') || err.message.includes('already exists')) {
          console.log(`✅ Column already exists: ${col.name}`);
        } else {
          console.error(`Error adding column ${col.name}:`, err.message);
        }
      }
    }

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

    // Update existing applications to have initial stage (only if columns exist)
    try {
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
      console.log("✅ Updated existing applications with initial stage");
    } catch (err) {
      console.log("⚠️ Could not update applications (columns may not exist yet):", err.message);
    }

    console.log("✅ Workflow migration completed!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  }
};

