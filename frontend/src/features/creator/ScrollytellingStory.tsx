import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type StoryStep = {
  number: string
  title: string
  description: string
  details: readonly { label: string; value: string }[]
}

type ScrollytellingStoryProps = {
  steps: readonly StoryStep[]
}

export function ScrollytellingStory({ steps }: ScrollytellingStoryProps) {
  const [visibleSteps, setVisibleSteps] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return Object.fromEntries(steps.map((step) => [step.number, true]))
    }

    return {}
  })
  const stepRefs = useRef<Array<HTMLLIElement | null>>([])

  useEffect(() => {
    const items = stepRefs.current.filter((item): item is HTMLLIElement => item !== null)

    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibilityChanges = entries
          .map((entry) => {
            const step = entry.target.getAttribute('data-step')
            return step === null ? null : [step, entry.isIntersecting] as const
          })
          .filter((change): change is readonly [string, boolean] => change !== null)

        if (visibilityChanges.length === 0) return

        setVisibleSteps((current) => {
          const next = { ...current }
          let changed = false

          visibilityChanges.forEach(([step, isVisible]) => {
            if (next[step] === isVisible) return
            next[step] = isVisible
            changed = true
          })

          return changed ? next : current
        })
      },
      { rootMargin: '-8% 0px -18% 0px', threshold: 0.12 },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [steps])

  return (
    <div className="story-scrollytelling">
      <ol className="story-panels" aria-label="Jia Wei's creator journey">
        {steps.map((step, index) => (
          <li
            className={`story-panel ${visibleSteps[step.number] ? 'is-visible' : ''}`}
            data-step={step.number}
            key={step.number}
            ref={(element) => {
              stepRefs.current[index] = element
            }}
            style={{ '--story-panel-index': index + 1 } as CSSProperties}
          >
            <article className="story-panel__card">
              <div className="story-panel__marker" aria-hidden="true">
                <span>{step.number}</span>
                <span className="story-panel__line" />
              </div>
              <div className="story-panel__content">
                <div className="story-panel__topline">
                  <p className="eyebrow">FRAME {step.number}</p>
                  <span className={`story-panel__symbol story-panel__symbol--${step.number}`} aria-hidden="true">
                    <span />
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <ul className="story-panel__details" aria-label={`${step.title} frame notes`}>
                  {step.details.map((detail) => (
                    <li key={detail.label}>
                      <span>{detail.label}</span>
                      <strong>{detail.value}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <span className="story-panel__corner" aria-hidden="true">
                +
              </span>
            </article>
          </li>
        ))}
      </ol>
      <p className="story-scrollytelling__hint">
        Scroll through the frames — each one carries the work forward.
      </p>
    </div>
  )
}
