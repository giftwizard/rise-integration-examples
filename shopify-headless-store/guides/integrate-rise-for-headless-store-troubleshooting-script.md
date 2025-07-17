# Running a Troubleshooting Script

If you're experiencing issues with your Rise.ai integration, you can use the script we've provided to help you diagnose the problem. This script runs in the console of your product page and checks if the integration is set up correctly.

#### Running the Script
To run the script, follow these steps:

1. Open the product page on your Shopify store where you've integrated the Rise.ai gift card functionality.

- Open your browser’s Developer Tools:
    - In Chrome: Right-click on the page → Inspect → Go to the "Console" tab.
    - In Firefox: Right-click on the page → Inspect → Go to the "Console" tab.

- Paste the following script into the console and press Enter:

```javascript
// Rise.ai integration check script
function checkRiseIntegration() {
    if (window.Rise) {
        console.log("Rise object is found:", window.Rise);
        // Check for product ID and validate it
        const productId = window.Rise.product?.id;
        if (productId) {
            // Validate if the product ID is a non-empty string containing only numbers.
            if (/^\d+$/.test(productId)) {
                console.log("Product ID is a valid numeric value.");
            } else {
                console.error("Validation Error: Product ID is not valid. It should be a string containing only numbers and cannot be empty.");
            }
        }
    } else {
        console.error("Rise object not found. Please check your integration.");
    }

    // Check if the script is loaded
    const riseScript = document.querySelector('script[src*="rise-ai.com"]');
    if (riseScript) {
        console.log("Rise script loaded correctly.");
    } else {
        console.error("Rise script is not loaded. Make sure the script tag is added properly.");
    }

    // Check if 'Rise-add-to-cart-button' class is on the button
    const addToCartButton = document.querySelector('.Rise-add-to-cart-button');
    if (addToCartButton) {
        console.log("'Add to Cart' button with class '.Rise-add-to-cart-button' found.");
    } else {
        console.error("'Add to Cart' button not found. Please ensure the correct class is added.");
    }

    // Check if the add to cart logic is set up
    if (typeof addToCart === 'function') {
        console.log("Add to Cart function is implemented correctly.");
    } else {
        console.error("Add to Cart function not implemented. Please make sure it's defined.");
    }

    const shopUrl = window.Rise?.shop?.shop_url;
    if (shopUrl) {
        console.log("Shop URL:", shopUrl);

        // Fetch the Rise script content
        fetch(`https://str.rise-ai.com/?shop=${shopUrl}`)
            .then(response => response.text())
            .then(scriptText => {
                // Check if the script contains the required config line
                if (scriptText.includes('"headless_without_shopify_cart_flow":true,')) {
                    console.log("Store is configured as headless at Rise's side.");
                } else {
                    console.error("Store is not configured as headless at Rise's side, please contact the Rise team");
                }
            })
            .catch(error => {
                console.error("Failed to fetch the Rise script:", error);
            });
    } else {
        console.error("Shop URL not found in Rise object. Please verify you have added the window.Rise object correctly");
    }

    console.warn("Please verify manually that addToCart actually adds the product to the cart, the script cannot check it")
}

// Run the check
checkRiseIntegration();
```
This script will perform the following checks:

1. Rise object: It checks if the Rise object is properly defined in the window, which means the integration script has been loaded successfully.
2. Rise script: It verifies that the Rise.ai script is correctly loaded on the page.
3. Add to Cart button class: It checks if the "Add to Cart" button has the class Rise-add-to-cart-button, which is necessary for Rise.ai to detect the button.
4. Add to Cart function: It verifies that the addToCart function is correctly implemented.
