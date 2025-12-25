import express from "express";
import jwt from "jsonwebtoken";
import { SkillTest, SkillTestResult } from "../models/SkillTest.js";
import Question from "../models/Question.js";
import sequelize from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();
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

// GET all available skill tests/stacks (public)
router.get("/", async (req, res) => {
  try {
    const tests = await SkillTest.findAll({
      where: { is_active: true },
      attributes: [
        'id', 
        'title', 
        'skill_name', 
        'description', 
        'duration_minutes', 
        'questions_per_test', 
        'passing_score',
        'total_questions_in_db',
        'icon'
      ],
      order: [["skill_name", "ASC"]],
    });

    if (!tests || tests.length === 0) {
      return res.json([]);
    }

    // Get question counts for each test
    const testsWithCounts = await Promise.all(
      tests.map(async (test) => {
        try {
          const questionCount = await Question.count({ where: { test_id: test.id } });
          return {
            ...test.toJSON(),
            total_questions_in_db: questionCount || test.total_questions_in_db || 0,
          };
        } catch (err) {
          console.error(`Error counting questions for test ${test.id}:`, err);
          return {
            ...test.toJSON(),
            total_questions_in_db: test.total_questions_in_db || 0,
          };
        }
      })
    );

    res.json(testsWithCounts);
  } catch (error) {
    console.error("Error fetching skill tests:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// GET random questions for a test (reshuffled each time)
router.get("/:id/questions", async (req, res) => {
  try {
    const testId = req.params.id;
    const test = await SkillTest.findByPk(testId);

    if (!test || !test.is_active) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Get random questions from the pool
    const questionsPerTest = test.questions_per_test || 20;
    
    const questions = await sequelize.query(`
      SELECT 
        id,
        question,
        options,
        difficulty,
        points
      FROM questions
      WHERE test_id = ?
      ORDER BY RAND()
      LIMIT ?
    `, {
      replacements: [testId, questionsPerTest],
      type: sequelize.QueryTypes.SELECT
    });

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(404).json({ error: "No questions available for this test" });
    }

    // Remove correct_answer from response (options is JSON, parse if needed)
    const questionsWithoutAnswers = questions.map(q => {
      // Parse options if it's a string
      let options = q.options;
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch (e) {
          console.error('Error parsing options:', e);
        }
      }
      
      return {
        id: q.id,
        question: q.question,
        options: options,
        difficulty: q.difficulty || 'medium',
        points: q.points || 1,
      };
    });

    res.json({
      test: {
        id: test.id,
        title: test.title,
        skill_name: test.skill_name,
        duration_minutes: test.duration_minutes,
        passing_score: test.passing_score,
      },
      questions: questionsWithoutAnswers,
      total_questions: questionsWithoutAnswers.length,
    });
  } catch (error) {
    console.error("Error fetching test questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// SUBMIT test answers (update if user retakes)
router.post("/:id/submit", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const testId = req.params.id;
    const { answers, question_ids, time_taken_minutes } = req.body;

    const test = await SkillTest.findByPk(testId);

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // Get the questions that were asked
    const questionIds = question_ids || [];
    const questions = await Question.findAll({
      where: {
        id: questionIds,
        test_id: testId,
      },
    });

    if (questions.length === 0) {
      return res.status(400).json({ error: "No questions found for this test" });
    }

    // Calculate score with detailed marking
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const detailedResults = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correct_answer;
      const points = question.points || 1;
      
      totalPoints += points;
      if (isCorrect) {
        correctCount++;
        earnedPoints += points;
      }

      detailedResults.push({
        question_id: question.id,
        question: question.question,
        user_answer: userAnswer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        points: isCorrect ? points : 0,
        explanation: question.explanation,
      });
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= test.passing_score;

    // Check if user already has a result for this test
    const existingResult = await SkillTestResult.findOne({
      where: { user_id: userId, test_id: testId },
      order: [["createdAt", "DESC"]],
    });

    let result;
    if (existingResult) {
      // Update existing result (user retaking the test)
      await existingResult.update({
        score,
        total_questions: questions.length,
        correct_answers: correctCount,
        answers: answers,
        question_ids: questionIds,
        time_taken_minutes: time_taken_minutes || null,
        passed,
        detailed_results: detailedResults,
      });
      result = existingResult;
    } else {
      // Create new result
      result = await SkillTestResult.create({
        user_id: userId,
        test_id: testId,
        score,
        total_questions: questions.length,
        correct_answers: correctCount,
        answers: answers,
        question_ids: questionIds,
        time_taken_minutes: time_taken_minutes || null,
        passed,
        detailed_results: detailedResults,
      });
    }

    res.json({
      message: "Test submitted successfully",
      result: {
        id: result.id,
        score,
        total_questions: questions.length,
        correct_answers: correctCount,
        earned_points: earnedPoints,
        total_points: totalPoints,
        passed,
        time_taken_minutes: time_taken_minutes,
        detailed_results: detailedResults,
      },
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// GET user's test results (best score per test)
router.get("/results/my-tests", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get best result for each test
    const [results] = await sequelize.query(`
      SELECT 
        r.*,
        t.title,
        t.skill_name,
        t.icon,
        ROW_NUMBER() OVER (PARTITION BY r.test_id ORDER BY r.score DESC, r.createdAt DESC) as rn
      FROM skill_test_results r
      INNER JOIN skill_tests t ON r.test_id = t.id
      WHERE r.user_id = ?
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });

    // Filter to get only best result per test
    const bestResults = Array.isArray(results) 
      ? results.filter((r, index, self) => 
          index === self.findIndex(t => t.test_id === r.test_id && t.rn === 1)
        )
      : [];

    res.json(bestResults);
  } catch (error) {
    console.error("Error fetching test results:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET all attempts for a specific test
router.get("/results/test/:testId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const testId = req.params.testId;

    const results = await SkillTestResult.findAll({
      where: { user_id: userId, test_id: testId },
      include: [{
        model: SkillTest,
        attributes: ['id', 'title', 'skill_name'],
      }],
      order: [["createdAt", "DESC"]],
    });

    res.json(results);
  } catch (error) {
    console.error("Error fetching test attempts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET single test result with details
router.get("/results/:resultId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const resultId = req.params.resultId;

    const result = await SkillTestResult.findOne({
      where: { id: resultId, user_id: userId },
      include: [{
        model: SkillTest,
        attributes: ['id', 'title', 'skill_name'],
      }],
    });

    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching test result:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
