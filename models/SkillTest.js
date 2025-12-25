import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const SkillTest = sequelize.define(
  "SkillTest",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false }, // e.g., "JavaScript Fundamentals"
    skill_name: { type: DataTypes.STRING, allowNull: false }, // JavaScript, React, Python, etc.
    description: { type: DataTypes.TEXT, allowNull: true },
    duration_minutes: { type: DataTypes.INTEGER, defaultValue: 30 },
    questions_per_test: { type: DataTypes.INTEGER, defaultValue: 20 }, // Questions to show per test
    passing_score: { type: DataTypes.INTEGER, defaultValue: 70 }, // Percentage
    total_questions_in_db: { type: DataTypes.INTEGER, defaultValue: 0 }, // Total questions available
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    icon: { type: DataTypes.STRING, allowNull: true }, // Icon/emoji for the stack
  },
  { timestamps: true, tableName: 'skill_tests' }
);

const SkillTestResult = sequelize.define(
  "SkillTestResult",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: SkillTest, key: "id" },
    },
    score: { type: DataTypes.INTEGER, allowNull: false }, // Percentage
    total_questions: { type: DataTypes.INTEGER, allowNull: false },
    correct_answers: { type: DataTypes.INTEGER, allowNull: false },
    earned_points: { type: DataTypes.INTEGER, allowNull: true },
    total_points: { type: DataTypes.INTEGER, allowNull: true },
    answers: { type: DataTypes.JSON, allowNull: false }, // User's answers
    question_ids: { type: DataTypes.JSON, allowNull: true }, // IDs of questions asked
    detailed_results: { type: DataTypes.JSON, allowNull: true }, // Detailed marking per question
    time_taken_minutes: { type: DataTypes.INTEGER, allowNull: true },
    passed: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: true, tableName: 'skill_test_results' }
);

User.hasMany(SkillTestResult, { foreignKey: "user_id" });
SkillTestResult.belongsTo(User, { foreignKey: "user_id" });
SkillTest.hasMany(SkillTestResult, { foreignKey: "test_id" });
SkillTestResult.belongsTo(SkillTest, { foreignKey: "test_id" });

export { SkillTest, SkillTestResult };

