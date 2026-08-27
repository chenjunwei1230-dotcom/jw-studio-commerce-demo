import { createContext } from 'react'

import type { Product } from '../catalog/catalogTypes'
import type { CartImageSelection, CartState, SelectedOptions } from './cartTypes'

export type CartContextValue = {
  state: CartState
  itemCount: number
  addProduct: (
    product: Product,
    selectedOptions: SelectedOptions,
    image?: CartImageSelection,
  ) => void
  increaseQuantity: (itemId: string) => void
  decreaseQuantity: (itemId: string) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
