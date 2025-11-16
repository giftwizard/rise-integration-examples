# Custom Checkout Flow with Rise.ai Gift Card Integration

This project demonstrates a **platform-agnostic** implementation for integrating Rise.ai gift card functionality into a custom checkout flow. It uses Express.js for the backend and vanilla JavaScript for the frontend, making it compatible with any e-commerce platform.

## Background

This integration guide provides step-by-step instructions for developers on how to validate and redeem Rise.ai gift cards in a custom checkout flow. The implementation follows best practices for handling gift card transactions, including fraud prevention checks and proper error handling.

The codebase is designed to be **platform-agnostic** - you can integrate it with any e-commerce platform (Shopify, WooCommerce, Magento, custom solutions, etc.) by adapting the cart/order management endpoints.

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Rise.ai account with API access

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

## Configuration

Before running the project, you'll need to configure your Rise.ai credentials. Create a `.env` file in the root directory:

```env
RISE_API_TOKEN=your_api_token_here
RISE_ACCOUNT_ID=your_account_id_here
RISE_API_VERSION=2020-07-16
RISE_SOURCE_TENANT_ID=your_tenant_id_here
RISE_SOURCE_CHANNEL_ID=your_channel_id_here
RISE_SOURCE_LOCATION_ID=your_location_id_here
PORT=3000
```

### Environment Variables

- `RISE_API_TOKEN`: Your Rise.ai API token (required)
- `RISE_ACCOUNT_ID`: Your Rise.ai account ID (required)
- `RISE_API_VERSION`: API version to use (optional, defaults to `2020-07-16`)
- `RISE_SOURCE_TENANT_ID`: Your shop ID or store identifier (required)
- `RISE_SOURCE_CHANNEL_ID`: Your channel ID (found in Rise.ai dashboard under "Channels") (required)
- `RISE_SOURCE_LOCATION_ID`: Your location ID (optional, if applicable)
- `PORT`: Server port (optional, defaults to 3000)

## Running the Project

Start the development server:

```bash
npm run dev
```

Or for production:

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## Integration Flow

The checkout flow follows these steps:

1. **User Applies Gift Card**: User enters their gift card code on the checkout page
2. **Query Gift Card Details**: Backend queries Rise.ai API to fetch gift card balance and details
3. **Perform Validation Checks**: Backend performs fraud checks and balance validation
4. **Apply Gift Card**: If valid, gift card is applied to checkout total
5. **Process Payment**: Gift card is debited first, then remaining balance is charged to credit card
6. **Handle Failures**: If payment fails, gift card transaction is voided

## Project Structure

```
custom-checkout-flow/
├── lib/
│   ├── rise-ai.js          # Rise.ai API integration utilities
│   └── validation.js       # Fraud checks and validation logic
├── public/
│   ├── index.html          # Checkout page
│   ├── success.html        # Order confirmation page
│   ├── checkout.js         # Frontend JavaScript
│   └── styles.css          # Stylesheet
├── server.js               # Express.js server
├── package.json            # Dependencies
└── README.md              # This file
```

## API Endpoints

### POST /api/cart
Create or retrieve a cart. Replace this with your actual cart management logic.

**Request Body:**
```json
{
  "cart": {
    "id": "cart-123",
    "items": [],
    "subtotal": 100.00,
    "discounts": []
  }
}
```

**Response:**
```json
{
  "cart": {
    "id": "cart-123",
    "items": [],
    "subtotal": 100.00,
    "discounts": []
  }
}
```

### GET /api/cart/:cartId
Get cart by ID. Replace with your actual cart retrieval logic.

### POST /api/gift-card/apply
Apply a gift card to the checkout.

**Request Body:**
```json
{
  "code": "GIFTCARD123",
  "cartId": "cart-123"
}
```

**Response:**
```json
{
  "success": true,
  "giftCard": {
    "code": "GIFTCARD123",
    "balance": "50.00",
    "giftCardId": "gc-id-123",
    "appliedAmount": "50.00",
    "sourceInfo": {...}
  }
}
```

### POST /api/checkout/complete
Complete the checkout process.

**Request Body:**
```json
{
  "cartId": "cart-123",
  "giftCardData": {
    "code": "GIFTCARD123",
    "giftCardId": "gc-id-123",
    "appliedAmount": "50.00",
    "sourceInfo": {...}
  },
  "paymentData": {
    "cardholderName": "John Doe",
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order-123",
  "message": "Order completed successfully"
}
```

## Integrating with Your Platform

To integrate this with your e-commerce platform, you need to:

1. **Replace Cart Management**: Update the `/api/cart` endpoints in `server.js` to use your actual cart/order system
2. **Update Payment Processing**: Replace the `processCreditCardPayment` function in `server.js` with your payment processor integration (Stripe, PayPal, etc.)
3. **Customize Frontend**: Modify `public/index.html` and `public/checkout.js` to match your design and integrate with your existing checkout flow
4. **Update Validation**: Modify `lib/validation.js` to work with your cart structure

## Key Components

### Rise.ai API Integration (`lib/rise-ai.js`)

Provides functions for:
- Querying gift card details by code
- Decreasing gift card balance (redeem)
- Increasing gift card balance (void transaction)
- Generating idempotency keys

### Validation Logic (`lib/validation.js`)

Implements fraud prevention checks:
- **Fraud Check 1**: Verifies no discounts are applied to gift card purchases
- **Fraud Check 2**: Ensures cart doesn't contain gift card products
- **Balance Check**: Validates gift card has available balance

## Error Handling

The integration includes comprehensive error handling for:
- Invalid gift card codes
- Zero balance gift cards
- Fraud prevention scenarios
- Payment failures (with automatic void of gift card transaction)
- API communication errors

## Important Notes

- **Idempotency Keys**: Always generate unique idempotency keys for each transaction to prevent duplicate charges
- **Transaction Order**: Always debit the gift card BEFORE processing credit card payment
- **Failure Handling**: If credit card payment fails, you MUST void the gift card transaction to refund the customer
- **Source Info**: Ensure sourceInfo is properly configured with your tenant, channel, and location IDs
- **Cart Structure**: The validation logic expects a cart object with `subtotal`, `items`, and `discounts` properties. Adjust `lib/validation.js` if your cart structure differs.

## API Integration Details

### Authentication

All API requests use Bearer Authentication as required by Rise.ai:

```javascript
'Authorization': `Bearer ${apiToken}`
```

### API Versioning

The integration includes the `Rise-API-Version` header (defaults to `2020-07-16`). You can override this by setting `RISE_API_VERSION` in your environment variables.

## Testing

1. Start the server: `npm run dev`
2. Open `http://localhost:3000` in your browser
3. Test the gift card flow with a valid Rise.ai gift card code
4. Test error scenarios (invalid codes, zero balance, etc.)

## Production Deployment

Before deploying to production:

1. Set all required environment variables
2. Replace placeholder cart/payment logic with your actual implementations
3. Add proper error logging and monitoring
4. Implement rate limiting and security measures
5. Use HTTPS for all API communications
6. Store sensitive data securely

## Conclusion

This project serves as a reference implementation for integrating Rise.ai gift cards into a custom checkout flow. The code is platform-agnostic and can be adapted to work with any e-commerce platform.

For more information about Rise.ai API endpoints, refer to the [Rise.ai API documentation](https://platform.rise.ai/docs).



