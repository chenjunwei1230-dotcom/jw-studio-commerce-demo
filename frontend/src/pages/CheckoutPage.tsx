import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { LoadingState } from '../components/StatePanel'
import { useCart } from '../features/cart/useCart'
import { formatMinorUnits, getCartItemLineTotalMinor, getCartSubtotalMinor } from '../features/cart/cartTypes'
import {
  CheckoutApiError,
  buildCheckoutRequest,
  demoPaymentMethods,
  type CheckoutResult,
  type DemoPaymentMethod,
} from '../features/checkout/checkoutTypes'
import { submitDemoCheckout } from '../features/checkout/checkoutApi'
import './Checkout.css'

function formatOptionLabel(optionName: string) {
  return optionName
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatIssueField(field: string) {
  return field
    .replace(/^items\[(\d+)\]/, 'Item $1')
    .replace(/\.selected_options$/, ' options')
    .replace(/\.quantity$/, ' quantity')
    .replace(/\.product_id$/, ' product')
}

function CheckoutReview() {
  const { state } = useCart()
  const subtotal = getCartSubtotalMinor(state)
  const currency = state.items[0]?.currency ?? 'MYR'

  return (
    <section className="checkout-review" aria-labelledby="checkout-review-title">
      <div className="checkout-section-heading">
        <p className="eyebrow">REVIEW / FROM YOUR COLLECTION</p>
        <h2 id="checkout-review-title">The selected frames.</h2>
      </div>
      <div className="checkout-review__items">
        {state.items.map((item, index) => (
          <article className="checkout-review-item" key={item.id}>
            <div className="checkout-review-item__marker" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="checkout-review-item__content">
              <div className="checkout-review-item__heading">
                <div>
                  <p className="checkout-review-item__category">{item.category}</p>
                  <h3>{item.productName}</h3>
                </div>
                <strong>{formatMinorUnits(getCartItemLineTotalMinor(item), item.currency)}</strong>
              </div>
              {Object.keys(item.selectedOptions).length > 0 ? (
                <ul aria-label={`Selected options for ${item.productName}`}>
                  {Object.entries(item.selectedOptions)
                    .sort(([firstName], [secondName]) => firstName.localeCompare(secondName))
                    .map(([optionName, optionValue]) => (
                      <li key={optionName}>
                        <span>{formatOptionLabel(optionName)}</span>
                        <strong>{optionValue}</strong>
                      </li>
                    ))}
                </ul>
              ) : null}
              <p className="checkout-review-item__meta">
                Quantity {item.quantity} · {formatMinorUnits(item.unitPriceMinor, item.currency)} each
              </p>
            </div>
          </article>
        ))}
      </div>
      <div className="checkout-review__subtotal">
        <span>Browser review subtotal</span>
        <strong>{formatMinorUnits(subtotal, currency)}</strong>
      </div>
      <p className="checkout-review__note">
        This is a review value only. The backend will read the catalog again and calculate the
        validated total.
      </p>
    </section>
  )
}

function CheckoutErrorPanel({
  error,
  onRetry,
}: {
  error: CheckoutApiError
  onRetry: () => void
}) {
  return (
    <div className="checkout-error" role="alert">
      <p className="eyebrow">CHECKOUT / ANOTHER TAKE</p>
      <h2>{error.kind === 'unavailable' ? 'The demo service is taking a pause.' : 'Review this frame.'}</h2>
      <p>{error.message}</p>
      {error.issues.length > 0 ? (
        <ul>
          {error.issues.map((issue, index) => (
            <li key={`${issue.field}-${issue.code}-${index}`}>
              <strong>{formatIssueField(issue.field)}:</strong> {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
      <button className="button button--secondary" type="button" onClick={onRetry}>
        Try again <span aria-hidden="true">↻</span>
      </button>
    </div>
  )
}

function EmptyCheckout() {
  return (
    <div className="checkout-empty page-container">
      <p className="eyebrow">CHECKOUT / NO SELECTION</p>
      <h1>There are no frames to confirm yet.</h1>
      <p>
        Add a product to your collection before starting the simulated checkout. No payment has
        been requested.
      </p>
      <div className="checkout-empty__actions">
        <Link className="button button--primary" to="/shop">
          Browse the collection <span aria-hidden="true">↗</span>
        </Link>
        <Link className="text-link" to="/cart">
          Back to cart <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  )
}

function PaymentSuccessTransition({ result }: { result: CheckoutResult }) {
  const navigate = useNavigate()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      navigate('/demo-result', { replace: true, state: { result } })
    }, 1600)

    return () => window.clearTimeout(timeoutId)
  }, [navigate, result])

  return (
    <section className="checkout-success" aria-labelledby="checkout-success-title">
      <div className="page-container checkout-success__inner">
        <p className="eyebrow">FRAME / COMPLETE</p>
        <div className="checkout-success__mark" aria-hidden="true">
          <span>✓</span>
        </div>
        <h1 id="checkout-success-title">The next frame is complete.</h1>
        <p className="checkout-success__message">
          Demo payment approved. No real payment was processed.
        </p>
        <div className="checkout-success__progress" aria-hidden="true">
          <span />
        </div>
        <p className="checkout-success__meta" role="status" aria-live="polite">
          Opening your validated demo result…
        </p>
      </div>
    </section>
  )
}

export function CheckoutPage() {
  const { state, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<DemoPaymentMethod | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentError, setShowPaymentError] = useState(false)
  const [error, setError] = useState<CheckoutApiError | null>(null)
  const [successResult, setSuccessResult] = useState<CheckoutResult | null>(null)

  if (successResult) return <PaymentSuccessTransition result={successResult} />
  if (state.items.length === 0) return <EmptyCheckout />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (paymentMethod === null) {
      setShowPaymentError(true)
      return
    }

    const request = buildCheckoutRequest(state, paymentMethod)
    if (request === null) return

    setShowPaymentError(false)
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await submitDemoCheckout(request)
      clearCart()
      setSuccessResult(result)
    } catch (caughtError) {
      if (caughtError instanceof CheckoutApiError) {
        setError(caughtError)
      } else {
        setError(
          new CheckoutApiError(
            'unavailable',
            'The demo checkout service is unavailable. Try again in a moment.',
          ),
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="checkout-page">
      <section className="checkout-hero" aria-labelledby="checkout-title">
        <div className="page-container checkout-hero__inner">
          <div>
            <p className="eyebrow">FRAME / DEMO CHECKOUT</p>
            <h1 id="checkout-title">One more frame, for learning.</h1>
            <p className="checkout-hero__lede">
              Review your collection and choose a simulated payment path. This is a learning demo,
              not a real purchase.
            </p>
          </div>
          <div className="checkout-hero__notice" role="note">
            <span className="checkout-hero__notice-mark" aria-hidden="true">!</span>
            <strong>No real payment will be processed.</strong>
            <span>No card, CVV, bank password, or payment token is requested.</span>
          </div>
        </div>
      </section>

      <section className="checkout-content" aria-label="Demo checkout form">
        <div className="page-container checkout-layout">
          <CheckoutReview />

          <form className="checkout-form" onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting}>
              <legend className="eyebrow">PAYMENT PATH / SIMULATED ONLY</legend>
              <p className="checkout-form__intro">
                Choose one required synthetic path. No personal or payment credentials are collected.
              </p>
              <div className="payment-methods">
                {demoPaymentMethods.map((method) => (
                  <label
                    className={`payment-method${paymentMethod === method.value ? ' payment-method--selected' : ''}`}
                    key={method.value}
                  >
                    <input
                      aria-describedby={showPaymentError ? 'payment-method-error' : undefined}
                      aria-invalid={showPaymentError}
                      type="radio"
                      name="payment_method"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => {
                        setPaymentMethod(method.value)
                        setShowPaymentError(false)
                        setError(null)
                      }}
                    />
                    <span className="payment-method__copy">
                      <strong>{method.label}</strong>
                      <span>{method.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {showPaymentError ? (
              <p className="checkout-form__required" id="payment-method-error" role="alert">
                Choose a simulated payment path before continuing.
              </p>
            ) : null}

            {error ? <CheckoutErrorPanel error={error} onRetry={() => setError(null)} /> : null}

            <div className="checkout-form__actions">
              {isSubmitting ? <LoadingState label="Validating the demo selection..." /> : null}
              <button
                className="button button--primary checkout-form__submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Running demo payment...' : 'Run demo payment'}
                <span aria-hidden="true">↗</span>
              </button>
              <p className="checkout-form__note">
                The backend validates the product, options, quantity, and total before returning a
                synthetic result.
              </p>
            </div>

            <Link className="text-link checkout-form__back" to="/cart">
              <span aria-hidden="true">←</span> Return to cart
            </Link>
          </form>
        </div>
      </section>

      <section className="checkout-demo-note" aria-label="Synthetic content notice">
        <div className="page-container checkout-demo-note__inner">
          <span>SYNTHETIC LEARNING DEMO</span>
          <span>Created for educational purposes — no real purchase is processed.</span>
        </div>
      </section>
    </div>
  )
}
