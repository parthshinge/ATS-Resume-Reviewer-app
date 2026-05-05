const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { extractText, cleanupFile } = require('../utils/fileParser');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_TEMP_DIR || './temp';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

// File filter for PDF and DOCX
const fileFilter = (req, file, cb) => {
  const allowedMimetypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimetypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

// In-memory session storage (resumes are not persisted to database)
const sessions = new Map();

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now();
  const retentionTime = (parseInt(process.env.FILE_RETENTION_MINUTES) || 30) * 60 * 1000;
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > retentionTime) {
      // Cleanup file
      if (session.filePath) {
        cleanupFile(session.filePath);
      }
      sessions.delete(sessionId);
      console.log(`🗑️ Cleaned up session: ${sessionId}`);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

/**
 * POST /api/upload
 * Upload resume file
 */
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a PDF or DOCX file'
      });
    }

    const sessionId = crypto.randomUUID();
    const filePath = req.file.path;

    console.log(`📄 File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);

    // Extract text from file
    let extractedText;
    try {
      extractedText = await extractText(filePath, req.file.mimetype);
    } catch (error) {
      cleanupFile(filePath);
      throw error;
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 100) {
      cleanupFile(filePath);
      return res.status(400).json({
        error: 'Invalid resume',
        message: 'Could not extract sufficient text from the resume. Please upload a valid PDF or DOCX file.'
      });
    }

    // Store session (privacy-first: no database storage)
    sessions.set(sessionId, {
      filePath,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      extractedText: extractedText.substring(0, 50000), // Limit stored text
      createdAt: Date.now(),
      analysisPaid: false,
      analysisCompleted: false
    });

    console.log(`✅ Session created: ${sessionId}`);

    res.json({
      success: true,
      sessionId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      textLength: extractedText.length,
      message: 'Resume uploaded successfully'
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * GET /api/upload/session/:sessionId
 * Get session status
 */
router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      error: 'Session not found',
      message: 'The session has expired or does not exist'
    });
  }

  res.json({
    success: true,
    sessionId,
    fileName: session.originalName,
    analysisPaid: session.analysisPaid,
    analysisCompleted: session.analysisCompleted,
    createdAt: session.createdAt
  });
});

/**
 * GET /api/upload/text/:sessionId
 * Get extracted text (for internal use)
 */
router.get('/text/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    success: true,
    text: session.extractedText
  });
});

// Helper function to get session
function getSession(sessionId) {
  return sessions.get(sessionId);
}

// Helper function to update session
function updateSession(sessionId, updates) {
  const session = sessions.get(sessionId);
  if (session) {
    Object.assign(session, updates);
    sessions.set(sessionId, session);
  }
  return session;
}

// Helper function to delete session
function deleteSession(sessionId) {
  const session = sessions.get(sessionId);
  if (session && session.filePath) {
    cleanupFile(session.filePath);
  }
  sessions.delete(sessionId);
}

module.exports = router;
module.exports.getSession = getSession;
module.exports.updateSession = updateSession;
module.exports.deleteSession = deleteSession;
