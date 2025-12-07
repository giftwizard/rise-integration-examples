/**
 * Frontend JavaScript for custom checkout flow
 * Platform-agnostic vanilla JavaScript implementation
 */

const API_BASE_URL = window.location.origin;

// State management
let cart = {
  id: null,
  subtotal: 0,
  items: [],
};

let appliedGiftCard = null;

// Request tracking to prevent race conditions
let activeGiftCardRequest = null;
let activeCheckoutRequest = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initializeCart();
  setupEventListeners();
  updateTotals();
});

/**
 * Initialize cart (create or retrieve existing)
 */
async function initializeCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({cart: null}),
    });

    const data = await response.json();
    cart = data.cart;
    updateTotals();
  } catch (error) {
    console.error('Error initializing cart:', error);
    showError('checkout-error', 'Failed to initialize cart');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Gift card apply button
  document.getElementById('apply-gift-card-btn').addEventListener('click', handleApplyGiftCard);

  // Gift card input enter key
  document.getElementById('gift-card-code').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyGiftCard();
    }
  });

  // Remove gift card button
  document.getElementById('remove-gift-card-btn').addEventListener('click', handleRemoveGiftCard);

  // Card number formatting
  document.getElementById('card-number').addEventListener('input', formatCardNumber);
  document.getElementById('expiry-date').addEventListener('input', formatExpiryDate);
  document.getElementById('cvv').addEventListener('input', formatCVV);

  // Payment form submission
  document.getElementById('payment-form').addEventListener('submit', handleCheckout);
}

/**
 * Handle gift card application
 * Prevents race conditions by tracking active requests and aborting previous ones
 */
async function handleApplyGiftCard() {
  const codeInput = document.getElementById('gift-card-code');
  const code = codeInput.value.trim().toUpperCase();

  if (!code) {
    showError('gift-card-error', 'Please enter a gift card code');
    return;
  }

  // Cancel any previous gift card request to prevent stale data
  if (activeGiftCardRequest) {
    activeGiftCardRequest.abort();
    activeGiftCardRequest = null;
  }

  const applyBtn = document.getElementById('apply-gift-card-btn');
  
  // Prevent concurrent requests
  if (applyBtn.disabled) {
    return;
  }

  applyBtn.disabled = true;
  applyBtn.textContent = 'Applying...';
  hideError('gift-card-error');

  // Create AbortController for this specific request
  const abortController = new AbortController();
  activeGiftCardRequest = abortController;

  try {
    const response = await fetch(`${API_BASE_URL}/api/gift-card/apply`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        code,
        cartId: cart.id,
      }),
      signal: abortController.signal, // Allow cancellation
    });

    // Verify this is still the active request (not aborted)
    if (activeGiftCardRequest !== abortController) {
      return; // Request was cancelled, ignore response
    }

    const data = await response.json();

    // Double-check this is still the active request before processing
    if (activeGiftCardRequest !== abortController) {
      return; // Request was cancelled, ignore response
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to apply gift card');
    }

    if (data.success && data.giftCard) {
      // Verify the response matches the code we requested
      if (data.giftCard.code === code) {
        appliedGiftCard = data.giftCard;
        displayAppliedGiftCard(data.giftCard);
        updateTotals();
        codeInput.value = '';
      } else {
        throw new Error('Gift card response does not match requested code');
      }
    }
  } catch (error) {
    // Don't show error if request was aborted (user initiated new request)
    if (error.name === 'AbortError') {
      return;
    }
    showError('gift-card-error', error.message);
  } finally {
    // Only reset if this is still the active request
    if (activeGiftCardRequest === abortController) {
      activeGiftCardRequest = null;
      applyBtn.disabled = false;
      applyBtn.textContent = 'Apply';
    }
  }
}

/**
 * Display applied gift card
 */
function displayAppliedGiftCard(giftCard) {
  document.getElementById('applied-code').textContent = giftCard.code;
  document.getElementById('applied-amount').textContent = `-$${giftCard.appliedAmount}`;
  document.getElementById('applied-gift-card').style.display = 'flex';
  document.getElementById('gift-card-code').style.display = 'none';
  document.getElementById('apply-gift-card-btn').style.display = 'none';
}

/**
 * Handle gift card removal
 */
function handleRemoveGiftCard() {
  appliedGiftCard = null;
  document.getElementById('applied-gift-card').style.display = 'none';
  document.getElementById('gift-card-code').style.display = 'block';
  document.getElementById('apply-gift-card-btn').style.display = 'block';
  updateTotals();
}

/**
 * Update payment totals
 */
