import { useState } from 'react'

type ProductImageProps = {
  src: string
  alt: string
  productName: string
  variant: number
}

export function ProductImage({ src, alt, productName, variant }: ProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className={`product-card__media product-card__media--variant-${variant}`}>
      {status !== 'error' ? (
        <img
          className={`product-card__image${status === 'loaded' ? ' product-card__image--loaded' : ''}`}
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setStatus('error')}
          onLoad={() => setStatus('loaded')}
        />
      ) : null}

      {status !== 'loaded' ? (
        <div
          className="product-card__image-fallback"
          role={status === 'error' ? 'img' : 'status'}
          aria-label={
            status === 'error'
              ? `${productName} image unavailable. Original image description: ${alt}. Product details remain available below.`
              : `Loading image for ${productName}.`
          }
        >
          <span className="product-card__fallback-frame" aria-hidden="true" />
          <span className="product-card__fallback-mark" aria-hidden="true">
            {status === 'error' ? 'IMAGE / FALLBACK' : 'IMAGE / LOADING'}
          </span>
          <span className="product-card__fallback-name" aria-hidden="true">
            {productName}
          </span>
        </div>
      ) : null}
    </div>
  )
}
