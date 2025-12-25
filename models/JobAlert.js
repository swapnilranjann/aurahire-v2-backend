import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const JobAlert = sequelize.define(
  "JobAlert",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    keywords: { type: DataTypes.STRING, allowNull: true }, // Comma-separated keywords
    location: { type: DataTypes.STRING, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: true },
    experience_level: { type: DataTypes.STRING, allowNull: true }, // entry, mid, senior
    salary_range: { type: DataTypes.STRING, allowNull: true }, // e.g., "50000-100000"
    job_type: { type: DataTypes.STRING, allowNull: true }, // full-time, part-time, etc.
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    frequency: { type: DataTypes.ENUM('daily', 'weekly', 'instant'), defaultValue: 'daily' },
  },
  { timestamps: true, tableName: 'job_alerts' }
);

User.hasMany(JobAlert, { foreignKey: "user_id" });
JobAlert.belongsTo(User, { foreignKey: "user_id" });

export default JobAlert;

