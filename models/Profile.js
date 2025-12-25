import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Enhanced Profile Model
const Profile = sequelize.define(
  "Profile",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    photo: { type: DataTypes.STRING, allowNull: true },
    resume: { type: DataTypes.STRING, allowNull: true },
    
    // Professional Info
    headline: { type: DataTypes.STRING, allowNull: true }, // e.g., "Senior Software Engineer"
    summary: { type: DataTypes.TEXT, allowNull: true },
    currentLocation: { type: DataTypes.STRING, allowNull: true },
    preferredLocations: { type: DataTypes.JSON, allowNull: true }, // Array of preferred locations
    
    // Experience & Education (stored as JSON)
    experience: { type: DataTypes.JSON, allowNull: true }, // Array of work experiences
    education: { type: DataTypes.JSON, allowNull: true }, // Array of education
    skills: { type: DataTypes.JSON, allowNull: true }, // Array of skills
    certifications: { type: DataTypes.JSON, allowNull: true }, // Array of certifications
    
    // Job Preferences
    expectedSalary: { type: DataTypes.STRING, allowNull: true },
    noticePeriod: { type: DataTypes.STRING, allowNull: true },
    jobType: { type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'remote'), allowNull: true },
    
    // Social Links
    linkedinUrl: { type: DataTypes.STRING, allowNull: true },
    githubUrl: { type: DataTypes.STRING, allowNull: true },
    portfolioUrl: { type: DataTypes.STRING, allowNull: true },
    
    // Profile Visibility
    isProfilePublic: { type: DataTypes.BOOLEAN, defaultValue: true },
    isOpenToWork: { type: DataTypes.BOOLEAN, defaultValue: true },
    
    // Profile Completion
    completionPercentage: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { 
    timestamps: true,
    tableName: 'profiles'
  }
);

export default Profile;


