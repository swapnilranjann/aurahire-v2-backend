import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SavedJob = sequelize.define(
  "SavedJob",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    job_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { 
    timestamps: true,
    tableName: 'saved_jobs',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'job_id']
      }
    ]
  }
);

export default SavedJob;

