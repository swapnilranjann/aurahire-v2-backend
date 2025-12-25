import express from "express";
import CareerAdvice from "../models/CareerAdvice.js";

const router = express.Router();

// GET all career advice articles (public)
router.get("/", async (req, res) => {
  try {
    const { category, featured, limit = 20, offset = 0 } = req.query;

    const whereClause = {};
    if (category) whereClause.category = category;
    if (featured === 'true') whereClause.is_featured = true;

    const articles = await CareerAdvice.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    const total = await CareerAdvice.count({ where: whereClause });

    res.json({
      articles,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + articles.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching career advice:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET single article
router.get("/:id", async (req, res) => {
  try {
    const article = await CareerAdvice.findByPk(req.params.id);

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    // Increment views
    await article.update({ views: article.views + 1 });

    res.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET featured articles
router.get("/featured/list", async (req, res) => {
  try {
    const articles = await CareerAdvice.findAll({
      where: { is_featured: true },
      limit: 5,
      order: [["createdAt", "DESC"]],
    });

    res.json(articles);
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET categories
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await CareerAdvice.findAll({
      attributes: ['category'],
      group: ['category'],
      raw: true,
    });

    const uniqueCategories = [...new Set(categories.map(c => c.category).filter(Boolean))];
    res.json(uniqueCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

