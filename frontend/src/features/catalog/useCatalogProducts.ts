import { useEffect, useState } from 'react'

import { fetchProducts } from './catalogApi'
import type { Product } from './catalogTypes'

type CatalogState =
  | { status: 'loading' }
  | { status: 'success'; products: Product[] }
  | { status: 'error' }

export function useCatalogProducts() {
  const [state, setState] = useState<CatalogState>({ status: 'loading' })
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let isCurrentRequest = true

    fetchProducts(controller.signal)
      .then((products) => {
        if (isCurrentRequest) setState({ status: 'success', products })
      })
      .catch(() => {
        if (isCurrentRequest) setState({ status: 'error' })
      })

    return () => {
      isCurrentRequest = false
      controller.abort()
    }
  }, [retryKey])

  function retry() {
    setState({ status: 'loading' })
    setRetryKey((currentKey) => currentKey + 1)
  }

  return { state, retry }
}
