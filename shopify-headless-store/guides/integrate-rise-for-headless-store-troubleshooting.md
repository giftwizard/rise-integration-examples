# Troubleshooting

### Common Issues to Check
Ask yourself the following questions to help pinpoint the issue:

1. **Did you notify Rise-AI to enable headless mode?**
Make sure you've contacted the Rise team to activate the headless functionality for your store.

2. **Is the Rise script tag added properly with the correct shop URL?**
Ensure that the `<script>` tag you added in your product page's HTML has the correct Shopify store URL (e.g., `https://str.rise-ai.com/?shop=yourshopname.myshopify.com`). If you chose to load the script in a different way (e.g with js code instead of a script tag) make sure this loading works (e.g by opening the network tab and looking for a script with "str" prefix). 

3. **Did you add the correct class to the 'Add to Cart' button?**
Verify that you've added the class Rise-add-to-cart-button to the "Add to Cart" button in your gift card product page HTML.
Make sure you have no typos, that the `R` is upper cased, the rest is lower, with dashes in between. 
4. **Did you implement the Rise object correctly?**
Double-check that the window.Rise object is properly initialized in your product page's JavaScript with the correct product ID and callback function.

5. **Is the addToCart function implemented correctly?**
Make sure you have correctly implemented the addToCart function that handles adding the gift card product to the cart with the right properties. This function should be defined and working as expected.

6. **Pay attantion to race conditions!**
The Rise script looks for the "Add to Cart" button and adds our custom button underneath. If the Rise script runs before the button is rendered on the page, the script may fail.

To identify race condition cases, you can open the browser's console and manually reload the Rise script after the page has fully loaded. Here's how you can do it:

Open the browser's Developer Tools:

- In Chrome: Right-click on the page → Inspect → Go to the "Console" tab.
- In Firefox: Right-click on the page → Inspect → Go to the "Console" tab.
Reload the Rise script by pasting the following command into the console and pressing Enter:
```javascript
// Dont forget to replace YOUR_SHOPIFY_URL with your actual shop url
var script = document.createElement('script');
script.src = "https://str.rise-ai.com/?shop=YOUR_SHOPIFY_URL";
document.head.appendChild(script);

```


### Running a Troubleshooting Script

If you're experiencing issues with your Rise.ai integration, you can use the script we've provided to help you diagnose the problem. This script runs in the console of your product page and checks if the integration is set up correctly. 

The script is available [here](./integrate-rise-for-headless-store-troubleshooting-script.md)

### What to Do Next
If everything looks correct but you're still encountering issues, try clearing your browser cache and refreshing the page.

If any check fails, use the error messages in the console to troubleshoot the specific issue. The error messages will point out exactly which part of the integration is missing or incorrect.

Contact Rise support if the issue persists and the script indicates that your integration setup is correct but you're still experiencing problems.
