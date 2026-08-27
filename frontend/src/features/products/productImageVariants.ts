import type { Product } from '../catalog/catalogTypes'

export type ProductImageSource = {
  src: string
  alt: string
}

export function getProductImageSource(
  product: Product,
  selectedOptions: Record<string, string>,
): ProductImageSource {
  for (const [optionName, optionValue] of Object.entries(selectedOptions)) {
    const variant = product.image_variants?.[optionName]?.[optionValue]
    if (variant) {
      return {
        src: variant.image_reference,
        alt: variant.image_alt_text,
      }
    }
  }

  return {
    src: product.image_reference,
    alt: product.image_alt_text,
  }
}
