/**
 * Validation utilities for gift card checkout flow
 * 
 * This module provides functions to validate gift card usage
 * and prevent fraud scenarios.
 * Platform-agnostic implementation.
 */

/**
 * Check if cart contains any gift card products
 * @param {Cart} cart - The cart object
 * @returns {boolean}
 */
export function cartContainsGiftCard(cart) {
    if (!cart?.items || !Array.isArray(cart.items)) {
      return false;
    }
  
    // Check if any item has gift card attributes or tags
    return cart.items.some((item) => {
      // Check product tags
      if (item.tags?.some((tag) => 
        tag.toLowerCase().includes('gift') || 
        tag.toLowerCase().includes('giftcard')
      )) {
        return true;
      }
  
      // Check product type
      if (item.productType?.toLowerCase().includes('gift')) {
        return true;
      }
  
      // Check product title
      if (item.title?.toLowerCase().includes('gift card') || 
          item.title?.toLowerCase().includes('giftcard')) {
        return true;
      }
  
      // Check line item attributes
      if (item.attributes) {
        return item.attributes.some((attr) => 
          attr.key?.toLowerCase().includes('gift') ||
          attr.value?.toLowerCase().includes('gift')
        );
      }
  
      return false;
    });
  }
  
  /**
   * Check if discounts are applied to the cart
   * @param {Cart} cart - The cart object
   * @returns {boolean}
   */
  export function cartHasDiscounts(cart) {
    if (!cart) {
      return false;
    }
  
    // Check discount codes
    const hasDiscountCodes = cart.discounts?.some((discount) => discount.applicable !== false) || false;
  
    // Check if cart has discount amount
    const hasDiscountAmount = cart.discountAmount && parseFloat(cart.discountAmount) > 0;
  
    // Check if subtotal is greater than total (indicating discounts)
    const subtotal = parseFloat(cart.subtotal || 0);
    const total = parseFloat(cart.total || cart.subtotal || 0);
  
    return hasDiscountCodes || hasDiscountAmount || (subtotal > total);
  }
  
  /**
   * Validate gift card balance
   * @param {string|number} balance - The gift card balance
   * @returns {{valid: boolean; error?: string}}
   */
  export function validateGiftCardBalance(balance) {
    const balanceNum = parseFloat(String(balance));
  
    if (isNaN(balanceNum)) {
      return {valid: false, error: 'Invalid gift card balance'};
    }
  
    if (balanceNum <= 0) {
      return {valid: false, error: 'Gift card has no balance'};
    }
  
    return {valid: true};
  }
  
  /**
   * Perform all fraud checks before applying gift card
   * @param {Cart} cart - The cart object
   * @returns {{valid: boolean; error?: string}}
   */
  export function performFraudChecks(cart) {
    // Fraud Check 1: No discounts applied to gift card
    if (cartHasDiscounts(cart)) {
      return {
        valid: false,
        error: 'Cannot purchase a gift card with a discount.',
      };
    }
  
    // Fraud Check 2: No gift card products in cart
    if (cartContainsGiftCard(cart)) {
      return {
        valid: false,
        error: 'Cannot purchase a gift card with a gift card.',
      };
    }
  
    return {valid: true};
  }
  
  /**
   * @typedef {{
   *   items?: Array<{
   *     title?: string;
   *     tags?: string[];
   *     productType?: string;
   *     attributes?: Array<{
   *       key?: string;
   *       value?: string;
   *     }>;
   *   }>;
   *   discounts?: Array<{
   *     applicable?: boolean;
   *   }>;
   *   discountAmount?: string | number;
   *   subtotal?: string | number;
   *   total?: string | number;
   * }} Cart
   */
  
  