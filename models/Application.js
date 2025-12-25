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
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  { 
    timestamps: true,
    tableName: 'applications'
  }
);

export default Application;

