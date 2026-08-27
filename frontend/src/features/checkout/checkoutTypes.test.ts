import { describe, expect, it } from 'vitest'

import type { CartState } from '../cart/cartTypes'
import {
  buildCheckoutRequest,
  createCheckoutApiError,
  demoPaymentMethods,
  isCheckoutResult,
} from './checkoutTypes'

const cartState: CartState = {
  items: [
    {
      id: 'keep-showing-up-keychain::colour=Orange',
      productId: 'keep-showing-up-keychain',
      productName: 'Keep Showing Up Keychain',
      category: 'decorative',
      unitPrice: '12',
      unitPriceMinor: 1200,
      currency: 'MYR',
      selectedOptions: { colour: 'Orange' },
      quantity: 2,
      imageReference: '/assets/products/keychain.jpg',
      imageAltText: 'Synthetic keychain image.',
    },
  ],
}

describe('checkout request and response boundaries', () => {
  it('builds a request from transactional cart fields only', () => {
    const request = buildCheckoutRequest(cartState, 'demo_card')

    expect(request).toEqual({
      items: [
        {
          product_id: 'keep-showing-up-keychain',
          selected_options: { colour: 'Orange' },
          quantity: 2,
        },
      ],
      payment_method: 'demo_card',
    })
    expect(request).not.toHaveProperty('subtotal')
    expect(request?.items[0]).not.toHaveProperty('price')
    expect(request?.items[0]).not.toHaveProperty('image_reference')
  })

  it('does not build a checkout request for an empty cart', () => {
    expect(buildCheckoutRequest({ items: [] }, 'demo_wallet')).toBeNull()
  })

  it('accepts only the known synthetic payment methods', () => {
    expect(demoPaymentMethods.map((method) => method.value)).toEqual([
      'demo_card',
      'demo_wallet',
    ])
  })

  it('accepts a backend-validated result shape', () => {
    expect(
      isCheckoutResult({
        demo: true,
        payment_status: 'simulated_success',
        payment_method: 'demo_card',
        message: 'Demo payment approved. No real payment was processed.',
        synthetic_reference: 'demo-abc123',
        summary: {
          items: [
            {
              product_id: 'keep-showing-up-keychain',
              name: 'Keep Showing Up Keychain',
              selected_options: { colour: 'Orange' },
              quantity: 2,
              unit_price: '12.00',
              line_total: '24.00',
              currency: 'MYR',
            },
          ],
          subtotal: '24.00',
          total: '24.00',
          currency: 'MYR',
        },
      }),
    ).toBe(true)
  })

  it('rejects malformed backend result data and maps safe errors', () => {
    expect(isCheckoutResult({ demo: true, payment_status: 'paid' })).toBe(false)

    const error = createCheckoutApiError(422, {
      detail: {
        message: 'Review the checkout fields and try again.',
        issues: [{ field: 'items[0].quantity', code: 'invalid', message: 'Choose a quantity.' }],
      },
    })

    expect(error.kind).toBe('validation')
    expect(error.issues[0]?.field).toBe('items[0].quantity')
  })
})
