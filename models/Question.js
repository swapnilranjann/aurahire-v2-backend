import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { SkillTest } from "./SkillTest.js";

// Individual Questions Model - for better question management
const Question = sequelize.define(
  "Question",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: SkillTest, key: "id" },
    },
    question: { type: DataTypes.TEXT, allowNull: false },
    options: { type: DataTypes.JSON, allowNull: false }, // Array of options
    correct_answer: { type: DataTypes.INTEGER, allowNull: false }, // Index of correct option
    explanation: { type: DataTypes.TEXT, allowNull: true }, // Explanation for the answer
    difficulty: { 
      type: DataTypes.ENUM('easy', 'medium', 'hard'), 
      defaultValue: 'medium' 
    },
    points: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  { timestamps: true, tableName: 'questions' }
);

SkillTest.hasMany(Question, { foreignKey: "test_id" });
Question.belongsTo(SkillTest, { foreignKey: "test_id" });

export default Question;

