/**
 * Platform-agnostic Express.js server for custom checkout flow
 * with Rise.ai gift card integration
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  queryGiftCardByCode,
  decreaseGiftCardBalance,
  increaseGiftCardBalance,
  generateIdempotencyKey,
} from './lib/rise-ai.js';
import {
  performFraudChecks,
  validateGiftCardBalance,
} from './lib/validation.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get Rise.ai configuration from environment variables
function getRiseConfig() {
  return {
    apiToken: process.env.RISE_API_TOKEN,
    accountId: process.env.RISE_ACCOUNT_ID,
    apiVersion: process.env.RISE_API_VERSION,
  };
}

function getSourceInfo() {
  return {
    sourceTenantId: process.env.RISE_SOURCE_TENANT_ID || '',
    sourceChannelId: process.env.RISE_SOURCE_CHANNEL_ID || '',
    sourceLocationId: process.env.RISE_SOURCE_LOCATION_ID || '',
  };
}

/**
 * POST /api/cart
 * Get or create a cart
 * In a real implementation, this would integrate with your cart/order system
 */
app.post('/api/cart', (req, res) => {
  // This is a placeholder - replace with your actual cart logic
  const cart = req.body.cart || {
    id: `cart-${Date.now()}`,
    items: [],
    subtotal: 0,
    discounts: [],
  };

  res.json({cart});
});

/**
 * GET /api/cart/:cartId
 * Get cart by ID
 */
app.get('/api/cart/:cartId', (req, res) => {
  // This is a placeholder - replace with your actual cart retrieval logic
  const cart = {
    id: req.params.cartId,
    items: [],
    subtotal: 0,
    discounts: [],
  };

  res.json({cart});
});

/**
 * POST /api/gift-card/apply
 * Apply a gift card to the checkout
 */
app.post('/api/gift-card/apply', async (req, res) => {
  const {code, cartId} = req.body;

  if (!code) {
    return res.status(400).json({error: 'Gift card code is required'});
  }

  const riseConfig = getRiseConfig();
  const sourceInfo = getSourceInfo();

  if (!riseConfig.apiToken || !riseConfig.accountId) {
    return res.status(500).json({error: 'Rise.ai configuration is missing'});
  }

  try {
    // Step 2: Query gift card details
    const giftCardResponse = await queryGiftCardByCode(code, riseConfig);

    // Handle different response structures from Rise.ai API
    let giftCard;
    if (giftCardResponse?.data && Array.isArray(giftCardResponse.data)) {
      giftCard = giftCardResponse.data[0];
    } else if (Array.isArray(giftCardResponse)) {
      giftCard = giftCardResponse[0];
    } else {
      giftCard = giftCardResponse;
    }

    if (!giftCard || !giftCard.code) {
      return res.status(404).json({error: 'Gift card not found'});
    }

    // Get cart for validation (replace with your actual cart retrieval)
    // In a real implementation, you would fetch from your cart/order database
    const cart = {
      id: cartId,
      items: [],
      subtotal: 0,
      discounts: [],
    };

    // Step 4: Perform fraud checks
    const fraudCheck = performFraudChecks(cart);
    if (!fraudCheck.valid) {
      return res.status(400).json({error: fraudCheck.error});
    }

    // Step 4.3: Balance check
    const balanceCheck = validateGiftCardBalance(giftCard.balance);
    if (!balanceCheck.valid) {
      return res.status(400).json({error: balanceCheck.error});
    }

    const balance = parseFloat(giftCard.balance);
    const cartTotal = parseFloat(cart.subtotal || 0);
    const appliedAmount = Math.min(balance, cartTotal);

    return res.json({
      success: true,
      giftCard: {
        code: giftCard.code,
        balance: giftCard.balance,
        giftCardId: giftCard.id,
        appliedAmount: appliedAmount.toFixed(2),
        sourceInfo: giftCard.sourceInfo || sourceInfo,
      },
    });
  } catch (error) {
    console.error('Error applying gift card:', error);
    return res.status(500).json({
      error: error.message || 'Failed to apply gift card',
    });
  }
});

/**
 * POST /api/checkout/complete
 * Complete the checkout process
 */
