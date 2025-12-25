import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const RecruitmentPlan = sequelize.define(
  "RecruitmentPlan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }, // Basic, Professional, Enterprise
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'INR' },
    duration_months: { type: DataTypes.INTEGER, defaultValue: 1 },
    job_postings_limit: { type: DataTypes.INTEGER, allowNull: true }, // null = unlimited
    resume_views_limit: { type: DataTypes.INTEGER, allowNull: true },
    featured_jobs: { type: DataTypes.INTEGER, defaultValue: 0 },
    priority_support: { type: DataTypes.BOOLEAN, defaultValue: false },
    analytics_access: { type: DataTypes.BOOLEAN, defaultValue: false },
    custom_branding: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    features: { type: DataTypes.JSON, allowNull: true }, // Array of feature descriptions
  },
  { timestamps: true, tableName: 'recruitment_plans' }
);

export default RecruitmentPlan;

