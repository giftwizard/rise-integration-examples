# Hydrogen Headless Example with Rise AI Integration

This project is an example of integrating Rise AI's gift card functionality into a Shopify Hydrogen-based store. 

It was built using Shopify's Hydrogen framework and demonstrates how to use custom hooks and Shopify's mock store to simulate the gift card flow in development.

## Background
The project was created using the following command:

```bash
npm create @shopify/hydrogen@latest -- --quickstart
```

This initializes a new Hydrogen project with a basic setup. It uses a mock Shopify store for local development. 
We slighly modified the cart (rendering product attributes) and the server implementions (CSP definition) for local development use , but these chagnes may not be needed at your production solution.

For simplicity's sake, every product is the store is being considered as a "gift card product", and we integrated the Rise.ai logic into it.

## Prerequisites
To run this project locally, you'll need to have Shopify CLI installed. If you don’t already have it, you can install it via Homebrew (for macOS users):

```bash
brew tap shopify/shopify
brew install shopify-cli
```
Alternatively, you can follow the Shopify CLI installation guide to install it on other systems.

In addition, install the project's dependencies using the following command from this dir:
```bash
npm i
```

## Running the Project
Once the prerequisites are in place, you can start the development server by running the following command:

```bash
shopify hydrogen dev
```
This will start a local development server at http://localhost:3000, where you can preview the Hydrogen store in action.

#### Mock Store Setup
Since we are using a Shopify mock store, the gift card product is not real. However, this example simulates the behavior you would see with a real product. In production, you would need call the hook we will describe below only for the actual gift card product, from your Shopify store.

### Adding `Rise-add-to-cart-button` class
At the [AddToCartButton](./app/components/AddToCartButton.jsx#L36) component, we have added the Rise-add-to-cart-button class to the actual `<button>` element, so it would be identified by the rise.ai script.

<div style="color: #5eacff; border-left: 5px solid #5eacff; padding: 10px; margin-bottom: 20px;">
  <strong>ℹ️ You can create your own Send As a Gift buttton!</strong>
  <p>Rise.ai script adds the `send as a gift` button to your DOM. If you prefer to add your own button, you can ignore adding this class and open the popup using Rise's SDK - this method will open the gifting popup for you - `window.RiseSdk.openGiftPopup` </p>
</div>

### Using the useRiseAiGiftButton Hook
In this project, we have integrated Rise.ai using a custom hook, named [useRiseAiGiftButton](./app/components/RiseAiGiftButton.jsx). The hook is being used to load rise script and to encapsulate the add to cart logic. This is a very opinionated implemetaion, and you can feel free to implement that whatever you want.

Important: The useRiseAiGiftButton hook should only be used on the gift card product page. The hook is responsible for configuring Rise.ai, loading the necessary script for the gift card functionality.

### Here’s a breakdown of how the useRiseAiGiftButton hook works:

#### Rise AI Configuration:

The hook first checks if the window object is available (ensuring it only runs in the browser, as the hydrogen framework also support SSR).

It then configures the Rise AI integration by setting a window.Rise object that contains relevant information about the gift card product. In a real world example make sure to configure it with the correct data.

The onGiftAdded callback is triggered whenever a gift card is successfully added to the cart.

#### Loading the Rise AI Script:
The useLoadScript hook from Hydrogen is used to dynamically load the Rise AI script from the following URL:
```javascript
useLoadScript('https://str.rise-ai.com/?shop=hydrogen-headless-add-to-cart.myshopify.com');
```
This script enables the interactive gift card functionality on the product page.

#### Adding Gift Cards to the Cart:

When a user selects a gift card and clicks to add it to the cart, the addToCart function is called. We have implemeted it using the cart actions and a fetcher, but this is a very opinionated way, feel free to implement in any way you want.

#### Usage Example
The hook is used in your component like so:

```javascript
import { useRiseAiGiftButton } from '~/components/useRiseAiGiftButton';

function GiftCardPage() {
    useRiseAiGiftButton();

    return (
        <div>
            {/* Gift card product details */}
        </div>
    );
}
```

## Conclusion
This Hydrogen-based project serves as an example of how to integrate Rise AI’s gift card functionality into a Shopify store. By using the useRiseAiGiftButton hook, you can dynamically add gift cards to the cart and trigger the necessary scripts for a smooth user experience. 

Remember that the project uses a mock Shopify store in development, and you should configure it for production with real product data.

