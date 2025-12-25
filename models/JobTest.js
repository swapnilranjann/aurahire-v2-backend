import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Job Test Model - Links tests to jobs
const JobTest = sequelize.define(
  "JobTest",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "job", key: "id" },
    },
    test_name: { type: DataTypes.STRING, allowNull: false }, // e.g., "Technical Assessment", "Coding Test"
    test_type: {
      type: DataTypes.ENUM("mcq", "programming", "mixed"),
      defaultValue: "mixed",
    },
    description: { type: DataTypes.TEXT, allowNull: true },
    duration_minutes: { type: DataTypes.INTEGER, defaultValue: 60 },
    passing_score: { type: DataTypes.INTEGER, defaultValue: 70 }, // Percentage
    is_required: { type: DataTypes.BOOLEAN, defaultValue: true }, // Must pass to proceed
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { timestamps: true, tableName: "job_tests" }
);

export default JobTest;

