import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Application from "./Application.js";

const ApplicationStage = sequelize.define(
  "ApplicationStage",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Application, key: "id" },
    },
    stage: {
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
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "scheduled", "completed", "passed", "failed", "rejected"),
      defaultValue: "pending",
    },
    interview_type: {
      type: DataTypes.ENUM("video_call", "in_person", "phone", "programming", "aptitude", "other"),
      allowNull: true,
    },
    scheduled_date: { type: DataTypes.DATE, allowNull: true },
    scheduled_time: { type: DataTypes.TIME, allowNull: true },
    interview_link: { type: DataTypes.STRING(500), allowNull: true }, // For video calls
    interviewer_name: { type: DataTypes.STRING, allowNull: true },
    interviewer_email: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    score: { type: DataTypes.INTEGER, allowNull: true }, // For aptitude/programming tests
    completed_at: { type: DataTypes.DATE, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true }, // HR user ID
  },
  {
    timestamps: true,
    tableName: "application_stages",
  }
);

Application.hasMany(ApplicationStage, { foreignKey: "application_id" });
ApplicationStage.belongsTo(Application, { foreignKey: "application_id" });

export default ApplicationStage;

