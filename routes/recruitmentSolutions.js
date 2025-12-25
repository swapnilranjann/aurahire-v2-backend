import express from "express";
import RecruitmentPlan from "../models/RecruitmentPlan.js";

const router = express.Router();

// GET all recruitment plans
router.get("/plans", async (req, res) => {
  try {
    const plans = await RecruitmentPlan.findAll({
      where: { is_active: true },
      order: [["price", "ASC"]],
    });

    res.json(plans);
  } catch (error) {
    console.error("Error fetching recruitment plans:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET single plan
router.get("/plans/:id", async (req, res) => {
  try {
    const plan = await RecruitmentPlan.findByPk(req.params.id);

    if (!plan || !plan.is_active) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET recruitment solutions info (features, benefits)
router.get("/solutions", async (req, res) => {
  try {
    const solutions = {
      features: [
        {
          title: "Job Posting",
          description: "Post unlimited job listings and reach thousands of qualified candidates",
          icon: "📝",
        },
        {
          title: "Resume Search",
          description: "Search through millions of resumes and find the perfect candidate",
          icon: "🔍",
        },
        {
          title: "Applicant Management",
          description: "Track and manage all your job applications in one place",
          icon: "📊",
        },
        {
          title: "Analytics Dashboard",
          description: "Get insights into your hiring process with detailed analytics",
          icon: "📈",
        },
        {
          title: "Branded Career Page",
          description: "Create a custom career page that reflects your company brand",
          icon: "🎨",
        },
        {
          title: "Priority Support",
          description: "Get dedicated support from our recruitment experts",
          icon: "💬",
        },
      ],
      benefits: [
        "Access to millions of active job seekers",
        "Advanced candidate search and filtering",
        "Automated job matching",
        "Real-time application tracking",
        "Customizable hiring workflows",
        "Integration with ATS systems",
      ],
    };

    res.json(solutions);
  } catch (error) {
    console.error("Error fetching solutions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