app.post('/api/checkout/complete', async (req, res) => {
  const {cartId, giftCardData, paymentData} = req.body;

  const riseConfig = getRiseConfig();
  const sourceInfo = getSourceInfo();

  if (!riseConfig.apiToken || !riseConfig.accountId) {
    return res.status(500).json({error: 'Rise.ai configuration is missing'});
  }

  try {
    // Get cart (replace with your actual cart retrieval)
    // In a real implementation, you would fetch from your cart/order database
    const cart = {
      id: cartId,
      items: [],
      subtotal: 0,
      discounts: [],
    };
    const cartTotal = parseFloat(cart.subtotal || 0);

    let giftCardTransactionId = null;

    // Step 5.1: Debit the gift card first (if applied)
    if (giftCardData && parseFloat(giftCardData.appliedAmount) > 0) {
      const idempotencyKey = generateIdempotencyKey();

      const decreaseResult = await decreaseGiftCardBalance(
        {
          giftCardId: giftCardData.giftCardId,
          amount: giftCardData.appliedAmount,
          idempotencyKey,
          sourceInfo: giftCardData.sourceInfo || sourceInfo,
          redeemOptions: {
            orderId: cartId,
            liability: false,
            totalPrice: cartTotal.toFixed(2),
            orderNumber: cartId,
          },
        },
        riseConfig,
      );

      giftCardTransactionId = decreaseResult?.transactionId;

      if (!giftCardTransactionId) {
        throw new Error('Failed to debit gift card');
      }
    }

    // Step 6: Process remaining balance with credit card
    const remainingAmount = giftCardData
      ? cartTotal - parseFloat(giftCardData.appliedAmount)
      : cartTotal;

    if (remainingAmount > 0 && paymentData) {
      // Process credit card payment
      // Replace this with your actual payment processor integration
      const paymentSuccess = await processCreditCardPayment(
        paymentData,
        remainingAmount,
      );

      if (!paymentSuccess) {
        // Payment failed - void the gift card transaction
        if (giftCardTransactionId && giftCardData) {
          const voidIdempotencyKey = generateIdempotencyKey();

          await increaseGiftCardBalance(
            {
              giftCardId: giftCardData.giftCardId,
              amount: giftCardData.appliedAmount,
              idempotencyKey: voidIdempotencyKey,
              sourceInfo: giftCardData.sourceInfo || sourceInfo,
              voidOptions: {
                transactionId: giftCardTransactionId,
              },
            },
            riseConfig,
          );
        }

        return res.status(400).json({
          error: 'Payment failed. Gift card transaction has been voided.',
        });
      }
    }

    // Success - return order confirmation
    return res.json({
      success: true,
      orderId: `order-${Date.now()}`,
      message: 'Order completed successfully',
    });
  } catch (error) {
    console.error('Error processing checkout:', error);

    // If gift card was debited but something else failed, void it
    if (giftCardTransactionId && giftCardData) {
      try {
        const voidIdempotencyKey = generateIdempotencyKey();
        const sourceInfo = getSourceInfo();

        await increaseGiftCardBalance(
          {
            giftCardId: giftCardData.giftCardId,
            amount: giftCardData.appliedAmount,
            idempotencyKey: voidIdempotencyKey,
            sourceInfo: giftCardData.sourceInfo || sourceInfo,
            voidOptions: {
              transactionId: giftCardTransactionId,
            },
          },
          riseConfig,
        );
      } catch (voidError) {
        console.error('Error voiding gift card transaction:', voidError);
      }
    }

    return res.status(500).json({
      error: error.message || 'Checkout processing failed',
    });
  }
});

/**
 * Placeholder function for credit card payment processing
 * Replace this with your actual payment processor integration
 * @param {Object} paymentData
 * @param {number} amount
 * @returns {Promise<boolean>}
 */
async function processCreditCardPayment(paymentData, amount) {
  // TODO: Integrate with your payment processor (Stripe, PayPal, etc.)
  // This is a placeholder that simulates payment processing
  console.log('Processing credit card payment:', {
    amount,
    cardNumber: paymentData.cardNumber?.substring(0, 4) + '****',
  });

  // Simulate payment processing
  // In production, replace this with actual payment processor API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 95% success rate for demo purposes
      resolve(Math.random() > 0.05);
    }, 1000);
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to set the following environment variables:');
  console.log('- RISE_API_TOKEN');
  console.log('- RISE_ACCOUNT_ID');
  console.log('- RISE_SOURCE_TENANT_ID');
  console.log('- RISE_SOURCE_CHANNEL_ID');
  console.log('- RISE_SOURCE_LOCATION_ID (optional)');
});

