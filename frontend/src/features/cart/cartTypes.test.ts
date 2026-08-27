import { describe, expect, it } from 'vitest'

import type { Product } from '../catalog/catalogTypes'
import {
  cartReducer,
  createCartItemId,
  formatMinorUnits,
  getCartItemCount,
  getCartSubtotalMinor,
  hasCompleteProductSelection,
  parsePriceToMinorUnits,
  type CartState,
} from './cartTypes'
import { parseStoredCart, readCartState, writeCartState } from './cartStorage'
import { CART_STORAGE_KEY } from './cartTypes'

const demoProduct: Product = {
  id: 'demo-tee',
  name: 'Demo Keep Showing Up Tee',
  category: 'clothing',
  price: '68',
  currency: 'MYR',
  description: 'A synthetic product for focused cart state checks.',
  materials: ['Cotton'],
  care_instructions: 'Wash gently.',
  image_reference: '/assets/products/demo-tee.jpg',
  image_alt_text: 'Synthetic blue tee on a studio frame.',
  options: {
    size: ['S', 'M', 'L'],
    colour: ['Deep Blue', 'Soft White'],
  },
  design_meaning: 'A reminder to keep showing up.',
  creator_recommendation: 'A good everyday frame.',
}

function createSelection(size = 'M', colour = 'Deep Blue') {
  return { size, colour }
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
    key: (index) => Array.from(values.keys())[index] ?? null,
    get length() {
      return values.size
    },
  }
}

describe('cart state', () => {
  it('parses prices into exact minor units without floating-point money arithmetic', () => {
    expect(parsePriceToMinorUnits('68')).toBe(6800)
    expect(parsePriceToMinorUnits('12.5')).toBe(1250)
    expect(parsePriceToMinorUnits('12.50')).toBe(1250)
    expect(parsePriceToMinorUnits('12.345')).toBeNull()
    expect(formatMinorUnits(6800, 'MYR')).toBe('RM 68.00')
  })

  it('does not add an incomplete or invalid product selection', () => {
    const initialState: CartState = { items: [] }

    expect(hasCompleteProductSelection(demoProduct, { size: 'M' })).toBe(false)
    expect(
      cartReducer(initialState, {
        type: 'add-product',
        product: demoProduct,
        selectedOptions: { size: 'M' },
      }),
    ).toEqual(initialState)
    expect(
      cartReducer(initialState, {
        type: 'add-product',
        product: demoProduct,
        selectedOptions: { size: 'Unknown', colour: 'Deep Blue' },
      }),
    ).toEqual(initialState)
  })

  it('adds a valid product selection with display data and quantity one', () => {
    const state = cartReducer(
      { items: [] },
      { type: 'add-product', product: demoProduct, selectedOptions: createSelection() },
    )

    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toMatchObject({
      productId: 'demo-tee',
      productName: 'Demo Keep Showing Up Tee',
      selectedOptions: createSelection(),
      quantity: 1,
      unitPrice: '68',
      unitPriceMinor: 6800,
      imageReference: '/assets/products/demo-tee.jpg',
    })
  })

  it('keeps the selected variant image description in the cart', () => {
    const state = cartReducer(
      { items: [] },
      {
        type: 'add-product',
        product: demoProduct,
        selectedOptions: createSelection(),
        image: {
          imageReference: '/assets/products/demo-tee-deep-blue.jpg',
          imageAltText: 'Deep blue tee on a studio frame.',
        },
      },
    )

    expect(state.items[0]).toMatchObject({
      imageReference: '/assets/products/demo-tee-deep-blue.jpg',
      imageAltText: 'Deep blue tee on a studio frame.',
    })
  })

  it('merges the same product and options but keeps different options separate', () => {
    const firstAdd = cartReducer(
      { items: [] },
      { type: 'add-product', product: demoProduct, selectedOptions: createSelection() },
    )
    const merged = cartReducer(firstAdd, {
      type: 'add-product',
      product: demoProduct,
      selectedOptions: { colour: 'Deep Blue', size: 'M' },
    })
    const separate = cartReducer(merged, {
      type: 'add-product',
      product: demoProduct,
      selectedOptions: createSelection('L', 'Deep Blue'),
    })

    expect(merged.items).toHaveLength(1)
    expect(merged.items[0]?.quantity).toBe(2)
    expect(separate.items).toHaveLength(2)
    expect(separate.items.map((item) => item.id)).toEqual([
      createCartItemId('demo-tee', createSelection()),
      createCartItemId('demo-tee', createSelection('L', 'Deep Blue')),
    ])
  })

  it('changes quantity without allowing it to fall below one', () => {
    const added = cartReducer(
      { items: [] },
      { type: 'add-product', product: demoProduct, selectedOptions: createSelection() },
    )
    const itemId = added.items[0]?.id ?? ''
    const increased = cartReducer(added, { type: 'increase-quantity', itemId })
    const decreased = cartReducer(increased, { type: 'decrease-quantity', itemId })
    const stillOne = cartReducer(decreased, { type: 'decrease-quantity', itemId })

    expect(increased.items[0]?.quantity).toBe(2)
    expect(decreased.items[0]?.quantity).toBe(1)
    expect(stillOne.items[0]?.quantity).toBe(1)
  })

  it('removes an item, reports count, and recalculates subtotal from application data', () => {
    const first = cartReducer(
      { items: [] },
      { type: 'add-product', product: demoProduct, selectedOptions: createSelection() },
    )
    const withTwo = cartReducer(first, {
      type: 'add-product',
      product: demoProduct,
      selectedOptions: createSelection('L', 'Soft White'),
    })
    const withQuantity = cartReducer(withTwo, {
      type: 'increase-quantity',
      itemId: withTwo.items[0]?.id ?? '',
    })
    const removed = cartReducer(withQuantity, {
      type: 'remove-item',
      itemId: withQuantity.items[1]?.id ?? '',
    })

    expect(getCartItemCount(withQuantity)).toBe(3)
    expect(getCartSubtotalMinor(withQuantity)).toBe(20400)
    expect(removed.items).toHaveLength(1)
    expect(getCartItemCount(removed)).toBe(2)
    expect(getCartSubtotalMinor(removed)).toBe(13600)
  })

  it('clears the cart after a validated simulated payment', () => {
    const added = cartReducer(
      { items: [] },
      { type: 'add-product', product: demoProduct, selectedOptions: createSelection() },
    )

    expect(cartReducer(added, { type: 'clear-cart' })).toEqual({ items: [] })
  })
})

