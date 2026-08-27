import { Link } from 'react-router-dom'

import { NotFoundState } from '../components/StatePanel'

type PlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
  actionLabel: string
  actionTo: string
  state?: 'not-found'
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  actionLabel,
  actionTo,
  state,
}: PlaceholderPageProps) {
  return (
    <section className="page page--placeholder">
      <div className="page-container">
        <div className="placeholder-grid" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="placeholder-content">
          <p className="eyebrow">{eyebrow}</p>
          <div className="placeholder-content__rule" aria-hidden="true" />
          <h1>{title}</h1>
          <p className="lede">{description}</p>
          <Link className="button button--primary" to={actionTo}>
            {actionLabel}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="placeholder-meta">
          <span>UI-001 / APPLICATION SHELL</span>
          <span>01</span>
        </div>
        {state === 'not-found' ? <NotFoundState /> : null}
      </div>
    </section>
  )
}
