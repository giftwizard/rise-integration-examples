import { CartForm } from '@shopify/hydrogen';
import React, { useEffect } from 'react';
import { useRiseAiGiftButton } from './RiseAiGiftButton';


/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: () => void;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}) {

  useRiseAiGiftButton();

  return (
    <CartForm route="/cart" inputs={{ lines }} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            type="submit"
            /* The 'Rise-add-to-cart-button' class name need to be added so Rise.ai
             * script can find the button and use it to create its own send as a gift button.
             *
             * If you prefer to create your own button, you may skip this class name, and use window.RiseSdk.openGiftPopup()
             * as the onClick handler of the button you create.
            /*/
            className="Rise-add-to-cart-button"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
