const express = require('express');
const { 
  createPaymentRequest, 
  verifyPayment,
  handleWebhook,
  getPaymentConfig 
} = require('../services/paymentService');
const { getSession, updateSession } = require('./upload');

const router = express.Router();

/**
 * GET /api/payment/config
 * Get payment configuration
 */
router.get('/config', (req, res) => {
  const config = getPaymentConfig();
  res.json({
    success: true,
    amount: config.amount,
    currency: config.currency,
    supportedTokens: config.supportedTokens,
    recipientAddress: config.recipientAddress
  });
});

/**
 * POST /api/payment/create
 * Create a new payment request
 */
router.post('/create', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing session ID',
        message: 'Session ID is required'
      });
    }

    // Verify session exists
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Please upload your resume first'
      });
    }

    // Check if already paid
    if (session.analysisPaid) {
      return res.status(400).json({
        error: 'Already paid',
        message: 'Analysis has already been paid for this session'
      });
    }

    // Create payment request
    const paymentRequest = await createPaymentRequest(sessionId);

    // Store payment info in session
    updateSession(sessionId, {
      paymentId: paymentRequest.paymentId,
      paymentCreatedAt: Date.now()
    });

    console.log(`💳 Payment created: ${paymentRequest.paymentId} for session ${sessionId}`);

    res.json(paymentRequest);

  } catch (error) {
    console.error('Create Payment Route Error:', error);
    res.status(500).json({
      error: 'Payment creation failed',
      message: error.message
    });
  }
});

/**
 * POST /api/payment/verify
 * Verify payment status
 */
router.post('/verify', async (req, res) => {
  try {
    const { sessionId, paymentId } = req.body;

    if (!sessionId || !paymentId) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Session ID and payment ID are required'
      });
    }

    // Verify session exists
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: 'Session has expired'
      });
    }

    // Verify payment
    const verification = await verifyPayment(paymentId, sessionId);

    if (verification.verified) {
      // Update session as paid
      updateSession(sessionId, {
        analysisPaid: true,
        paymentVerifiedAt: Date.now(),
        transactionHash: verification.transactionHash
      });

      console.log(`✅ Payment verified: ${paymentId} for session ${sessionId}`);
    }

    res.json(verification);

  } catch (error) {
    console.error('Verify Payment Route Error:', error);
    res.status(500).json({
      error: 'Payment verification failed',
      message: error.message
    });
  }
});

/**
 * POST /api/payment/webhook
 * Handle payment webhooks from B402
 */
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const signature = req.headers['x-b402-signature'];
    const payload = JSON.parse(req.body);

    const result = handleWebhook(payload, signature);

    // Update session if payment successful
    if (result.status === 'completed' && result.processed) {
      const { sessionId } = payload.metadata || {};
      if (sessionId) {
        updateSession(sessionId, {
          analysisPaid: true,
          paymentVerifiedAt: Date.now(),
          transactionHash: result.transactionHash
        });
      }
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook Route Error:', error);
    res.status(400).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

/**
 * GET /api/payment/status/:sessionId
 * Get payment status for a session
 */
router.get('/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = getSession(sessionId);

  if (!session) {
    return res.status(404).json({
      error: 'Session not found',
      message: 'Session has expired'
    });
  }

  res.json({
    success: true,
    sessionId,
    paid: session.analysisPaid || false,
    paymentId: session.paymentId || null,
    paymentVerifiedAt: session.paymentVerifiedAt || null
  });
});

module.exports = router;
