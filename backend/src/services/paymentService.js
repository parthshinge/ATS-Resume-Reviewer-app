const B402 = require('b402-sdk');
const crypto = require('crypto');

// Initialize B402 SDK
let b402Client = null;

try {
  if (process.env.B402_API_KEY) {
    b402Client = new B402({
      apiKey: process.env.B402_API_KEY,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      chainId: parseInt(process.env.BASE_CHAIN_ID) || 8453,
      rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org'
    });
    console.log('✅ B402 SDK initialized');
  }
} catch (error) {
  console.warn('⚠️ B402 SDK initialization failed:', error.message);
}

// Payment configuration
const PAYMENT_CONFIG = {
  amount: parseFloat(process.env.PAYMENT_AMOUNT_USD) || 2.00,
  currency: 'USD',
  recipientAddress: process.env.PAYMENT_RECIPIENT_ADDRESS,
  requiredConfirmations: 1,
  // Supported tokens on Base
  supportedTokens: ['ETH', 'USDC', 'USDT']
};

/**
 * Create a new payment request
 * @param {string} sessionId - Unique session identifier
 * @returns {Promise<Object>} - Payment request details
 */
async function createPaymentRequest(sessionId) {
  try {
    if (!b402Client) {
      // Fallback for development/testing without B402
      return createMockPaymentRequest(sessionId);
    }

    const paymentRequest = await b402Client.createPaymentRequest({
      amount: PAYMENT_CONFIG.amount,
      currency: PAYMENT_CONFIG.currency,
      recipientAddress: PAYMENT_CONFIG.recipientAddress,
      metadata: {
        sessionId,
        service: 'resume-analysis',
        timestamp: Date.now()
      },
      expiryMinutes: 30
    });

    return {
      success: true,
      paymentId: paymentRequest.id,
      amount: PAYMENT_CONFIG.amount,
      currency: PAYMENT_CONFIG.currency,
      recipientAddress: PAYMENT_CONFIG.recipientAddress,
      checkoutUrl: paymentRequest.checkoutUrl,
      qrCode: paymentRequest.qrCode,
      expiresAt: paymentRequest.expiresAt,
      supportedTokens: PAYMENT_CONFIG.supportedTokens,
      sessionId
    };
  } catch (error) {
    console.error('Create Payment Error:', error);
    throw new Error(`Failed to create payment: ${error.message}`);
  }
}

/**
 * Create mock payment request for development
 * @param {string} sessionId - Session identifier
 * @returns {Object} - Mock payment details
 */
function createMockPaymentRequest(sessionId) {
  const mockPaymentId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  
  return {
    success: true,
    paymentId: mockPaymentId,
    amount: PAYMENT_CONFIG.amount,
    currency: PAYMENT_CONFIG.currency,
    recipientAddress: PAYMENT_CONFIG.recipientAddress || '0x0000000000000000000000000000000000000000',
    checkoutUrl: `https://checkout.b402.dev/pay/${mockPaymentId}`,
    qrCode: null,
    expiresAt,
    supportedTokens: PAYMENT_CONFIG.supportedTokens,
    sessionId,
    _mock: true
  };
}

/**
 * Verify payment status
 * @param {string} paymentId - Payment identifier
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} - Payment verification result
 */
async function verifyPayment(paymentId, sessionId) {
  try {
    if (!b402Client) {
      // Mock verification for development
      return mockVerifyPayment(paymentId, sessionId);
    }

    const verification = await b402Client.verifyPayment(paymentId, {
      requiredConfirmations: PAYMENT_CONFIG.requiredConfirmations
    });

    return {
      success: true,
      verified: verification.verified,
      paymentId,
      transactionHash: verification.transactionHash,
      amountPaid: verification.amount,
      token: verification.token,
      confirmations: verification.confirmations,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Verify Payment Error:', error);
    throw new Error(`Failed to verify payment: ${error.message}`);
  }
}

/**
 * Mock payment verification for development
 * @param {string} paymentId - Payment ID
 * @param {string} sessionId - Session ID
 * @returns {Object} - Mock verification result
 */
function mockVerifyPayment(paymentId, sessionId) {
  // In development mode, auto-approve payments after a short delay
  return {
    success: true,
    verified: true,
    paymentId,
    transactionHash: `0x${crypto.randomBytes(32).toString('hex')}`,
    amountPaid: PAYMENT_CONFIG.amount,
    token: 'USDC',
    confirmations: 1,
    timestamp: new Date().toISOString(),
    _mock: true
  };
}

/**
 * Handle payment webhook
 * @param {Object} payload - Webhook payload
 * @param {string} signature - Webhook signature
 * @returns {Object} - Processed webhook result
 */
function handleWebhook(payload, signature) {
  try {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.B402_WEBHOOK_SECRET || 'dev-secret')
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature && process.env.NODE_ENV === 'production') {
      throw new Error('Invalid webhook signature');
    }

    const { paymentId, status, transactionHash, amount, token } = payload;

    console.log(`💰 Payment ${paymentId} status: ${status}`);

    return {
      success: true,
      paymentId,
      status,
      transactionHash,
      amount,
      token,
      processed: true
    };
  } catch (error) {
    console.error('Webhook Error:', error);
    throw new Error(`Failed to process webhook: ${error.message}`);
  }
}

/**
 * Get payment configuration
 * @returns {Object} - Payment settings
 */
function getPaymentConfig() {
  return {
    ...PAYMENT_CONFIG,
    sdkInitialized: !!b402Client
  };
}

module.exports = {
  createPaymentRequest,
  verifyPayment,
  handleWebhook,
  getPaymentConfig,
  PAYMENT_CONFIG
};
