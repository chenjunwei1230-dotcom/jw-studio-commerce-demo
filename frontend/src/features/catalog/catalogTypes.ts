export const productCategories = ['decorative', 'clothing', 'headwear'] as const

export type ProductCategory = (typeof productCategories)[number]

export type ProductImageVariant = {
  image_reference: string
  image_alt_text: string
}

export type Product = {
  id: string
  name: string
  category: ProductCategory
  price: string
  currency: string
  description: string
  materials: string[]
  care_instructions: string
  image_reference: string
  image_alt_text: string
  image_variants?: Record<string, Record<string, ProductImageVariant>>
  options: Record<string, string[]>
  design_meaning: string
  creator_recommendation: string
}

export const expectedCategoryCounts: Record<ProductCategory, number> = {
  decorative: 5,
  clothing: 5,
  headwear: 3,
}

export const categoryLabels: Record<ProductCategory, string> = {
  decorative: 'Decorative',
  clothing: 'Clothing',
  headwear: 'Headwear',
}

export function formatProductPrice(product: Pick<Product, 'price' | 'currency'>) {
  const currencyLabel = product.currency === 'MYR' ? 'RM' : product.currency
  return `${currencyLabel} ${product.price}`
}
