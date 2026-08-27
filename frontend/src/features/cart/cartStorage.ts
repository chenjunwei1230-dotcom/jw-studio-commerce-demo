import {
  CART_STORAGE_KEY,
  CART_STORAGE_VERSION,
  createCartItemId,
  emptyCartState,
  MAX_CART_QUANTITY,
  parsePriceToMinorUnits,
  type CartItem,
  type CartState,
  type SelectedOptions,
} from './cartTypes'
import { productCategories, type ProductCategory } from '../catalog/catalogTypes'

type StoredCartPayload = {
  version: typeof CART_STORAGE_VERSION
  items: Array<Omit<CartItem, 'unitPriceMinor'>>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isProductCategory(value: unknown): value is ProductCategory {
  return typeof value === 'string' && productCategories.includes(value as ProductCategory)
}

function isSelectedOptions(value: unknown): value is SelectedOptions {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([optionName, optionValue]) => isNonEmptyString(optionName) && isNonEmptyString(optionValue),
    )
  )
}

function restoreCartItem(value: unknown): CartItem | null {
  if (!isRecord(value)) return null

  const unitPrice = value.unitPrice
  const quantity = value.quantity
  const unitPriceMinor = typeof unitPrice === 'string'
    ? parsePriceToMinorUnits(unitPrice)
    : null

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.productId) ||
    !isNonEmptyString(value.productName) ||
    !isProductCategory(value.category) ||
    typeof unitPrice !== 'string' ||
    unitPriceMinor === null ||
    !isNonEmptyString(value.currency) ||
    !isSelectedOptions(value.selectedOptions) ||
    typeof quantity !== 'number' ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_CART_QUANTITY ||
    !isNonEmptyString(value.imageReference) ||
    !isNonEmptyString(value.imageAltText)
  ) {
    return null
  }

  const selectedOptions = { ...value.selectedOptions }
  if (value.id !== createCartItemId(value.productId, selectedOptions)) return null

  return {
    id: value.id,
    productId: value.productId,
    productName: value.productName,
    category: value.category,
    unitPrice,
    unitPriceMinor,
    currency: value.currency,
    selectedOptions,
    quantity,
    imageReference: value.imageReference,
    imageAltText: value.imageAltText,
  }
}

export function parseStoredCart(serializedCart: string | null): CartState {
  if (!serializedCart) return emptyCartState

  try {
    const parsed: unknown = JSON.parse(serializedCart)
    if (
      !isRecord(parsed) ||
      parsed.version !== CART_STORAGE_VERSION ||
      !Array.isArray(parsed.items)
    ) {
      return emptyCartState
    }

    const seenItemIds = new Set<string>()
    const items = parsed.items.flatMap((item) => {
      const restoredItem = restoreCartItem(item)
      if (restoredItem === null || seenItemIds.has(restoredItem.id)) return []

      seenItemIds.add(restoredItem.id)
      return [restoredItem]
    })

    return { items }
  } catch {
    return emptyCartState
  }
}

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readCartState(storage: Storage | null = getBrowserStorage()): CartState {
  if (storage === null) return emptyCartState

  try {
    return parseStoredCart(storage.getItem(CART_STORAGE_KEY))
  } catch {
    return emptyCartState
  }
}

export function writeCartState(
  state: CartState,
  storage: Storage | null = getBrowserStorage(),
) {
  if (storage === null) return

  const payload: StoredCartPayload = {
    version: CART_STORAGE_VERSION,
    items: state.items.map(({ unitPriceMinor: _unitPriceMinor, ...item }) => item),
  }

  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Storage can be unavailable or full; the in-memory cart remains usable.
  }
}
