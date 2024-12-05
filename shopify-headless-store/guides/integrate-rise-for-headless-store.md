
# Integrate headless store

Follow these 5 steps to integrate Rise.ai's gift card functionality into your headless Shopify store.

#### 1. Prerequisites
- **Enterprise Plan** - Ensure that you are subscribed to Rise.ai's Enterprise plan
- **Notify the Rise Team** - By default, Rise.ai is set up for traditional Shopify themes. To enable headless mode, please notify the Rise team to activate this feature for your store.
- **Gift Card Product ID** - Create a gift card product in your Shopify store (follow the guide [here](https://help.rise.ai/en/articles/2233029-setting-up-your-gift-cards#h_9b8fb9f72c)) and make sure you have the product ID ready.

#### 2. Add the Rise.ai Script to Your Store
To enable the Rise.ai functionality, you need to include a script tag in the `<head>` section of your product page.

```html
<script src="https://str.rise-ai.com/?shop=%YOUR_MYSHOPIFY_URL%" defer></script>
```
Note: Replace %YOUR_MYSHOPIFY_URL% with your actual Shopify store URL.
This script loads the necessary JavaScript to manage the "Send as Gift" functionality.

<div style="color: #5eacff; border-left: 5px solid #5eacff; padding: 10px; margin-bottom: 20px;">
  <strong>ℹ️ Script should run after the add to cart button is renderd</strong>
  <p>Make sure the script has a `defer` tag</p>
</div>


#### 3. Make the "Add to Cart" Button identifiable 
To allow Rise-AI script to detect your "Add to Cart" button, add the class `Rise-add-to-cart-button` to the button on your gift card product page.
```html
<button class="Rise-add-to-cart-button">Add Gift Card to Cart</button>
```
<div style="color: #5eacff; border-left: 5px solid #5eacff; padding: 10px; margin-bottom: 20px;">
  <strong>ℹ️ You can use the open popup directly</strong>
  <p>Rise.ai script adds the `send as a gift` button to your DOM. If you prefer to add your own button, you can ignore adding this class and open the popup using Rise's SDK - this method will open the gifting popup for you - `window.RiseSdk.openGiftPopup()` </p>
</div>
<div style="color: #5eacff; border-left: 5px solid #5eacff; padding: 10px; margin-bottom: 20px;">
  <strong>ℹ️ Make sure you don't have typos</strong>
  <p>Verify the 'R' is upper cased, the rest are lower cased, and there are dashes in between</p>
</div>

#### 4. Add the Rise Object to Your Product Page
In your product page's JavaScript, add the following object to configure Rise.ai script. Replace `GIFTCARD_PRODUCT_ID` with your actual gift card product ID.

```javascript
window.Rise = {
    full_product: { available: true },
    is_floating_cart_theme: true,
    is_product_page: true,
    product: { id: "GIFTCARD_PRODUCT_ID" },
    using_add_to_cart_flow: false,
    onGiftAdded: (lineItemProps) => addToCart(lineItemProps)
}
/* Mind that if we want to replace the window.rise configuration during runtime (e.g after a variant replacement),
 * we also need to refresh the rise sdk in case it's already loaded
 * This can be done using window.RiseSdk.refreshGift();
 */
```

You also need to implement the addToCart function. Here's an example:

```javascript
function getProductId() {
    // This function should return the gift card product ID.
    return GIFTCARD_PRODUCT_ID;
}

async function addToCart({ gift }) {
    const { _gift_id, message, email, name } = gift;
    const productId = getProductId();
    
    const productToBeAdded = {
        id: productId,
        properties: {
            _gift_id,
            Name: name,
            Email: email,
            Message: message
        }
    };

    // Use your existing addToCart function to add the product to the cart.
    await addToCart(productToBeAdded);
}
```
In this code:

- The lineItemProps contains information about the gift card (e.g., recipient's name, email, and message).
- addToCart adds the gift card product to the Shopify cart, including the relevant properties.

#### 5. Test the Integration
Once you've completed the integration steps, you can test the functionality by visiting the gift card product page on your store.

1. The "Send as a gift card" button should appear.
2. Clicking the button should open a modal for customers to enter recipient details (e.g., name, email, message).
3. After filling out the form, clicking the "Add to Cart" button in the modal should add the gift card to the cart.
4. Go to the checkout page and verify that the gift card line item appears correctly with all the relevant properties (e.g., amount, recipient name, email, etc.).
