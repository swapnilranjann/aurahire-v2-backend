import express from 'express';
import sequelize from '../config/db.js'; // Import the Sequelize instance
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // User info is available in req.user
    next();
  });
};

// Route to create a job
router.post('/', authenticateJWT, async (req, res) => {
  const { category, company, description, location, title } = req.body;
  const hr_id = req.user.id; // Get HR ID from authenticated token

  // Ensure all required fields are provided
  if (!category || !company || !description || !location || !title) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Prepare the SQL query
  const query = `
    INSERT INTO job (category, company, description, location, title, hr_id, created_on)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [category, company, description, location, title, hr_id];

  try {
    // Execute the query using sequelize.query (raw query)
    const [result] = await sequelize.query(query, {
      replacements: values,  // Use replacements for SQL injection protection
      type: sequelize.QueryTypes.INSERT, // Specify the query type
    });

    const jobId = result.insertId || result[0]?.insertId;

    res.status(201).json({ 
      message: 'Job created successfully!',
      job_id: jobId 
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job. Please try again.' });
  }
});

// Route to get all jobs posted by HR user
router.get('/my-jobs', authenticateJWT, async (req, res) => {
  try {
    const hrId = req.user.id;

    const query = `
      SELECT id, category, company, description, location, title, hr_id, created_on
      FROM job
      WHERE hr_id = ?
      ORDER BY created_on DESC
    `;

    const [jobs] = await sequelize.query(query, {
      replacements: [hrId],
      type: sequelize.QueryTypes.SELECT,
    });

    // Ensure we always return an array
    const jobsArray = Array.isArray(jobs) ? jobs : (jobs ? [jobs] : []);
    res.status(200).json(jobsArray);
  } catch (error) {
    console.error('Error fetching HR jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs. Please try again.' });
  }
});

// Route to update a job (only by the HR who created it)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const hrId = req.user.id;
    const { category, company, description, location, title } = req.body;

    // Validate required fields
    if (!category || !company || !description || !location || !title) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // First, check if job exists and belongs to this HR
    const [existingJob] = await sequelize.query(
      `SELECT id, hr_id FROM job WHERE id = ?`,
      {
        replacements: [jobId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (existingJob.hr_id !== hrId) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own jobs.' });
    }

    // Update the job
    const updateQuery = `
      UPDATE job
      SET category = ?, company = ?, description = ?, location = ?, title = ?
      WHERE id = ? AND hr_id = ?
    `;

    await sequelize.query(updateQuery, {
      replacements: [category, company, description, location, title, jobId, hrId],
      type: sequelize.QueryTypes.UPDATE,
    });

    res.status(200).json({ message: 'Job updated successfully!' });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job. Please try again.' });
  }
});

// Route to delete a job (only by the HR who created it)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const hrId = req.user.id;

    // First, check if job exists and belongs to this HR
    const [existingJob] = await sequelize.query(
      `SELECT id, hr_id FROM job WHERE id = ?`,
      {
        replacements: [jobId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    if (existingJob.hr_id !== hrId) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own jobs.' });
    }

    // Delete the job
    await sequelize.query(
      `DELETE FROM job WHERE id = ? AND hr_id = ?`,
      {
        replacements: [jobId, hrId],
        type: sequelize.QueryTypes.DELETE,
      }
    );

    res.status(200).json({ message: 'Job deleted successfully!' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job. Please try again.' });
  }
});

export default router;