function updateTotals() {
  const subtotal = cart.subtotal || 0;
  const giftCardAmount = appliedGiftCard ? parseFloat(appliedGiftCard.appliedAmount) : 0;
  const total = Math.max(0, subtotal - giftCardAmount);

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  
  if (giftCardAmount > 0) {
    document.getElementById('gift-card-discount').textContent = `-$${giftCardAmount.toFixed(2)}`;
    document.getElementById('gift-card-row').style.display = 'flex';
  } else {
    document.getElementById('gift-card-row').style.display = 'none';
  }

  document.getElementById('total').textContent = `$${total.toFixed(2)}`;

  // Hide credit card form if total is 0
  const paymentForm = document.getElementById('payment-form');
  if (total === 0) {
    paymentForm.style.display = 'none';
  } else {
    paymentForm.style.display = 'block';
  }
}

/**
 * Handle checkout completion
 * Prevents race conditions by tracking active requests and aborting previous ones
 */
async function handleCheckout(e) {
  e.preventDefault();

  const total = parseFloat(document.getElementById('total').textContent.replace('$', ''));
  
  if (total > 0) {
    const paymentData = {
      cardholderName: document.getElementById('cardholder-name').value,
      cardNumber: document.getElementById('card-number').value.replace(/\s/g, ''),
      expiryDate: document.getElementById('expiry-date').value,
      cvv: document.getElementById('cvv').value,
    };

    // Validate payment data
    if (!paymentData.cardholderName || !paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
      showError('checkout-error', 'Please fill in all payment fields');
      return;
    }
  }

  const completeBtn = document.getElementById('complete-checkout-btn');
  
  // Prevent concurrent checkout requests
  if (activeCheckoutRequest) {
    return; // Already processing checkout
  }

  completeBtn.disabled = true;
  completeBtn.textContent = 'Processing...';
  hideError('checkout-error');

  // Cancel any active gift card request to ensure we have latest state
  if (activeGiftCardRequest) {
    activeGiftCardRequest.abort();
    activeGiftCardRequest = null;
  }

  // Create AbortController for this specific request
  const abortController = new AbortController();
  activeCheckoutRequest = abortController;

  // Capture current gift card state to prevent race conditions
  const currentGiftCardData = appliedGiftCard ? {...appliedGiftCard} : null;
  const currentCartId = cart.id;

  try {
    const paymentData = total > 0 ? {
      cardholderName: document.getElementById('cardholder-name').value,
      cardNumber: document.getElementById('card-number').value.replace(/\s/g, ''),
      expiryDate: document.getElementById('expiry-date').value,
      cvv: document.getElementById('cvv').value,
    } : null;

    const response = await fetch(`${API_BASE_URL}/api/checkout/complete`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        cartId: currentCartId,
        giftCardData: currentGiftCardData,
        paymentData,
      }),
      signal: abortController.signal, // Allow cancellation
    });

    // Verify this is still the active request (not aborted)
    if (activeCheckoutRequest !== abortController) {
      return; // Request was cancelled, ignore response
    }

    const data = await response.json();

    // Double-check this is still the active request before processing
    if (activeCheckoutRequest !== abortController) {
      return; // Request was cancelled, ignore response
    }

    if (!response.ok) {
      throw new Error(data.error || 'Checkout failed');
    }

    // Clear active request before redirect
    activeCheckoutRequest = null;

    // Redirect to success page
    window.location.href = `/success.html?orderId=${data.orderId}`;
  } catch (error) {
    // Don't show error if request was aborted
    if (error.name === 'AbortError') {
      return;
    }
    showError('checkout-error', error.message);
    
    // Only reset if this is still the active request
    if (activeCheckoutRequest === abortController) {
      activeCheckoutRequest = null;
      completeBtn.disabled = false;
      completeBtn.textContent = 'Complete Checkout';
    }
  }
}

/**
 * Format card number input
 */
function formatCardNumber(e) {
  let value = e.target.value.replace(/\s/g, '');
  value = value.replace(/\D/g, '');
  
  // Add spaces every 4 digits
  value = value.match(/.{1,4}/g)?.join(' ') || value;
  e.target.value = value;
}

/**
 * Format expiry date input
 */
function formatExpiryDate(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  e.target.value = value;
}

/**
 * Format CVV input
 */
function formatCVV(e) {
  e.target.value = e.target.value.replace(/\D/g, '');
}

/**
 * Show error message
 */
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

/**
 * Hide error message
 */
function hideError(elementId) {
  document.getElementById(elementId).style.display = 'none';
}

