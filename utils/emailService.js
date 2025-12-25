import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter - Configure with your email service
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send email verification
export const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"AuraHire" <${process.env.SMTP_USER || 'noreply@aurahire.com'}>`,
    to: email,
    subject: 'Verify Your Email - AuraHire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to AuraHire!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p style="color: #666; font-size: 16px;">Thank you for signing up! Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #999; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #999; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div style="padding: 20px; text-align: center; background: #333;">
          <p style="color: #999; margin: 0; font-size: 12px;">© 2025 AuraHire. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"AuraHire" <${process.env.SMTP_USER || 'noreply@aurahire.com'}>`,
    to: email,
    subject: 'Reset Your Password - AuraHire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p style="color: #666; font-size: 16px;">You requested to reset your password. Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #999; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
        </div>
        <div style="padding: 20px; text-align: center; background: #333;">
          <p style="color: #999; margin: 0; font-size: 12px;">© 2025 AuraHire. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Send application status update email
export const sendApplicationStatusEmail = async (email, name, jobTitle, status) => {
  const statusMessages = {
    reviewed: 'Your application has been reviewed by the hiring team.',
    shortlisted: 'Congratulations! You have been shortlisted for the position.',
    interview: 'Great news! You have been selected for an interview.',
    rejected: 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.',
    hired: 'Congratulations! We are excited to offer you the position!'
  };

  const mailOptions = {
    from: `"AuraHire" <${process.env.SMTP_USER || 'noreply@aurahire.com'}>`,
    to: email,
    subject: `Application Update: ${jobTitle} - AuraHire`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Application Update</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p style="color: #666; font-size: 16px;">We have an update regarding your application for <strong>${jobTitle}</strong>.</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="color: #333; font-size: 16px; margin: 0;"><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">${statusMessages[status] || 'Your application status has been updated.'}</p>
          </div>
          <p style="color: #666; font-size: 14px;">Log in to your AuraHire account to view more details.</p>
        </div>
        <div style="padding: 20px; text-align: center; background: #333;">
          <p style="color: #999; margin: 0; font-size: 12px;">© 2025 AuraHire. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export default transporter;

