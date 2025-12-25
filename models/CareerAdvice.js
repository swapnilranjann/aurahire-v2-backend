import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CareerAdvice = sequelize.define(
  "CareerAdvice",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: true }, // resume, interview, career-growth, etc.
    author: { type: DataTypes.STRING, allowNull: true },
    image_url: { type: DataTypes.STRING, allowNull: true },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    likes: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: true, tableName: 'career_advice' }
);

export default CareerAdvice;

