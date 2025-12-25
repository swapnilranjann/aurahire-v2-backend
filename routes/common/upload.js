import express from 'express';\nimport { verifyToken } from '../../middleware/auth.js';
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
const resumesDir = path.join(uploadsDir, 'resumes');
const photosDir = path.join(uploadsDir, 'photos');

[uploadsDir, resumesDir, photosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for resumes
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// Configure storage for photos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// File filter for resumes
const resumeFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOC/DOCX files are allowed for resumes'), false);
  }
};

// File filter for photos
const photoFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF and WebP images are allowed'), false);
  }
};

// Multer instances
const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Middleware to verify JWT token


// ✅ Upload Resume
router.post("/resume", verifyToken, (req, res) => {
  uploadResume.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/resumes/${req.file.filename}`;

    res.json({
      message: 'Resume uploaded successfully',
      filename: req.file.filename,
      url: fileUrl,
      originalName: req.file.originalname,
      size: req.file.size
    });
  });
});

// ✅ Upload Photo
router.post("/photo", verifyToken, (req, res) => {
  uploadPhoto.single('photo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 2MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/photos/${req.file.filename}`;

    res.json({
      message: 'Photo uploaded successfully',
      filename: req.file.filename,
      url: fileUrl,
      originalName: req.file.originalname,
      size: req.file.size
    });
  });
});

// ✅ Delete Resume
router.delete("/resume/:filename", verifyToken, (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    // Check if filename belongs to user (security check)
    if (!filename.includes(`resume-${userId}-`)) {
      return res.status(403).json({ error: 'Unauthorized to delete this file' });
    }

    const filePath = path.join(resumesDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Resume deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// ✅ Delete Photo
router.delete("/photo/:filename", verifyToken, (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    // Check if filename belongs to user (security check)
    if (!filename.includes(`photo-${userId}-`)) {
      return res.status(403).json({ error: 'Unauthorized to delete this file' });
    }

    const filePath = path.join(photosDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Photo deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;


