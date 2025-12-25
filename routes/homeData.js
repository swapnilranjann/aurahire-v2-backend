import express from "express";
import sequelize from "../config/db.js";

const router = express.Router();

// GET featured jobs for home page
router.get("/featured-jobs", async (req, res) => {
  try {
    const [jobs] = await sequelize.query(`
      SELECT 
        j.id,
        j.title,
        j.company,
        j.location,
        j.salary,
        j.experience,
        j.description,
        j.category,
        j.created_at as posted,
        u.name as hr_name
      FROM job j
      LEFT JOIN users u ON j.hr_id = u.id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
      LIMIT 6
    `);

    // Format jobs for frontend
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || 'Not specified',
      experience: job.experience || 'Not specified',
      description: job.description || '',
      category: job.category,
      posted: formatTimeAgo(job.posted),
      skills: job.category ? [job.category] : [],
    }));

    res.json(formattedJobs);
  } catch (error) {
    console.error("Error fetching featured jobs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET top companies (companies with most job postings)
router.get("/top-companies", async (req, res) => {
  try {
    const [companies] = await sequelize.query(`
      SELECT 
        company,
        COUNT(*) as job_count
      FROM job
      WHERE status = 'active'
      GROUP BY company
      ORDER BY job_count DESC
      LIMIT 6
    `);

    const formattedCompanies = companies.map((comp, index) => ({
      name: comp.company,
      jobs: `${comp.job_count}+ Jobs`,
      icon: comp.company.charAt(0).toUpperCase(),
    }));

    res.json(formattedCompanies);
  } catch (error) {
    console.error("Error fetching top companies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET career news/articles (can use CareerAdvice or create separate table)
router.get("/career-news", async (req, res) => {
  try {
    const [articles] = await sequelize.query(`
      SELECT 
        id,
        title,
        content,
        category,
        created_at
      FROM career_advice
      ORDER BY created_at DESC
      LIMIT 3
    `);

    const formattedArticles = articles.map(article => ({
      title: article.title,
      summary: article.content.substring(0, 150) + '...',
      link: `/career-advice/${article.id}`,
    }));

    res.json(formattedArticles);
  } catch (error) {
    console.error("Error fetching career news:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Helper function to format time ago
function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
}

export default router;

