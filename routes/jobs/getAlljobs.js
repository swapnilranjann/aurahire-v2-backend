import express from 'express';\nimport { verifyToken } from '../../middleware/auth.js';
import sequelize from "../config/db.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Middleware to verify JWT token


// GET all jobs with search and filters (Public Route - no auth required for browsing)
router.get('/', async (req, res) => {
  try {
    const { keyword, location, category, company, page = 1, limit = 10 } = req.query;
    
    let whereConditions = [];
    let replacements = [];

    // Keyword search (searches in title, description, company)
    if (keyword) {
      whereConditions.push(`(title LIKE ? OR description LIKE ? OR company LIKE ?)`);
      const keywordPattern = `%${keyword}%`;
      replacements.push(keywordPattern, keywordPattern, keywordPattern);
    }

    // Location filter
    if (location) {
      whereConditions.push(`location LIKE ?`);
      replacements.push(`%${location}%`);
    }

    // Category filter
    if (category) {
      whereConditions.push(`category LIKE ?`);
      replacements.push(`%${category}%`);
    }

    // Company filter
    if (company) {
      whereConditions.push(`company LIKE ?`);
      replacements.push(`%${company}%`);
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    replacements.push(parseInt(limit), offset);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM job ${whereClause}`;
    const [countResult] = await sequelize.query(countQuery, {
      replacements: replacements.slice(0, -2), // Exclude limit and offset
    });

    // Get jobs with pagination
    const jobsQuery = `
      SELECT id, category, company, description, location, title, hr_id, created_on 
      FROM job 
      ${whereClause}
      ORDER BY created_on DESC
      LIMIT ? OFFSET ?
    `;

    const [jobs] = await sequelize.query(jobsQuery, { replacements });

    res.status(200).json({
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
        totalJobs: countResult[0].total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET job categories for filter dropdown (Public Route)
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await sequelize.query(`
      SELECT DISTINCT category FROM job WHERE category IS NOT NULL ORDER BY category;
    `);
    res.status(200).json(categories.map(c => c.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET job locations for filter dropdown (Public Route)
router.get('/locations', async (req, res) => {
  try {
    const [locations] = await sequelize.query(`
      SELECT DISTINCT location FROM job WHERE location IS NOT NULL ORDER BY location;
    `);
    res.status(200).json(locations.map(l => l.location));
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
