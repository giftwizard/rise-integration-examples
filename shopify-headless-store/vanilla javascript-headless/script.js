/* 
 * Adding Rise object 
 * 1. As explained in the documentation, you need to add the Rise object to the window object.
 * 2. Please update the giftCardProductId with the product id of the gift card product.
 * 3. The onGiftAdded function will be called once the user clicks on the `Add to cart` button
 *    at the 'Send as a gift' modal. 
 */
const giftCardProductId = "9764370645275";
window.Rise = {
    full_product: { available: true },
    is_floating_cart_theme: true,
    is_product_page: true,
    product: { id: giftCardProductId },
    using_add_to_cart_flow: false,
    onGiftAdded: (lineItemProps) => addToCart(lineItemProps)
}

/* 
 * Add to cart function
 * 1. After the 'Add to cart' button at the 'Send as a gift' modal is clicked, this function will be called.
 * 2. The function is responsible for adding the gift card to the cart.
 */

/*******************
 * IMPORTANT NOTE: *
 *******************
 *
 * This is a dummy function. 
 * You need to implement the actual logic to add the gift card to the cart.
 */
function addToCart(lineItemProps) {
    const { gift } = lineItemProps;
    const { _gift_id, message, email, name } = gift

    console.log('Gift added to cart:', lineItemProps);
    alert(`Gift added to cart: ${name} ${email} ${message}\n\n` +
        `1. In a real scenario, you need to implement the logic to add the gift card intem to the cart.\n` +
        `2. You can do it the same way you add a normal product to the cart, just don't forget to add the properies you got here.\n`);
}
