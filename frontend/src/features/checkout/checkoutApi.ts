import {
  CheckoutApiError,
  createCheckoutApiError,
  isCheckoutResult,
  type CheckoutRequest,
  type CheckoutResult,
} from './checkoutTypes'
import { apiUrl } from '../../config/api'

export async function submitDemoCheckout(
  request: CheckoutRequest,
  signal?: AbortSignal,
): Promise<CheckoutResult> {
  try {
    const response = await fetch(apiUrl('/api/demo/checkout'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    })

    let payload: unknown = null
    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    if (!response.ok) throw createCheckoutApiError(response.status, payload)
    if (!isCheckoutResult(payload)) {
      throw new CheckoutApiError('invalid', 'The demo checkout response was not valid. Try again.')
    }

    return payload
  } catch (error) {
    if (error instanceof CheckoutApiError) throw error
    if (signal?.aborted) throw error
    throw new CheckoutApiError(
      'unavailable',
      'The demo checkout service is unavailable. Try again in a moment.',
    )
  }
}
