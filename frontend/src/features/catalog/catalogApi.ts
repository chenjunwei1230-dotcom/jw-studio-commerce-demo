import {
  expectedCategoryCounts,
  productCategories,
  type Product,
  type ProductCategory,
} from './catalogTypes'
import { apiUrl } from '../../config/api'

const productsEndpoint = apiUrl('/api/products')

export class CatalogApiError extends Error {
  readonly reason: 'unavailable' | 'invalid' | 'not-found'

  constructor(reason: 'unavailable' | 'invalid' | 'not-found') {
    super('The product catalog could not be loaded.')
    this.name = 'CatalogApiError'
    this.reason = reason
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isImageVariants(value: unknown): boolean {
  if (value === undefined) return true
  if (!isRecord(value)) return false

  return Object.values(value).every((optionVariants) => {
    if (!isRecord(optionVariants)) return false

    return Object.values(optionVariants).every(
      (variant) =>
        isRecord(variant) &&
        isNonEmptyString(variant.image_reference) &&
        isNonEmptyString(variant.image_alt_text),
    )
  })
}

function isProductCategory(value: unknown): value is ProductCategory {
  return typeof value === 'string' && productCategories.includes(value as ProductCategory)
}

function isPrice(value: unknown): value is string {
  return typeof value === 'string' && /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)
}

function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) return false

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isProductCategory(value.category) &&
    isPrice(value.price) &&
    isNonEmptyString(value.currency) &&
    isNonEmptyString(value.description) &&
    Array.isArray(value.materials) &&
    value.materials.every(isNonEmptyString) &&
    typeof value.care_instructions === 'string' &&
    isNonEmptyString(value.image_reference) &&
    isNonEmptyString(value.image_alt_text) &&
    isImageVariants(value.image_variants) &&
    isRecord(value.options) &&
    Object.values(value.options).every(
      (optionValues) => Array.isArray(optionValues) && optionValues.every(isNonEmptyString),
    ) &&
    typeof value.design_meaning === 'string' &&
    typeof value.creator_recommendation === 'string'
  )
}

function hasExpectedCatalogShape(products: Product[]): boolean {
  if (products.length === 0) return true
  if (products.length !== 13) return false

  const categoryCounts = products.reduce<Record<ProductCategory, number>>(
    (counts, product) => {
      counts[product.category] += 1
      return counts
    },
    { decorative: 0, clothing: 0, headwear: 0 },
  )

  return productCategories.every(
    (category) => categoryCounts[category] === expectedCategoryCounts[category],
  )
}

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  try {
    const response = await fetch(productsEndpoint, {
      headers: { Accept: 'application/json' },
      signal,
    })

    if (!response.ok) throw new CatalogApiError('unavailable')

    const payload: unknown = await response.json()
    if (!Array.isArray(payload) || !payload.every(isProduct) || !hasExpectedCatalogShape(payload)) {
      throw new CatalogApiError('invalid')
    }

    return payload
  } catch (error) {
    if (error instanceof CatalogApiError) throw error
    if (signal?.aborted) throw error
    throw new CatalogApiError('unavailable')
  }
}

export async function fetchProduct(productId: string, signal?: AbortSignal): Promise<Product> {
  try {
    const response = await fetch(apiUrl(`/api/products/${encodeURIComponent(productId)}`), {
      headers: { Accept: 'application/json' },
      signal,
    })

    if (response.status === 404) throw new CatalogApiError('not-found')
    if (!response.ok) throw new CatalogApiError('unavailable')

    const payload: unknown = await response.json()
    if (!isProduct(payload)) throw new CatalogApiError('invalid')

    return payload
  } catch (error) {
    if (error instanceof CatalogApiError) throw error
    if (signal?.aborted) throw error
    throw new CatalogApiError('unavailable')
  }
}
