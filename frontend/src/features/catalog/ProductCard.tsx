import { Link } from 'react-router-dom'

import { categoryLabels, formatProductPrice, type Product } from './catalogTypes'
import { ProductImage } from './ProductImage'

type ProductCardProps = {
  product: Product
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__media-wrap">
        <span className="product-card__episode">FRAME {String(index + 1).padStart(2, '0')}</span>
        <ProductImage
          src={product.image_reference}
          alt={product.image_alt_text}
          productName={product.name}
          variant={index % 3}
        />
      </div>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{categoryLabels[product.category]}</span>
          <span>{product.currency}</span>
        </div>
        <h3 className="product-card__title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__footer">
          <span
            className="product-card__price"
            aria-label={`Price ${formatProductPrice(product)}`}
          >
            {formatProductPrice(product)}
          </span>
          <Link
            className="text-link product-card__link"
            to={`/products/${product.id}`}
            aria-label={`View details for ${product.name}`}
          >
            View details <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
