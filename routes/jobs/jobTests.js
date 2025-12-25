import express from "express";
import sequelize from "../config/db.js";
import { authenticateJWT } from "../middleware/auth.js";
import JobTest from "../models/JobTest.js";
import CustomQuestion from "../models/CustomQuestion.js";

const router = express.Router();

// Create a test for a job
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const {
      job_id,
      test_name,
      test_type,
      description,
      duration_minutes,
      passing_score,
      is_required,
      questions, // Array of questions (can be JSON input)
    } = req.body;

    if (!job_id || !test_name) {
      return res.status(400).json({ error: "job_id and test_name are required" });
    }

    // Verify job belongs to HR
    const [job] = await sequelize.query(
      "SELECT hr_id FROM job WHERE id = ?",
      {
        replacements: [job_id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!job || job.hr_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized. Job not found or doesn't belong to you." });
    }

    // Create test
    const test = await JobTest.create({
      job_id,
      test_name,
      test_type: test_type || "mixed",
      description,
      duration_minutes: duration_minutes || 60,
      passing_score: passing_score || 70,
      is_required: is_required !== undefined ? is_required : true,
      is_active: true,
    });

    // Add questions if provided
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const questionsToCreate = questions.map((q) => ({
        test_id: test.id,
        question_type: q.question_type || (q.options ? "mcq" : "programming"),
        question: q.question,
        options: q.options || null,
        correct_answer: q.correct_answer !== undefined ? q.correct_answer : null,
        programming_language: q.programming_language || null,
        solution_code: q.solution_code || null,
        test_cases: q.test_cases || null,
        explanation: q.explanation || null,
        difficulty: q.difficulty || "medium",
        points: q.points || 1,
        time_limit_seconds: q.time_limit_seconds || null,
      }));

      await CustomQuestion.bulkCreate(questionsToCreate);
    }

    // Fetch created test with questions
    const createdTest = await JobTest.findByPk(test.id, {
      include: [{ model: CustomQuestion, as: "questions" }],
    });

    res.status(201).json({
      message: "Test created successfully",
      test: createdTest,
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ error: "Failed to create test", details: error.message });
  }
});

// Bulk create questions from JSON
router.post("/:testId/questions/bulk", authenticateJWT, async (req, res) => {
  try {
    const { testId } = req.params;
    const { questions } = req.body; // Array of questions

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "questions must be an array" });
    }

    // Verify test belongs to HR's job
    const test = await JobTest.findByPk(testId);
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    const [job] = await sequelize.query(
      "SELECT hr_id FROM job WHERE id = ?",
      {
        replacements: [test.job_id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!job || job.hr_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Create questions
    const questionsToCreate = questions.map((q) => ({
      test_id: parseInt(testId),
      question_type: q.question_type || (q.options ? "mcq" : "programming"),
      question: q.question,
      options: q.options || null,
      correct_answer: q.correct_answer !== undefined ? q.correct_answer : null,
      programming_language: q.programming_language || null,
      solution_code: q.solution_code || null,
      test_cases: q.test_cases || null,
      explanation: q.explanation || null,
      difficulty: q.difficulty || "medium",
      points: q.points || 1,
      time_limit_seconds: q.time_limit_seconds || null,
    }));

    await CustomQuestion.bulkCreate(questionsToCreate);

    res.status(201).json({
      message: `${questionsToCreate.length} questions created successfully`,
    });
  } catch (error) {
    console.error("Error bulk creating questions:", error);
    res.status(500).json({ error: "Failed to create questions", details: error.message });
  }
});

// Get all tests for a job
router.get("/job/:jobId", authenticateJWT, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job belongs to HR
    const [job] = await sequelize.query(
      "SELECT hr_id FROM job WHERE id = ?",
      {
        replacements: [jobId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!job || job.hr_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const tests = await JobTest.findAll({
      where: { job_id: jobId },
      include: [{ model: CustomQuestion, as: "questions" }],
      order: [["createdAt", "DESC"]],
    });

    res.json(tests);
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ error: "Failed to fetch tests", details: error.message });
  }
});

// Get a specific test with questions
router.get("/:testId", authenticateJWT, async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await JobTest.findByPk(testId, {
      include: [{ model: CustomQuestion, as: "questions" }],
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Verify job belongs to HR
    const [job] = await sequelize.query(
      "SELECT hr_id FROM job WHERE id = ?",
      {
        replacements: [test.job_id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!job || job.hr_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(test);
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({ error: "Failed to fetch test", details: error.message });
  }
});

// Update a test
router.put("/:testId", authenticateJWT, async (req, res) => {
  try {
    const { testId } = req.params;
    const { test_name, description, duration_minutes, passing_score, is_required, is_active } = req.body;

    const test = await JobTest.findByPk(testId);
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Verify job belongs to HR
    const [job] = await sequelize.query(
      "SELECT hr_id FROM job WHERE id = ?",
      {
        replacements: [test.job_id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!job || job.hr_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await test.update({
      test_name: test_name || test.test_name,
      description: description !== undefined ? description : test.description,
      duration_minutes: duration_minutes || test.duration_minutes,
      passing_score: passing_score || test.passing_score,
      is_required: is_required !== undefined ? is_required : test.is_required,
      is_active: is_active !== undefined ? is_active : test.is_active,
    });

    res.json({ message: "Test updated successfully", test });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(500).json({ error: "Failed to update test", details: error.message });
  }
});

// Delete a test
router.delete("/:testId", authenticateJWT, async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await JobTest.findByPk(testId);
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Verify job belongs to HR
    const [job] = await sequelize.query(
      "SELECT hr_id FROM job WHERE id = ?",
      {
        replacements: [test.job_id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!job || job.hr_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete questions first (cascade)
    await CustomQuestion.destroy({ where: { test_id: testId } });
    await test.destroy();

    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({ error: "Failed to delete test", details: error.message });
  }
});

// Add a single question
router.post("/:testId/questions", authenticateJWT, async (req, res) => {
  try {
    const { testId } = req.params;
    const questionData = req.body;

    const test = await JobTest.findByPk(testId);
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Verify job belongs to HR
    const [job] = await sequelize.query(
      "SELECT hr_id FROM job WHERE id = ?",
      {
        replacements: [test.job_id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!job || job.hr_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const question = await CustomQuestion.create({
      test_id: parseInt(testId),
      question_type: questionData.question_type || (questionData.options ? "mcq" : "programming"),
      question: questionData.question,
      options: questionData.options || null,
      correct_answer: questionData.correct_answer !== undefined ? questionData.correct_answer : null,
      programming_language: questionData.programming_language || null,
      solution_code: questionData.solution_code || null,
      test_cases: questionData.test_cases || null,
      explanation: questionData.explanation || null,
      difficulty: questionData.difficulty || "medium",
      points: questionData.points || 1,
      time_limit_seconds: questionData.time_limit_seconds || null,
    });

    res.status(201).json({ message: "Question added successfully", question });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ error: "Failed to add question", details: error.message });
  }
});

export default router;

