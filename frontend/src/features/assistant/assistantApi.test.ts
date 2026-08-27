import { afterEach, describe, expect, it, vi } from 'vitest'

import { askAssistant } from './assistantApi'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('assistant API boundary', () => {
  it('accepts a validated grounded response from the backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            answer: 'The collection is about steady creative practice.',
            sources: [{ source_id: 'kb-frame-by-frame-belief', title: 'Frame by Frame Studio belief' }],
            grounded: true,
            fallback: false,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    await expect(askAssistant('What is the brand belief?')).resolves.toMatchObject({
      grounded: true,
      fallback: false,
    })
    expect(fetch).toHaveBeenCalledWith(
      '/api/ai/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ question: 'What is the brand belief?' }),
      }),
    )
  })

  it('maps unavailable and malformed backend responses to safe client errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })))

    await expect(askAssistant('Is the assistant available?')).rejects.toMatchObject({
      reason: 'unavailable',
    })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ answer: '<script>alert(1)</script>' }), { status: 200 }),
      ),
    )

    await expect(askAssistant('Tell me something.')).rejects.toMatchObject({
      reason: 'invalid',
    })
  })

  it('maps backend request validation to an invalid request error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"error":"invalid_request"}', { status: 422 })),
    )

    await expect(askAssistant('')).rejects.toMatchObject({ reason: 'invalid' })
  })
})
