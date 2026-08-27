import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ErrorState, LoadingState, NotFoundState } from '../components/StatePanel'
import { useCart } from '../features/cart/useCart'
import { ProductImage } from '../features/catalog/ProductImage'
import {
  categoryLabels,
  formatProductPrice,
  type Product,
} from '../features/catalog/catalogTypes'
import { ProductOptionSelector } from '../features/products/ProductOptionSelector'
import { getProductImageSource } from '../features/products/productImageVariants'
import { useProductDetail } from '../features/products/useProductDetail'
import '../features/products/ProductDetail.css'

function DetailState({
  status,
  onRetry,
}: {
  status: 'loading' | 'not-found' | 'error'
  onRetry: () => void
}) {
  if (status === 'loading') {
    return (
      <div className="product-detail-state page-container">
        <p className="eyebrow">FRAME / PRODUCT DETAIL</p>
        <h1>Loading the next frame.</h1>
        <LoadingState label="Reading the authoritative product record..." />
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="product-detail-state page-container">
        <p className="eyebrow">404 / FRAME MISSING</p>
        <h1>This product frame is missing.</h1>
        <NotFoundState
          title="There is no product with that frame ID."
          detail="Return to the collection to choose another synthetic studio piece."
        />
        <Link className="button button--secondary" to="/shop">
          Back to collection <span aria-hidden="true">↗</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="product-detail-state page-container">
      <p className="eyebrow">ERROR / ANOTHER TAKE</p>
      <h1>This product needs another take.</h1>
      <ErrorState
        title="The product record could not be loaded."
        detail="The catalog is still authoritative; please try again without inventing product details."
      />
      <div className="product-detail-state__actions">
        <button className="button button--secondary" type="button" onClick={onRetry}>
          Try again <span aria-hidden="true">↻</span>
        </button>
        <Link className="text-link" to="/shop">
          Back to collection <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  )
}

function ProductMaterials({ materials }: { materials: string[] }) {
  if (materials.length === 0) return null

  return (
    <article className="product-detail-info-card">
      <p className="eyebrow">MATERIALS</p>
      <h2>What makes this frame.</h2>
      <ul>
        {materials.map((material) => (
          <li key={material}>{material}</li>
        ))}
      </ul>
    </article>
  )
}

function ProductDetailStory({ product }: { product: Product }) {
  const hasStoryContent =
    product.care_instructions || product.design_meaning || product.creator_recommendation

  if (!hasStoryContent && product.materials.length === 0) return null

  return (
    <section className="product-detail-story" aria-labelledby="product-story-title">
      <div className="page-container">
        <div className="product-detail-story__heading">
          <div>
            <p className="eyebrow">FRAME NOTES / STORY + CARE</p>
            <h2 id="product-story-title">Small details, kept in motion.</h2>
          </div>
          <p>
            This synthetic learning product is designed as a small extension of Jia Wei&apos;s
            practice, not as a promise of a real-world transaction.
          </p>
        </div>

        <div className="product-detail-info-grid">
          <ProductMaterials materials={product.materials} />
          {product.care_instructions ? (
            <article className="product-detail-info-card">
              <p className="eyebrow">CARE</p>
              <h2>Keep the frame in good shape.</h2>
              <p>{product.care_instructions}</p>
            </article>
          ) : null}
          {product.design_meaning ? (
            <article className="product-detail-info-card product-detail-info-card--accent">
              <p className="eyebrow">DESIGN MEANING</p>
              <h2>Why it belongs in the story.</h2>
              <p>{product.design_meaning}</p>
            </article>
          ) : null}
          {product.creator_recommendation ? (
            <article className="product-detail-info-card">
              <p className="eyebrow">CREATOR RECOMMENDATION</p>
              <h2>Jia Wei&apos;s note.</h2>
              <p>{product.creator_recommendation}</p>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ProductDetailContent({ product }: { product: Product }) {
  const { addProduct } = useCart()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [isAdded, setIsAdded] = useState(false)
  const optionGroups = Object.entries(product.options).filter(([, values]) => values.length > 0)
  const missingOptionNames = optionGroups
    .filter(([optionName]) => !selectedOptions[optionName])
    .map(([optionName]) => optionName)
  const canAddToCollection = missingOptionNames.length === 0
  const imageSource = getProductImageSource(product, selectedOptions)

  function handleOptionChange(optionName: string, optionValue: string) {
    setSelectedOptions((currentOptions) => ({
      ...currentOptions,
      [optionName]: optionValue,
    }))
    setActionMessage(null)
    setIsAdded(false)
  }

  function handleAddToCollection() {
    if (!canAddToCollection) return

    addProduct(product, selectedOptions, {
      imageReference: imageSource.src,
      imageAltText: imageSource.alt,
    })
    setIsAdded(true)
    setActionMessage(
      'Added to your collection. This learning demo does not process real payment.',
    )
  }

  return (
    <div className="product-detail-page">
      <section className="product-detail-hero" aria-labelledby="product-title">
        <div className="page-container">
          <Link className="back-link" to="/shop">
            <span aria-hidden="true">←</span> Back to collection
          </Link>

          <div className="product-detail__grid">
            <figure className="product-detail__figure">
              <div className="product-detail__figure-meta">
                <span>FRAME / PRODUCT</span>
                <span>{categoryLabels[product.category]}</span>
              </div>
              <div className="product-detail__image-shell">
                <ProductImage
                  key={imageSource.src}
                  src={imageSource.src}
                  alt={imageSource.alt}
                  productName={product.name}
                  variant={product.id.length % 3}
                />
              </div>
              <figcaption>
                Synthetic learning image reference. Product information remains available if the
                image is unavailable.
              </figcaption>
            </figure>

            <article className="product-detail__information">
              <p className="eyebrow">{categoryLabels[product.category]} / FRAME DETAIL</p>
              <h1 id="product-title">{product.name}</h1>
              <p className="product-detail__price" aria-label={`Price ${formatProductPrice(product)}`}>
                {formatProductPrice(product)}
              </p>
              <p className="product-detail__description">{product.description}</p>

              <ProductOptionSelector
                options={product.options}
                selectedOptions={selectedOptions}
                onChange={handleOptionChange}
              />

              <div className="product-detail__actions">
                <button
                  className={`button button--primary product-detail__action${isAdded ? ' product-detail__action--success' : ''}`}
                  type="button"
                  disabled={!canAddToCollection}
                  onClick={handleAddToCollection}
                  aria-describedby="product-action-note"
                >
                  {isAdded
                    ? 'Added to collection'
                    : canAddToCollection
                      ? 'Add to collection'
                      : 'Choose required options'}
                  <span aria-hidden="true">{isAdded ? '✓' : '+'}</span>
                </button>
                <p id="product-action-note" className="product-detail__action-note" role="status" aria-live="polite">
                  {actionMessage ??
                    'Learning demo only. Your selection will be saved in this browser, not sent to a payment service.'}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <ProductDetailStory product={product} />

      <section className="product-detail-demo-note" aria-label="Synthetic content notice">
        <div className="page-container product-detail-demo-note__inner">
          <span>SYNTHETIC LEARNING DEMO</span>
          <span>Created for educational purposes — no real purchase is processed.</span>
        </div>
      </section>
    </div>
  )
}

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const { state, retry } = useProductDetail(productId ?? '')

  if (state.status !== 'success') {
    return <DetailState status={state.status} onRetry={retry} />
  }

  return <ProductDetailContent key={state.product.id} product={state.product} />
}
