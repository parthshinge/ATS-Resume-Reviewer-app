const express = require('express');
const { generatePDFReport } = require('../services/reportService');
const { getSession } = require('./upload');

const router = express.Router();

/**
 * GET /api/report/download/:sessionId
 * Download analysis report as PDF
 */
router.get('/download/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session has expired. Please upload your resume again.'
      });
    }

    // Check if analysis completed
    if (!session.analysisCompleted || !session.analysisResult) {
      return res.status(404).json({
        error: 'Analysis not found',
        message: 'Please complete the analysis first'
      });
    }

    console.log(`📄 Generating PDF report for session: ${sessionId}`);

    // Generate PDF
    const pdfBuffer = await generatePDFReport(
      session.analysisResult,
      session.originalName
    );

    // Set headers for file download
    const fileName = `resumex-analysis-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    console.log(`✅ PDF report generated for session: ${sessionId}`);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Report Download Error:', error);
    res.status(500).json({
      error: 'Report generation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/report/preview/:sessionId
 * Get report preview data (JSON)
 */
router.get('/preview/:sessionId', (req, res) => {
  try {
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
        message: 'Please complete the analysis first'
      });
    }

    res.json({
      success: true,
      report: {
        analysis: session.analysisResult,
        fileName: session.originalName,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Report Preview Error:', error);
    res.status(500).json({
      error: 'Failed to get report preview',
      message: error.message
    });
  }
});

module.exports = router;
