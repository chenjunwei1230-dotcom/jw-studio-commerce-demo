const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '')

export function apiUrl(path: string, baseUrl = configuredApiBaseUrl): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, '')

  return normalizedBaseUrl ? `${normalizedBaseUrl}${normalizedPath}` : normalizedPath
}
