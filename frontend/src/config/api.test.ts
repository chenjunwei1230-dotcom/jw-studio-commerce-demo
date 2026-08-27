import { describe, expect, it } from 'vitest'

import { apiUrl } from './api'

describe('apiUrl', () => {
  it('keeps local development on the same origin by default', () => {
    expect(apiUrl('/api/health', '')).toBe('/api/health')
  })

  it('joins a configured backend origin without duplicate slashes', () => {
    expect(apiUrl('/api/products', 'https://api.example.test///')).toBe(
      'https://api.example.test/api/products',
    )
  })
})
