import { Link } from 'react-router-dom'

import { useCart } from '../features/cart/useCart'
import {
  formatMinorUnits,
  getCartItemLineTotalMinor,
  getCartSubtotalMinor,
  type CartItem,
} from '../features/cart/cartTypes'
import { ProductImage } from '../features/catalog/ProductImage'
import { categoryLabels } from '../features/catalog/catalogTypes'
import '../features/catalog/Catalog.css'
import '../features/cart/Cart.css'

function formatOptionLabel(optionName: string) {
  return optionName
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function CartItemRow({ item, index }: { item: CartItem; index: number }) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart()
  const lineTotal = getCartItemLineTotalMinor(item)

  return (
    <article className="cart-item">
      <div className="cart-item__image-wrap">
        <span className="cart-item__frame-label">FRAME {String(index + 1).padStart(2, '0')}</span>
        <div className="cart-item__image">
          <ProductImage
            src={item.imageReference}
            alt={item.imageAltText}
            productName={item.productName}
            variant={index % 3}
          />
        </div>
      </div>

      <div className="cart-item__content">
        <div className="cart-item__heading">
          <div>
            <p className="cart-item__category">{categoryLabels[item.category]}</p>
            <h2>{item.productName}</h2>
          </div>
          <p className="cart-item__line-total" aria-label={`Line total ${formatMinorUnits(lineTotal, item.currency)}`}>
            {formatMinorUnits(lineTotal, item.currency)}
          </p>
        </div>

        {Object.keys(item.selectedOptions).length > 0 ? (
          <ul className="cart-item__options" aria-label={`Selected options for ${item.productName}`}>
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

        <div className="cart-item__footer">
          <span className="cart-item__unit-price">
            {formatMinorUnits(item.unitPriceMinor, item.currency)} each
          </span>
          <div className="cart-item__controls">
            <div className="quantity-control" role="group" aria-label={`Quantity for ${item.productName}`}>
              <button
                type="button"
                aria-label={`Decrease quantity for ${item.productName}`}
                disabled={item.quantity === 1}
                onClick={() => decreaseQuantity(item.id)}
              >
                −
              </button>
              <span aria-live="polite">{item.quantity}</span>
              <button
                type="button"
                aria-label={`Increase quantity for ${item.productName}`}
                onClick={() => increaseQuantity(item.id)}
              >
                +
              </button>
            </div>
            <button
              className="text-link cart-item__remove"
              type="button"
              aria-label={`Remove ${item.productName} from cart`}
              onClick={() => removeItem(item.id)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function EmptyCart() {
  return (
    <section className="cart-empty" aria-labelledby="empty-cart-title">
      <p className="eyebrow">COLLECTION / READY WHEN YOU ARE</p>
      <h1 id="empty-cart-title">Your collection is waiting.</h1>
      <p>
        No frames have been added yet. Browse Jia Wei&apos;s synthetic studio pieces and choose one
        that carries the next step with you.
      </p>
      <Link className="button button--primary" to="/shop">
        Browse the collection <span aria-hidden="true">↗</span>
      </Link>
    </section>
  )
}

export function CartPage() {
  const { state, itemCount } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="cart-page">
        <EmptyCart />
        <CartDemoNotice />
      </div>
    )
  }

  const subtotal = getCartSubtotalMinor(state)
  const currency = state.items[0]?.currency ?? 'MYR'

  return (
    <div className="cart-page">
      <section className="cart-hero" aria-labelledby="cart-title">
        <div className="page-container cart-hero__inner">
          <div>
            <p className="eyebrow">FRAME / YOUR COLLECTION</p>
            <h1 id="cart-title">A few frames, moving forward.</h1>
            <p className="cart-hero__lede">
              Review your selections before the learning-demo checkout. Everything here is still
              synthetic content.
            </p>
          </div>
          <div className="cart-hero__count" aria-label={`${itemCount} items in cart`}>
            <strong>{itemCount}</strong>
            <span>{itemCount === 1 ? 'item' : 'items'} selected</span>
          </div>
        </div>
      </section>

      <section className="cart-content" aria-label="Shopping cart">
        <div className="page-container cart-layout">
          <div className="cart-list">
            <div className="cart-list__heading">
              <p className="eyebrow">SELECTION / {String(state.items.length).padStart(2, '0')} LINES</p>
              <p>Options are preserved with each product frame.</p>
            </div>
            <div className="cart-list__items">
              {state.items.map((item, index) => (
                <CartItemRow item={item} index={index} key={item.id} />
              ))}
            </div>
          </div>

          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <p className="eyebrow">SUMMARY / DEMO ONLY</p>
            <h2 id="cart-summary-title">Ready for the next frame?</h2>
            <div className="cart-summary__row">
              <span>{itemCount === 1 ? '1 item' : `${itemCount} items`}</span>
              <strong>{formatMinorUnits(subtotal, currency)}</strong>
            </div>
            <p className="cart-summary__note">
              The total is calculated from the current application data. No real payment details
              are requested or transmitted.
            </p>
            <Link className="button button--primary cart-summary__action" to="/checkout">
              Continue to demo checkout <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link cart-summary__back" to="/shop">
              Continue browsing <span aria-hidden="true">↗</span>
            </Link>
          </aside>
        </div>
      </section>

      <CartDemoNotice />
    </div>
  )
}

function CartDemoNotice() {
  return (
    <section className="cart-demo-note" aria-label="Synthetic content notice">
      <div className="page-container cart-demo-note__inner">
        <span>SYNTHETIC LEARNING DEMO</span>
        <span>Created for educational purposes — no real purchase is processed.</span>
      </div>
    </section>
  )
}
