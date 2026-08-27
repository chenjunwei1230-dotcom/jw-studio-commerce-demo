type LoadingStateProps = {
  label?: string
}

type ErrorStateProps = {
  title?: string
  detail?: string
}

type NotFoundStateProps = {
  title?: string
  detail?: string
}

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div className="state-panel state-panel--loading" role="status" aria-live="polite">
      <span className="state-panel__marker" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({
  title = 'Something needs another take',
  detail = 'Please try again.',
}: ErrorStateProps) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <span className="state-panel__eyebrow">ERROR / RECOVERY</span>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  )
}

export function NotFoundState({
  title = 'This frame is not on the timeline',
  detail = 'Return to the studio to continue browsing.',
}: NotFoundStateProps) {
  return (
    <div className="state-panel state-panel--not-found" role="status">
      <span className="state-panel__eyebrow">404 / FRAME MISSING</span>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  )
}
