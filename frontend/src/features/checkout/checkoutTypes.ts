import type { CartState } from '../cart/cartTypes'

export const demoPaymentMethods = [
  {
    value: 'demo_card',
    label: 'Demo card simulation',
    description: 'A synthetic card flow. No card details are collected.',
  },
  {
    value: 'demo_wallet',
    label: 'Demo wallet simulation',
    description: 'A synthetic wallet flow. No account or payment data is requested.',
  },
] as const

export type DemoPaymentMethod = (typeof demoPaymentMethods)[number]['value']

export type CheckoutRequest = {
  items: Array<{
    product_id: string
    selected_options: Record<string, string>
    quantity: number
  }>
  payment_method: DemoPaymentMethod
}

export type CheckoutSummaryItem = {
  product_id: string
  name: string
  selected_options: Record<string, string>
  quantity: number
  unit_price: string
  line_total: string
  currency: string
}

export type CheckoutResult = {
  demo: true
  payment_status: 'simulated_success'
  payment_method: DemoPaymentMethod
  message: string
  synthetic_reference: string
  summary: {
    items: CheckoutSummaryItem[]
    subtotal: string
    total: string
    currency: string
  }
}

export type CheckoutIssue = {
  field: string
  code: string
  message: string
}

export type CheckoutErrorKind = 'validation' | 'unavailable' | 'invalid'

export class CheckoutApiError extends Error {
  readonly kind: CheckoutErrorKind
  readonly issues: CheckoutIssue[]

  constructor(kind: CheckoutErrorKind, message: string, issues: CheckoutIssue[] = []) {
    super(message)
    this.name = 'CheckoutApiError'
    this.kind = kind
    this.issues = issues
  }
}

export function buildCheckoutRequest(
  cartState: CartState,
  paymentMethod: DemoPaymentMethod,
): CheckoutRequest | null {
  if (cartState.items.length === 0) return null

  return {
    items: cartState.items.map((item) => ({
      product_id: item.productId,
      selected_options: { ...item.selectedOptions },
      quantity: item.quantity,
    })),
    payment_method: paymentMethod,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isPaymentMethod(value: unknown): value is DemoPaymentMethod {
  return demoPaymentMethods.some((method) => method.value === value)
}

function isSelectedOptions(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.entries(value).every(
      ([optionName, optionValue]) => isNonEmptyString(optionName) && isNonEmptyString(optionValue),
    )
  )
}

function isMoneyString(value: unknown): value is string {
  return typeof value === 'string' && /^(?:0|[1-9]\d*)\.\d{2}$/.test(value)
}

function isCheckoutSummaryItem(value: unknown): value is CheckoutSummaryItem {
  if (!isRecord(value)) return false

  return (
    isNonEmptyString(value.product_id) &&
    isNonEmptyString(value.name) &&
    isSelectedOptions(value.selected_options) &&
    typeof value.quantity === 'number' &&
    Number.isSafeInteger(value.quantity) &&
    value.quantity > 0 &&
    isMoneyString(value.unit_price) &&
    isMoneyString(value.line_total) &&
    isNonEmptyString(value.currency)
  )
}

export function isCheckoutResult(value: unknown): value is CheckoutResult {
  if (!isRecord(value) || value.demo !== true || value.payment_status !== 'simulated_success') {
    return false
  }

  if (!isPaymentMethod(value.payment_method) || !isNonEmptyString(value.message)) return false
  if (!isNonEmptyString(value.synthetic_reference) || !isRecord(value.summary)) return false

  return (
    Array.isArray(value.summary.items) &&
    value.summary.items.length > 0 &&
    value.summary.items.every(isCheckoutSummaryItem) &&
    isMoneyString(value.summary.subtotal) &&
    isMoneyString(value.summary.total) &&
    isNonEmptyString(value.summary.currency)
  )
}

function getErrorBody(payload: unknown) {
  if (!isRecord(payload)) return null
  const detail = isRecord(payload.detail) ? payload.detail : payload
  const issues = Array.isArray(detail.issues)
    ? detail.issues.filter((issue): issue is CheckoutIssue => {
        if (!isRecord(issue)) return false
        return isNonEmptyString(issue.field) && isNonEmptyString(issue.code) && isNonEmptyString(issue.message)
      })
    : []

  return {
    message: isNonEmptyString(detail.message) ? detail.message : null,
    issues,
  }
}

export function createCheckoutApiError(status: number, payload: unknown) {
  const errorBody = getErrorBody(payload)

  if (status === 422) {
    return new CheckoutApiError(
      'validation',
      errorBody?.message ?? 'Review the checkout fields and try again.',
      errorBody?.issues,
    )
  }

  if (status === 503 || status >= 500) {
    return new CheckoutApiError(
      'unavailable',
      'The demo checkout service is unavailable. Try again in a moment.',
    )
  }

  return new CheckoutApiError(
    'invalid',
    errorBody?.message ?? 'The demo checkout response was not valid. Try again.',
    errorBody?.issues,
  )
}
