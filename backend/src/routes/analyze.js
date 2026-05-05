const express = require('express');
const { analyzeResume, rewriteResume, generateCoverLetter, generateInterviewQuestions } = require('../services/aiService');
const { getSession, updateSession } = require('./upload');

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze resume with AI
 */
router.post('/', async (req, res) => {
  try {
    const { sessionId, jobDescription } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing session ID',
        message: 'Session ID is required'
      });
    }

    // Get session
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session has expired. Please upload your resume again.'
      });
    }

    // Check if paid
    if (!session.analysisPaid) {
      return res.status(403).json({
        error: 'Payment required',
        message: 'Please complete payment before analysis',
        needsPayment: true
      });
    }

    // Check if already analyzed
    if (session.analysisCompleted && session.analysisResult) {
      return res.json({
        success: true,
        analysis: session.analysisResult,
        cached: true
      });
    }

    console.log(`🔍 Starting analysis for session: ${sessionId}`);
    console.log(`📝 Job description provided: ${jobDescription ? 'Yes' : 'No'}`);

    // Perform AI analysis
    const analysis = await analyzeResume(session.extractedText, jobDescription);

    // Store analysis result
    updateSession(sessionId, {
      analysisCompleted: true,
      analysisResult: analysis,
      jobDescription: jobDescription || null,
      analyzedAt: Date.now()
    });

    console.log(`✅ Analysis completed for session: ${sessionId}`);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * POST /api/analyze/rewrite
 * Rewrite resume with AI
 */
router.post('/rewrite', async (req, res) => {
  try {
    const { sessionId, jobDescription } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing session ID',
        message: 'Session ID is required'
      });
    }

    // Get session
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session has expired. Please upload your resume again.'
      });
    }

    // Check if paid
    if (!session.analysisPaid) {
      return res.status(403).json({
        error: 'Payment required',
        message: 'Please complete payment before rewrite'
      });
    }

    console.log(`📝 Starting rewrite for session: ${sessionId}`);

    // Perform AI rewrite
    const rewrite = await rewriteResume(session.extractedText, jobDescription);

    // Store rewrite result
    updateSession(sessionId, {
      rewriteResult: rewrite,
      rewrittenAt: Date.now()
    });

    console.log(`✅ Rewrite completed for session: ${sessionId}`);

    res.json({
      success: true,
      rewrite
    });

  } catch (error) {
    console.error('Rewrite Error:', error);
    res.status(500).json({
      error: 'Rewrite failed',
      message: error.message
    });
  }
});

/**
 * POST /api/analyze/cover-letter
 * Generate cover letter
 */
router.post('/cover-letter', async (req, res) => {
  try {
    const { sessionId, companyName, roleTitle, jobDescription } = req.body;

    if (!sessionId || !companyName || !roleTitle) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Session ID, company name, and role title are required'
      });
    }

    // Get session
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session has expired'
      });
    }

    // Check if paid
    if (!session.analysisPaid) {
      return res.status(403).json({
        error: 'Payment required',
        message: 'Please complete payment before generating cover letter'
      });
    }

    console.log(`📄 Generating cover letter for session: ${sessionId}`);

    const coverLetter = await generateCoverLetter(
      session.extractedText,
      jobDescription || session.jobDescription || '',
      companyName,
      roleTitle
    );

    console.log(`✅ Cover letter generated for session: ${sessionId}`);

    res.json({
      success: true,
      coverLetter
    });

  } catch (error) {
    console.error('Cover Letter Error:', error);
    res.status(500).json({
      error: 'Cover letter generation failed',
      message: error.message
    });
  }
});

/**
 * POST /api/analyze/interview-prep
 * Generate interview questions
 */
router.post('/interview-prep', async (req, res) => {
  try {
    const { sessionId, jobDescription } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing session ID',
        message: 'Session ID is required'
      });
    }

    // Get session
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session has expired'
      });
    }

    // Check if paid
    if (!session.analysisPaid) {
      return res.status(403).json({
        error: 'Payment required',
        message: 'Please complete payment before generating interview prep'
      });
    }

    console.log(`🎯 Generating interview prep for session: ${sessionId}`);

    const interviewPrep = await generateInterviewQuestions(
      session.extractedText,
      jobDescription || session.jobDescription || ''
    );

    console.log(`✅ Interview prep generated for session: ${sessionId}`);

    res.json({
      success: true,
      interviewPrep
    });

  } catch (error) {
    console.error('Interview Prep Error:', error);
    res.status(500).json({
      error: 'Interview prep generation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/analyze/result/:sessionId
 * Get cached analysis result
 */
router.get('/result/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = getSession(sessionId);

  if (!session) {
    return res.status(404).json({
      error: 'Session not found',
      message: 'Session has expired'
    });
  }

  if (!session.analysisCompleted || !session.analysisResult) {
    return res.status(404).json({
      error: 'Analysis not found',
      message: 'Analysis has not been completed yet'
    });
  }

  res.json({
    success: true,
    analysis: session.analysisResult
  });
});

module.exports = router;
