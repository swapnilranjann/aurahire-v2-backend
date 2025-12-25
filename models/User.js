import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("user", "hr"), allowNull: false },
    isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailVerificationToken: { type: DataTypes.STRING, allowNull: true },
    emailVerificationExpires: { type: DataTypes.DATE, allowNull: true },
    passwordResetToken: { type: DataTypes.STRING, allowNull: true },
    passwordResetExpires: { type: DataTypes.DATE, allowNull: true },
    refreshToken: { type: DataTypes.STRING, allowNull: true },
  },
  { timestamps: true }
);

export default User;
