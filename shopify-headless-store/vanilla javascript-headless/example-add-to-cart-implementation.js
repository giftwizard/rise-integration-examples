// Possible example for an addToCart implementation that uses shopify's add to cart api
const giftCardProductId = "8286234542279";
window.Rise = {
    full_product: { available: true },
    is_floating_cart_theme: true,
    is_product_page: true,
    product: { id: 8286234542279 },
    using_add_to_cart_flow: false,
    onGiftAdded: (lineItemProps) => addToCart(lineItemProps)
}

async function addToCart(lineItemProps) {
    const { gift } = lineItemProps;
    console.log('Gift added to cart:', lineItemProps);
    const { gift_id, message, email, name, customAmount, image, send_at } = gift
    const body = {
      id: '44801196261575',
      properties: {
        'Recipient Name': name,
        'Recipient Email': email,
        'Gift Message': message,
        _recipient_name: name,
        ...(email && { _recipient_email: email }),
        _gift_message: message,
        _gift_image: image,
        ...(send_at && { _gift_send_at: send_at })
        }
      }
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error adding to cart:', errorData);
        throw new Error('Failed to add to cart');
      }
      const responseData = await response.json();
      return responseData;
    }
