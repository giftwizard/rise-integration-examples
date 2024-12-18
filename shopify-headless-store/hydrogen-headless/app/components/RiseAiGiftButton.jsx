import React, { useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { useLoadScript } from '@shopify/hydrogen';
import { CartForm } from '@shopify/hydrogen';
import { useAside } from '~/components/Aside';

// In a real app, the variables below would be fetched from an API, url query params, or a context provider
// Remember to call window.RiseSdk.refreshGift() in case these values changes (e.g if user replaces variant without a page reload)
const GIFT_CARD_PRODUCT_ID = "9702880870691";
const PRODUCT_VARIANT_ID = "43696932126742";

// Configures Rise AI for the gift card flow
function configureRiseAi(addToCartCallback) {
    /* mind that if we want to replace the window.rise configuration between renders,
     * we also need to refresh the rise sdk in case it's already loaded
     * This can be done using window.RiseSdk.refreshGift();
     */
    if (typeof window !== 'undefined' && !window.Rise?.product) {
        window.Rise = {
            full_product: { available: true },
            is_floating_cart_theme: true,
            is_product_page: true,
            product: { id: GIFT_CARD_PRODUCT_ID },
            using_add_to_cart_flow: false,
            onGiftAdded: addToCartCallback
        };
    }
}

// Helper function to create the payload for adding the item to the cart
function createAddToCartPayload(gift) {
    return {
        action: CartForm.ACTIONS.LinesAdd,
        inputs: {
            lines: [{
                merchandiseId: `gid://shopify/ProductVariant/${PRODUCT_VARIANT_ID}`,
                quantity: 1,
                attributes: [
                    // the first 3 properties are needed for several specific 
                    // setups, yet, as it is not harmful lets add them all
                    { key: 'Recipient Name', value: gift.name },
                    { key: 'Recipient Email', value: gift.email },
                    { key: 'Gift Message', value: gift.message },
                    { key: '_gift_id', value: gift._gift_id },
                    { key: '_recipient_name', value: gift.name },
                    { key: '_recipient_email', value: gift.email },
                    { key: '_gift_message', value: gift.message },
                    { key: '_gift_image', value: gift.email },
                    { key: '_gift_send_at', value: gift.send_at }
                ].filter(prop => !!prop.value)
            }]
        }
    };
}

export function useRiseAiGiftButton() {
    const { open } = useAside();
    const fetcher = useFetcher();

    // Function that triggers the add-to-cart flow
    const addToCart = async (lineItemProps) => {
        const { gift } = lineItemProps;

        try {
            const payload = createAddToCartPayload(gift);

            fetcher.submit(
                { [CartForm.INPUT_NAME]: JSON.stringify(payload) },
                { method: "post", action: `/cart?` }
            );

            open('cart');  // Open the cart after adding the gift
        } catch (error) {
            console.error('Error adding gift to cart:', error);
        }
    };

    // Initialize the Rise AI configuration
    useEffect(() => {
        configureRiseAi(addToCart);
    }, [addToCart]);

    // Load Rise AI script asynchronously
    useLoadScript('https://str.rise-ai.com/?shop=hydrogen-headless-add-to-cart.myshopify.com');
}
