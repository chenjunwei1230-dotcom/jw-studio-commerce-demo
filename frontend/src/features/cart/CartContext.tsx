import { useEffect, useMemo, useReducer, type ReactNode } from 'react'

import {
  cartReducer,
  emptyCartState,
  getCartItemCount,
} from './cartTypes'
import { CartContext, type CartContextValue } from './cart-context'
import { readCartState, writeCartState } from './cartStorage'

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, emptyCartState, () => readCartState())

  useEffect(() => {
    writeCartState(state)
  }, [state])

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      itemCount: getCartItemCount(state),
      addProduct: (product, selectedOptions, image) =>
        dispatch({ type: 'add-product', product, selectedOptions, image }),
      increaseQuantity: (itemId) => dispatch({ type: 'increase-quantity', itemId }),
      decreaseQuantity: (itemId) => dispatch({ type: 'decrease-quantity', itemId }),
      removeItem: (itemId) => dispatch({ type: 'remove-item', itemId }),
      clearCart: () => dispatch({ type: 'clear-cart' }),
    }),
    [state],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
