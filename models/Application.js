import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Application = sequelize.define(
  "Application",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    job_id: { type: DataTypes.INTEGER, allowNull: false },
    hr_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    status: { 
      type: DataTypes.ENUM("pending", "reviewed", "shortlisted", "interview", "rejected", "hired"), 
      defaultValue: "pending" 
    },
    current_stage: {
      type: DataTypes.ENUM(
        "application_check",
        "interview_round_1",
        "interview_round_2",
        "interview_round_3",
        "aptitude_test",
        "video_call_interview",
        "programming_interview",
        "release_letter_round",
        "hired",
        "rejected"
      ),
      defaultValue: "application_check",
    },
    stage_status: {
      type: DataTypes.ENUM("pending", "scheduled", "completed", "passed", "failed", "rejected"),
      defaultValue: "pending",
    },
    total_interview_rounds: { type: DataTypes.INTEGER, defaultValue: 3 }, // Configurable per job
    notes: { type: DataTypes.TEXT, allowNull: true },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
  },
  { 
    timestamps: true,
    tableName: 'applications'
  }
);

export default Application;

