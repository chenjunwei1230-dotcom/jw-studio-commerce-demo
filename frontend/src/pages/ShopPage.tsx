import { Link } from 'react-router-dom'

import { ErrorState, LoadingState } from '../components/StatePanel'
import { AssistantPanel } from '../features/assistant/AssistantPanel'
import { ProductCard } from '../features/catalog/ProductCard'
import {
  categoryLabels,
  productCategories,
  type Product,
} from '../features/catalog/catalogTypes'
import { useCatalogProducts } from '../features/catalog/useCatalogProducts'
import '../features/catalog/Catalog.css'

function CategorySummary({ products }: { products: Product[] }) {
  return (
    <ul className="category-summary" aria-label="Collection categories">
      {productCategories.map((category) => {
        const count = products.filter((product) => product.category === category).length

        return (
          <li className="category-summary__item" key={category}>
            <span className="category-summary__count">{count}</span>
            <span className="category-summary__label">{categoryLabels[category]}</span>
          </li>
        )
      })}
    </ul>
  )
}

function CatalogContent({ products }: { products: Product[] }) {
  return (
    <>
      <div className="collection-section__heading">
        <div>
          <p className="eyebrow">COLLECTION / 13 FRAMES</p>
          <h2 id="catalog-heading">Small pieces of creative practice.</h2>
        </div>
        <p>
          Every piece is synthetic learning content shaped around Jia Wei&apos;s story: make space,
          keep learning, and carry the next step with you.
        </p>
      </div>
      <CategorySummary products={products} />
      <div className="catalog-grid" role="list" aria-label="JW Studio collection">
        {products.map((product, index) => (
          <div role="listitem" key={product.id}>
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
    </>
  )
}

function CatalogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="catalog-state">
      <ErrorState
        title="The collection needs another take"
        detail="The synthetic catalog could not be loaded. No placeholder products were added."
      />
      <button className="button button--secondary" type="button" onClick={onRetry}>
        Try again <span aria-hidden="true">↻</span>
      </button>
    </div>
  )
}

function CatalogEmptyState() {
  return (
    <div className="catalog-state catalog-state--empty">
      <p className="eyebrow">CATALOG / EMPTY</p>
      <h2>No frames are ready yet.</h2>
      <p>The collection is currently empty. Return to the studio and check back after another take.</p>
      <Link className="button button--secondary" to="/">
        Back to studio <span aria-hidden="true">↗</span>
      </Link>
    </div>
  )
}

function CatalogLoadingState() {
  return (
    <div className="catalog-state catalog-state--loading">
      <LoadingState label="Loading the synthetic collection..." />
      <p>Reading the authoritative catalog before showing any products.</p>
    </div>
  )
}

export function ShopPage() {
  const { state, retry } = useCatalogProducts()

  return (
    <div className="collection-page">
      <section className="collection-hero" aria-labelledby="collection-title">
        <div className="page-container collection-hero__inner">
          <div>
            <p className="eyebrow">EPISODE 01 / THE COLLECTION</p>
            <h1 id="collection-title">A little progress, made tangible.</h1>
            <p className="collection-hero__lede">
              Synthetic studio pieces for filming, studying, editing, and remembering that the
              next frame still counts.
            </p>
          </div>
          <div className="collection-hero__note" aria-label="Collection catalog status">
            <span className="collection-hero__note-mark" aria-hidden="true">
              +
            </span>
            <span className="collection-hero__note-label">SOURCE / AUTHORITATIVE CATALOG</span>
            <strong>13</strong>
            <span>synthetic pieces</span>
          </div>
        </div>
      </section>

      <section className="collection-section" aria-label="Product catalog">
        <div className="page-container">
          {state.status === 'loading' ? <CatalogLoadingState /> : null}
          {state.status === 'error' ? <CatalogErrorState onRetry={retry} /> : null}
          {state.status === 'success' && state.products.length === 0 ? <CatalogEmptyState /> : null}
          {state.status === 'success' && state.products.length > 0 ? (
            <CatalogContent products={state.products} />
          ) : null}
        </div>
      </section>

      <AssistantPanel />

      <section className="collection-footer-note" aria-label="Synthetic content notice">
        <div className="page-container collection-footer-note__inner">
          <span>SYNTHETIC LEARNING DEMO</span>
          <span>Created for educational purposes — no real purchase is processed.</span>
        </div>
      </section>
    </div>
  )
}
