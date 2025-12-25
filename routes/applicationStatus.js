import express from "express";
import jwt from "jsonwebtoken";
import sequelize from "../config/db.js";
import { sendApplicationStatusEmail } from "../utils/emailService.js";
import ApplicationStage from "../models/ApplicationStage.js";

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

// ✅ Get all applications for a user (Job Seeker)
router.get("/my-applications", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [applications] = await sequelize.query(
      `SELECT a.id, a.job_id, a.status, a.notes, a.created_on,
              a.current_stage, a.stage_status,
              j.title, j.company, j.location, j.category
       FROM applicants a
       JOIN job j ON a.job_id = j.id
       WHERE a.user_id = ?
       ORDER BY a.created_on DESC`,
      { replacements: [userId] }
    );

    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get application workflow for applicant
router.get("/my-applications/:id/workflow", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = parseInt(req.params.id);

    // Get application
    const [application] = await sequelize.query(
      `SELECT a.*, j.title as job_title, j.company 
       FROM applicants a 
       JOIN job j ON a.job_id = j.id 
       WHERE a.id = ? AND a.user_id = ?`,
      { replacements: [applicationId, userId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Get all stages for this application
    const stages = await ApplicationStage.findAll({
      where: { application_id: applicationId },
      order: [['createdAt', 'ASC']],
    });

    res.json({
      application,
      stages: stages.map(s => s.toJSON()),
      current_stage: application.current_stage || 'application_check',
      stage_status: application.stage_status || 'pending',
    });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get application details
router.get("/my-applications/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = parseInt(req.params.id);

    const [application] = await sequelize.query(
      `SELECT a.*, j.title, j.company, j.location, j.category, j.description
       FROM applicants a
       JOIN job j ON a.job_id = j.id
       WHERE a.id = ? AND a.user_id = ?`,
      { replacements: [applicationId, userId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Withdraw application (User)
router.delete("/my-applications/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = parseInt(req.params.id);

    // Check if application exists and belongs to user
    const [application] = await sequelize.query(
      `SELECT * FROM applicants WHERE id = ? AND user_id = ?`,
      { replacements: [applicationId, userId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Only allow withdrawal if status is pending
    if (application.status && application.status !== 'pending') {
      return res.status(400).json({ error: "Cannot withdraw application that has been processed" });
    }

    await sequelize.query(
      `DELETE FROM applicants WHERE id = ? AND user_id = ?`,
      { replacements: [applicationId, userId] }
    );

    res.json({ message: "Application withdrawn successfully" });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get all applicants for HR (with status filter)
router.get("/hr/applicants", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;
    const { status, job_id } = req.query;

    let query = `
      SELECT a.id, a.user_id, a.email, a.name, a.job_id, a.status, a.notes, a.created_on,
             a.current_stage, a.stage_status,
             j.title as job_title, j.company
      FROM applicants a
      JOIN job j ON a.job_id = j.id
      WHERE a.hr_id = ?
    `;
    
    const replacements = [hrId];

    if (status) {
      query += ` AND a.status = ?`;
      replacements.push(status);
    }

    if (job_id) {
      query += ` AND a.job_id = ?`;
      replacements.push(parseInt(job_id));
    }

    query += ` ORDER BY a.created_on DESC`;

    const [applicants] = await sequelize.query(query, { replacements });

    res.json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Update application status (HR only)
router.put("/hr/applicants/:id/status", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;
    const applicationId = parseInt(req.params.id);
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Check if application belongs to HR's job
    const [application] = await sequelize.query(
      `SELECT a.*, j.title as job_title FROM applicants a 
       JOIN job j ON a.job_id = j.id 
       WHERE a.id = ? AND a.hr_id = ?`,
      { replacements: [applicationId, hrId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Update status
    await sequelize.query(
      `UPDATE applicants SET status = ?, notes = ? WHERE id = ?`,
      { replacements: [status, notes || null, applicationId] }
    );

    // Send email notification to applicant
    await sendApplicationStatusEmail(
      application.email,
      application.name,
      application.job_title,
      status
    );

    res.json({ message: "Application status updated successfully" });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get application stats for HR dashboard
router.get("/hr/stats", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;

    const [stats] = await sequelize.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' OR status IS NULL THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
        SUM(CASE WHEN status = 'shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN status = 'interview' THEN 1 ELSE 0 END) as interview,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired
       FROM applicants WHERE hr_id = ?`,
      { replacements: [hrId] }
    );

    res.json(stats[0]);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ============ WORKFLOW MANAGEMENT ROUTES ============

// Get application with full workflow history
router.get("/hr/applicants/:id/workflow", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;
    const applicationId = parseInt(req.params.id);

    // Verify application belongs to HR
    const [application] = await sequelize.query(
      `SELECT a.*, j.title as job_title, j.company 
       FROM applicants a 
       JOIN job j ON a.job_id = j.id 
       WHERE a.id = ? AND a.hr_id = ?`,
      { replacements: [applicationId, hrId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Get all stages for this application
    const stages = await ApplicationStage.findAll({
      where: { application_id: applicationId },
      order: [['createdAt', 'ASC']],
    });

    res.json({
      application,
      stages: stages.map(s => s.toJSON()),
      current_stage: application.current_stage || 'application_check',
      stage_status: application.stage_status || 'pending',
    });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Move application to next stage
router.post("/hr/applicants/:id/next-stage", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;
    const applicationId = parseInt(req.params.id);
    const { notes, feedback, score } = req.body;

    // Get current application
    const [application] = await sequelize.query(
      `SELECT a.*, j.title as job_title FROM applicants a 
       JOIN job j ON a.job_id = j.id 
       WHERE a.id = ? AND a.hr_id = ?`,
      { replacements: [applicationId, hrId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.current_stage === 'hired' || application.current_stage === 'rejected') {
      return res.status(400).json({ error: "Cannot move from final stage" });
    }

    // Define stage progression
    const stageOrder = [
      'application_check',
      'interview_round_1',
      'interview_round_2',
      'interview_round_3',
      'aptitude_test',
      'video_call_interview',
      'programming_interview',
      'release_letter_round',
      'hired'
    ];

    const currentIndex = stageOrder.indexOf(application.current_stage || 'application_check');
    if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
      return res.status(400).json({ error: "No next stage available" });
    }

    const nextStage = stageOrder[currentIndex + 1];

    // Complete current stage
    await ApplicationStage.create({
      application_id: applicationId,
      stage: application.current_stage || 'application_check',
      status: 'passed',
      notes: notes || null,
      feedback: feedback || null,
      score: score || null,
      completed_at: new Date(),
      created_by: hrId,
    });

    // Update application to next stage
    await sequelize.query(
      `UPDATE applicants SET current_stage = ?, stage_status = 'pending' WHERE id = ?`,
      { replacements: [nextStage, applicationId] }
    );

    // Send email notification
    await sendApplicationStatusEmail(
      application.email,
      application.name,
      application.job_title,
      `Moved to ${nextStage.replace(/_/g, ' ')}`
    );

    res.json({ 
      message: "Application moved to next stage",
      current_stage: nextStage,
      stage_status: 'pending'
    });
  } catch (error) {
    console.error("Error moving to next stage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Reject application at current stage
router.post("/hr/applicants/:id/reject", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;
    const applicationId = parseInt(req.params.id);
    const { rejection_reason, notes } = req.body;

    // Get current application
    const [application] = await sequelize.query(
      `SELECT a.*, j.title as job_title FROM applicants a 
       JOIN job j ON a.job_id = j.id 
       WHERE a.id = ? AND a.hr_id = ?`,
      { replacements: [applicationId, hrId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Record rejection in stage history
    await ApplicationStage.create({
      application_id: applicationId,
      stage: application.current_stage || 'application_check',
      status: 'rejected',
      notes: notes || null,
      feedback: rejection_reason || null,
      completed_at: new Date(),
      created_by: hrId,
    });

    // Update application status
    await sequelize.query(
      `UPDATE applicants SET 
        status = 'rejected',
        current_stage = 'rejected',
        stage_status = 'rejected',
        rejection_reason = ?
       WHERE id = ?`,
      { replacements: [rejection_reason || null, applicationId] }
    );

    // Send email notification
    await sendApplicationStatusEmail(
      application.email,
      application.name,
      application.job_title,
      'rejected',
      rejection_reason
    );

    res.json({ message: "Application rejected successfully" });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Schedule interview (video call, programming, etc.)
router.post("/hr/applicants/:id/schedule-interview", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;
    const applicationId = parseInt(req.params.id);
    const {
      interview_type,
      scheduled_date,
      scheduled_time,
      interview_link,
      interviewer_name,
      interviewer_email,
      notes
    } = req.body;

    // Get current application
    const [application] = await sequelize.query(
      `SELECT a.*, j.title as job_title FROM applicants a 
       JOIN job j ON a.job_id = j.id 
       WHERE a.id = ? AND a.hr_id = ?`,
      { replacements: [applicationId, hrId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Create or update stage with interview schedule
    const [existingStage] = await sequelize.query(
      `SELECT * FROM application_stages 
       WHERE application_id = ? AND stage = ? 
       ORDER BY createdAt DESC LIMIT 1`,
      { 
        replacements: [applicationId, application.current_stage],
        type: sequelize.QueryTypes.SELECT 
      }
    );

    if (existingStage) {
      // Update existing stage
      await sequelize.query(
        `UPDATE application_stages SET
          interview_type = ?,
          scheduled_date = ?,
          scheduled_time = ?,
          interview_link = ?,
          interviewer_name = ?,
          interviewer_email = ?,
          notes = ?,
          status = 'scheduled'
         WHERE id = ?`,
        {
          replacements: [
            interview_type,
            scheduled_date,
            scheduled_time,
            interview_link || null,
            interviewer_name || null,
            interviewer_email || null,
            notes || null,
            existingStage.id
          ]
        }
      );
    } else {
      // Create new stage
      await ApplicationStage.create({
        application_id: applicationId,
        stage: application.current_stage || 'application_check',
        status: 'scheduled',
        interview_type: interview_type || 'video_call',
        scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
        scheduled_time: scheduled_time || null,
        interview_link: interview_link || null,
        interviewer_name: interviewer_name || null,
        interviewer_email: interviewer_email || null,
        notes: notes || null,
        created_by: hrId,
      });
    }

    // Update application stage status
    await sequelize.query(
      `UPDATE applicants SET stage_status = 'scheduled' WHERE id = ?`,
      { replacements: [applicationId] }
    );

    // Send email notification with interview details
    // TODO: Send detailed interview email with date, time, link

    res.json({ message: "Interview scheduled successfully" });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Complete stage (mark as passed/failed)
router.post("/hr/applicants/:id/complete-stage", verifyToken, async (req, res) => {
  try {
    const hrId = req.user.id;
    const applicationId = parseInt(req.params.id);
    const { status, feedback, score, notes } = req.body;

    if (!['passed', 'failed'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'passed' or 'failed'" });
    }

    // Get current application
    const [application] = await sequelize.query(
      `SELECT a.* FROM applicants a 
       WHERE a.id = ? AND a.hr_id = ?`,
      { replacements: [applicationId, hrId], type: sequelize.QueryTypes.SELECT }
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Update or create stage record
    const [existingStage] = await sequelize.query(
      `SELECT * FROM application_stages 
       WHERE application_id = ? AND stage = ? 
       ORDER BY createdAt DESC LIMIT 1`,
      { 
        replacements: [applicationId, application.current_stage],
        type: sequelize.QueryTypes.SELECT 
      }
    );

    if (existingStage) {
      await sequelize.query(
        `UPDATE application_stages SET
          status = ?,
          feedback = ?,
          score = ?,
          notes = ?,
          completed_at = NOW()
         WHERE id = ?`,
        {
          replacements: [
            status,
            feedback || null,
            score || null,
            notes || null,
            existingStage.id
          ]
        }
      );
    } else {
      await ApplicationStage.create({
        application_id: applicationId,
        stage: application.current_stage || 'application_check',
        status: status,
        feedback: feedback || null,
        score: score || null,
        notes: notes || null,
        completed_at: new Date(),
        created_by: hrId,
      });
    }

    // Update application stage status
    await sequelize.query(
      `UPDATE applicants SET stage_status = ? WHERE id = ?`,
      { replacements: [status, applicationId] }
    );

    // If failed, automatically reject
    if (status === 'failed') {
      await sequelize.query(
        `UPDATE applicants SET 
          status = 'rejected',
          current_stage = 'rejected',
          stage_status = 'rejected',
          rejection_reason = ?
         WHERE id = ?`,
        { replacements: [feedback || 'Failed at current stage', applicationId] }
      );
    }

    res.json({ message: `Stage marked as ${status}` });
  } catch (error) {
    console.error("Error completing stage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get workflow stages configuration
router.get("/hr/workflow-stages", verifyToken, async (req, res) => {
  const stages = [
    { 
      id: 'application_check',
      name: 'Application Check',
      description: 'Initial application review',
      can_reject: true,
      interview_types: []
    },
    { 
      id: 'interview_round_1',
      name: 'Interview Round 1',
      description: 'First round of technical/HR interview',
      can_reject: true,
      interview_types: ['video_call', 'in_person', 'phone']
    },
    { 
      id: 'interview_round_2',
      name: 'Interview Round 2',
      description: 'Second round of interview',
      can_reject: true,
      interview_types: ['video_call', 'in_person', 'phone']
    },
    { 
      id: 'interview_round_3',
      name: 'Interview Round 3',
      description: 'Final interview round',
      can_reject: true,
      interview_types: ['video_call', 'in_person', 'phone']
    },
    { 
      id: 'aptitude_test',
      name: 'Aptitude Test',
      description: 'Aptitude and reasoning test',
      can_reject: true,
      interview_types: ['aptitude']
    },
    { 
      id: 'video_call_interview',
      name: 'Video Call Interview',
      description: 'Video call interview with team',
      can_reject: true,
      interview_types: ['video_call']
    },
    { 
      id: 'programming_interview',
      name: 'Programming Interview',
      description: 'Live coding and programming assessment',
      can_reject: true,
      interview_types: ['programming']
    },
    { 
      id: 'release_letter_round',
      name: 'Release Letter Round',
      description: 'Final documentation and release letter verification',
      can_reject: true,
      interview_types: []
    },
    { 
      id: 'hired',
      name: 'Hired',
      description: 'Candidate has been hired',
      can_reject: false,
      interview_types: []
    },
    { 
      id: 'rejected',
      name: 'Rejected',
      description: 'Application has been rejected',
      can_reject: false,
      interview_types: []
    }
  ];

  res.json(stages);
});

export default router;

