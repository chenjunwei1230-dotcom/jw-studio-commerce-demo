import { useEffect, useState } from 'react'

import { CatalogApiError, fetchProduct } from '../catalog/catalogApi'
import type { Product } from '../catalog/catalogTypes'

type ProductDetailState =
  | { status: 'loading' }
  | { status: 'success'; product: Product }
  | { status: 'not-found' }
  | { status: 'error' }

export function useProductDetail(productId: string) {
  const [state, setState] = useState<ProductDetailState>({ status: 'loading' })
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let isCurrentRequest = true

    fetchProduct(productId, controller.signal)
      .then((product) => {
        if (isCurrentRequest) setState({ status: 'success', product })
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) return

        if (error instanceof CatalogApiError && error.reason === 'not-found') {
          setState({ status: 'not-found' })
          return
        }

        setState({ status: 'error' })
      })

    return () => {
      isCurrentRequest = false
      controller.abort()
    }
  }, [productId, retryKey])

  function retry() {
    setState({ status: 'loading' })
    setRetryKey((currentKey) => currentKey + 1)
  }

  return { state, retry }
}
