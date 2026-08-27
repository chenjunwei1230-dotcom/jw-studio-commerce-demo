import type { Product, ProductCategory } from '../catalog/catalogTypes'

export const CART_STORAGE_KEY = 'jw-studio-cart-v1'
export const CART_STORAGE_VERSION = 1
export const MAX_CART_QUANTITY = 99

export type SelectedOptions = Record<string, string>

export type CartItem = {
  id: string
  productId: string
  productName: string
  category: ProductCategory
  unitPrice: string
  unitPriceMinor: number
  currency: string
  selectedOptions: SelectedOptions
  quantity: number
  imageReference: string
  imageAltText: string
}

export type CartImageSelection = Pick<CartItem, 'imageReference' | 'imageAltText'>

export type CartState = {
  items: CartItem[]
}

export type CartAction =
  | {
      type: 'add-product'
      product: Product
      selectedOptions: SelectedOptions
      image?: CartImageSelection
    }
  | { type: 'increase-quantity'; itemId: string }
  | { type: 'decrease-quantity'; itemId: string }
  | { type: 'remove-item'; itemId: string }
  | { type: 'clear-cart' }

export const emptyCartState: CartState = { items: [] }

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isPriceString(value: unknown): value is string {
  return typeof value === 'string' && /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)
}

export function parsePriceToMinorUnits(price: string): number | null {
  if (!isPriceString(price)) return null

  const [wholeUnits, fractionalUnits = ''] = price.split('.')
  const minorUnitsText = `${wholeUnits}${fractionalUnits.padEnd(2, '0')}`
  const minorUnits = Number(minorUnitsText)

  return Number.isSafeInteger(minorUnits) && minorUnits >= 0 ? minorUnits : null
}

export function formatMinorUnits(minorUnits: number, currency: string) {
  if (!Number.isSafeInteger(minorUnits) || minorUnits < 0) return '—'

  const minorUnitsText = String(minorUnits).padStart(3, '0')
  const majorUnits = minorUnitsText.slice(0, -2)
  const fractionalUnits = minorUnitsText.slice(-2)
  const currencyLabel = currency === 'MYR' ? 'RM' : currency

  return `${currencyLabel} ${majorUnits}.${fractionalUnits}`
}

function isSelectedOptions(value: unknown): value is SelectedOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.entries(value).every(
      ([optionName, optionValue]) => isNonEmptyString(optionName) && isNonEmptyString(optionValue),
    )
  )
}

function sortedOptionEntries(selectedOptions: SelectedOptions) {
  return Object.entries(selectedOptions).sort(([firstName], [secondName]) =>
    firstName.localeCompare(secondName),
  )
}

export function createCartItemId(productId: string, selectedOptions: SelectedOptions) {
  const optionsKey = sortedOptionEntries(selectedOptions)
    .map(([optionName, optionValue]) => `${encodeURIComponent(optionName)}=${encodeURIComponent(optionValue)}`)
    .join('&')

  return `${productId}::${optionsKey}`
}

export function hasCompleteProductSelection(product: Product, selectedOptions: SelectedOptions) {
  if (!isSelectedOptions(selectedOptions)) return false

  const matchesProductOptions = Object.entries(selectedOptions).every(([optionName, optionValue]) =>
    product.options[optionName]?.includes(optionValue),
  )

  if (!matchesProductOptions) return false

  return Object.entries(product.options)
    .filter(([, values]) => values.length > 0)
    .every(([optionName]) => isNonEmptyString(selectedOptions[optionName]))
}

export function createCartItem(
  product: Product,
  selectedOptions: SelectedOptions,
  image: CartImageSelection = {
    imageReference: product.image_reference,
    imageAltText: product.image_alt_text,
  },
): CartItem | null {
  if (!hasCompleteProductSelection(product, selectedOptions)) return null

  const unitPriceMinor = parsePriceToMinorUnits(product.price)
  if (unitPriceMinor === null) return null

  return {
    id: createCartItemId(product.id, selectedOptions),
    productId: product.id,
    productName: product.name,
    category: product.category,
    unitPrice: product.price,
    unitPriceMinor,
    currency: product.currency,
    selectedOptions: { ...selectedOptions },
    quantity: 1,
    imageReference: image.imageReference,
    imageAltText: image.imageAltText,
  }
}

export function getCartItemLineTotalMinor(item: CartItem) {
  return item.unitPriceMinor * item.quantity
}

export function getCartSubtotalMinor(state: CartState) {
  return state.items.reduce((subtotal, item) => subtotal + getCartItemLineTotalMinor(item), 0)
}

export function getCartItemCount(state: CartState) {
  return state.items.reduce((count, item) => count + item.quantity, 0)
}

function updateItemQuantity(state: CartState, itemId: string, change: 1 | -1) {
  return {
    items: state.items.map((item) => {
      if (item.id !== itemId) return item

      const nextQuantity = item.quantity + change
      return {
        ...item,
        quantity: Math.min(MAX_CART_QUANTITY, Math.max(1, nextQuantity)),
      }
    }),
  }
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add-product': {
      const newItem = createCartItem(action.product, action.selectedOptions, action.image)
      if (newItem === null) return state

      const existingItem = state.items.find((item) => item.id === newItem.id)
      if (existingItem) {
        return updateItemQuantity(state, existingItem.id, 1)
      }

      return { items: [...state.items, newItem] }
    }
    case 'increase-quantity':
      return updateItemQuantity(state, action.itemId, 1)
    case 'decrease-quantity':
      return updateItemQuantity(state, action.itemId, -1)
    case 'remove-item':
      return { items: state.items.filter((item) => item.id !== action.itemId) }
    case 'clear-cart':
      return emptyCartState
  }
}
