import { Link, useLocation } from 'react-router-dom'

import { isCheckoutResult, type CheckoutResult } from '../features/checkout/checkoutTypes'
import './Checkout.css'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function resultFromNavigationState(value: unknown): CheckoutResult | null {
  if (!isRecord(value) || !isCheckoutResult(value.result)) return null
  return value.result
}

function formatBackendMoney(amount: string, currency: string) {
  return `${currency === 'MYR' ? 'RM' : currency} ${amount}`
}

function formatOptionLabel(optionName: string) {
  return optionName
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function MissingResult() {
  return (
    <div className="demo-result-missing page-container">
      <p className="eyebrow">RESULT / FRAME MISSING</p>
      <h1>There is no demo result to show.</h1>
      <p>
        Complete the simulated checkout first. This page will not invent a payment result when no
        validated backend response is available.
      </p>
      <div className="demo-result-missing__actions">
        <Link className="button button--primary" to="/cart">
          Review your cart <span aria-hidden="true">↗</span>
        </Link>
        <Link className="text-link" to="/shop">
          Back to collection <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  )
}

function ResultLine({
  item,
  currency,
  index,
}: {
  item: CheckoutResult['summary']['items'][number]
  currency: string
  index: number
}) {
  return (
    <article className="demo-result-item">
      <div className="demo-result-item__marker" aria-hidden="true">
        FRAME {String(index + 1).padStart(2, '0')}
      </div>
      <div className="demo-result-item__content">
        <div className="demo-result-item__heading">
          <div>
            <p className="demo-result-item__category">Validated selection</p>
            <h2>{item.name}</h2>
          </div>
          <strong>{formatBackendMoney(item.line_total, currency)}</strong>
        </div>
        <ul aria-label={`Validated options for ${item.name}`}>
          {Object.entries(item.selected_options).map(([optionName, optionValue]) => (
            <li key={optionName}>
              <span>{formatOptionLabel(optionName)}</span>
              <strong>{optionValue}</strong>
            </li>
          ))}
        </ul>
        <p className="demo-result-item__meta">
          Quantity {item.quantity} · {formatBackendMoney(item.unit_price, currency)} each
        </p>
      </div>
    </article>
  )
}

export function DemoResultPage() {
  const location = useLocation()
  const result = resultFromNavigationState(location.state)

  if (result === null) return <MissingResult />

  return (
    <div className="demo-result-page">
      <section className="demo-result-hero" aria-labelledby="demo-result-title">
        <div className="page-container demo-result-hero__inner">
          <div>
            <p className="eyebrow">SIMULATED / SUCCESS</p>
            <h1 id="demo-result-title">The next frame is complete.</h1>
            <p className="demo-result-hero__lede">
              The backend validated this synthetic selection. Nothing was charged, shipped, or
              saved as a real order.
            </p>
          </div>
          <div className="demo-result-status" role="status">
            <span className="demo-result-status__mark" aria-hidden="true">✓</span>
            <strong>No real payment was processed.</strong>
            <span>Learning demo result</span>
          </div>
        </div>
      </section>

      <section className="demo-result-content" aria-label="Simulated payment result">
        <div className="page-container demo-result-layout">
          <div className="demo-result-summary">
            <div className="demo-result-summary__heading">
              <div>
                <p className="eyebrow">BACKEND / VALIDATED SUMMARY</p>
                <h2>What the demo confirmed.</h2>
              </div>
              <p className="demo-result-summary__message">{result.message}</p>
            </div>
            <div className="demo-result-items">
              {result.summary.items.map((item, index) => (
                <ResultLine
                  currency={result.summary.currency}
                  index={index}
                  item={item}
                  key={`${item.product_id}-${index}`}
                />
              ))}
            </div>
          </div>

          <aside className="demo-result-total" aria-labelledby="demo-total-title">
            <p className="eyebrow">DEMO REFERENCE</p>
            <h2 id="demo-total-title">{result.synthetic_reference}</h2>
            <dl>
              <div>
                <dt>Payment path</dt>
                <dd>{result.payment_method === 'demo_card' ? 'Demo card simulation' : 'Demo wallet simulation'}</dd>
              </div>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatBackendMoney(result.summary.subtotal, result.summary.currency)}</dd>
              </div>
              <div className="demo-result-total__grand">
                <dt>Demo total</dt>
                <dd>{formatBackendMoney(result.summary.total, result.summary.currency)}</dd>
              </div>
            </dl>
            <p>
              These values come from the validated backend response, not from an AI answer or a
              browser-supplied total.
            </p>
          </aside>
        </div>
      </section>

      <section className="demo-result-actions" aria-label="After demo result">
        <div className="page-container demo-result-actions__inner">
          <Link className="button button--primary" to="/shop">
            Return to collection <span aria-hidden="true">↗</span>
          </Link>
          <Link className="text-link" to="/cart">
            Review browser cart <span aria-hidden="true">↗</span>
          </Link>
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