describe('cart storage recovery', () => {
  it('recovers a valid cart after a refresh without persisting derived totals', () => {
    const storage = createMemoryStorage()
    const state = cartReducer(
      { items: [] },
      { type: 'add-product', product: demoProduct, selectedOptions: createSelection() },
    )

    writeCartState(state, storage)
    const storedPayload = JSON.parse(storage.getItem(CART_STORAGE_KEY) ?? '{}') as {
      items?: Array<Record<string, unknown>>
    }
    const recovered = readCartState(storage)

    expect(storedPayload.items?.[0]).not.toHaveProperty('unitPriceMinor')
    expect(recovered).toEqual(state)
  })

  it('returns an empty cart for invalid, corrupted, or duplicate stored data', () => {
    expect(parseStoredCart('{not-json')).toEqual({ items: [] })
    expect(parseStoredCart(JSON.stringify({ version: 2, items: [] }))).toEqual({ items: [] })
    expect(parseStoredCart(JSON.stringify({ version: 1, items: [{ quantity: -1 }] }))).toEqual({
      items: [],
    })

    const validState = cartReducer(
      { items: [] },
      { type: 'add-product', product: demoProduct, selectedOptions: createSelection() },
    )
    const serialized = JSON.stringify({
      version: 1,
      items: [
        { ...validState.items[0], unitPriceMinor: 1 },
        { ...validState.items[0] },
      ],
    })
    const recovered = parseStoredCart(serialized)

    expect(recovered.items).toHaveLength(1)
    expect(recovered.items[0]?.unitPriceMinor).toBe(6800)
  })
})
