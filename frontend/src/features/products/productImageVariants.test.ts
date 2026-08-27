import { describe, expect, it } from 'vitest'

import type { Product } from '../catalog/catalogTypes'
import { getProductImageSource } from './productImageVariants'

const product: Product = {
  id: 'demo-tee',
  name: 'Demo Tee',
  category: 'clothing',
  price: '49.00',
  currency: 'MYR',
  description: 'Synthetic demo tee.',
  materials: ['100% cotton'],
  care_instructions: 'Wash cold.',
  image_reference: '/assets/products/demo-tee-white.jpg',
  image_alt_text: 'White synthetic demo tee.',
  image_variants: {
    colour: {
      'Deep Blue': {
        image_reference: '/assets/products/demo-tee-blue.jpg',
        image_alt_text: 'Deep blue synthetic demo tee.',
      },
    },
  },
  options: { size: ['S', 'M'], colour: ['Soft White', 'Deep Blue'] },
  design_meaning: 'A learning frame.',
  creator_recommendation: 'A calm first piece.',
}

describe('getProductImageSource', () => {
  it('uses the selected image variant when one exists', () => {
    expect(getProductImageSource(product, { colour: 'Deep Blue' })).toEqual({
      src: '/assets/products/demo-tee-blue.jpg',
      alt: 'Deep blue synthetic demo tee.',
    })
  })

  it('falls back to the base image for the default or unknown selection', () => {
    expect(getProductImageSource(product, { colour: 'Soft White' })).toEqual({
      src: '/assets/products/demo-tee-white.jpg',
      alt: 'White synthetic demo tee.',
    })
  })
})
