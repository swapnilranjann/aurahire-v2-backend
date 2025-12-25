import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import JobTest from "./JobTest.js";

// Custom Question Model - For job-specific tests (MCQ and Programming)
const CustomQuestion = sequelize.define(
  "CustomQuestion",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: JobTest, key: "id" },
    },
    question_type: {
      type: DataTypes.ENUM("mcq", "programming"),
      allowNull: false,
    },
    question: { type: DataTypes.TEXT, allowNull: false },
    // For MCQ questions
    options: { type: DataTypes.JSON, allowNull: true }, // Array of options for MCQ
    correct_answer: { type: DataTypes.INTEGER, allowNull: true }, // Index of correct option for MCQ
    // For Programming questions
    programming_language: { type: DataTypes.STRING, allowNull: true }, // e.g., "javascript", "python", "java"
    solution_code: { type: DataTypes.TEXT, allowNull: true }, // Solution code for programming questions
    test_cases: { type: DataTypes.JSON, allowNull: true }, // Array of test cases: [{input: "...", output: "...", isHidden: false}]
    // Common fields
    explanation: { type: DataTypes.TEXT, allowNull: true }, // Explanation/solution explanation
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "hard"),
      defaultValue: "medium",
    },
    points: { type: DataTypes.INTEGER, defaultValue: 1 },
    time_limit_seconds: { type: DataTypes.INTEGER, allowNull: true }, // Time limit per question
  },
  { timestamps: true, tableName: "custom_questions" }
);

JobTest.hasMany(CustomQuestion, { foreignKey: "test_id", as: "questions" });
CustomQuestion.belongsTo(JobTest, { foreignKey: "test_id" });

export default CustomQuestion;

