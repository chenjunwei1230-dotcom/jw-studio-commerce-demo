import { apiUrl } from '../../config/api'

export type AssistantSource = {
  source_id: string
  title: string
}

export type AssistantResponse = {
  answer: string
  sources: AssistantSource[]
  grounded: boolean
  fallback: boolean
}

export class AssistantApiError extends Error {
  readonly reason: 'unavailable' | 'invalid'

  constructor(reason: 'unavailable' | 'invalid') {
    super('The learning assistant could not complete that request.')
    this.name = 'AssistantApiError'
    this.reason = reason
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isAssistantSource(value: unknown): value is AssistantSource {
  return (
    isRecord(value) &&
    isNonEmptyString(value.source_id) &&
    isNonEmptyString(value.title)
  )
}

function isAssistantResponse(value: unknown): value is AssistantResponse {
  if (!isRecord(value)) return false

  return (
    isNonEmptyString(value.answer) &&
    Array.isArray(value.sources) &&
    value.sources.every(isAssistantSource) &&
    typeof value.grounded === 'boolean' &&
    typeof value.fallback === 'boolean'
  )
}

export async function askAssistant(
  question: string,
  signal?: AbortSignal,
): Promise<AssistantResponse> {
  try {
    const response = await fetch(apiUrl('/api/ai/chat'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
      signal,
    })

    if (!response.ok) {
      throw new AssistantApiError(response.status === 422 ? 'invalid' : 'unavailable')
    }

    const payload: unknown = await response.json()
    if (!isAssistantResponse(payload)) throw new AssistantApiError('invalid')

    return payload
  } catch (error) {
    if (error instanceof AssistantApiError) throw error
    if (signal?.aborted) throw error
    throw new AssistantApiError('unavailable')
  }
}
