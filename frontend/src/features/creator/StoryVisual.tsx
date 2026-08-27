import { useState } from 'react'

type StoryVisualProps = {
  imageSrc?: string
  alt?: string
}

type ImageStatus = 'loading' | 'loaded' | 'missing' | 'error'

export function StoryVisual({
  imageSrc,
  alt = 'A warm creator workspace prepared for a new editing session.',
}: StoryVisualProps) {
  const [imageStatus, setImageStatus] = useState<ImageStatus>(imageSrc ? 'loading' : 'missing')

  return (
    <figure className="story-visual" aria-labelledby="story-visual-caption">
      <div className={`story-visual__frame story-visual__frame--${imageStatus}`}>
        {imageSrc && imageStatus !== 'error' ? (
          <img
            className="story-visual__image"
            src={imageSrc}
            alt={alt}
            onError={() => setImageStatus('error')}
            onLoad={() => setImageStatus('loaded')}
          />
        ) : null}

        {imageStatus !== 'loaded' ? (
          <div
            className="story-visual__fallback"
            role="img"
            aria-label="A CSS illustration of a warm creator workspace with an editing timeline and a progress note."
          >
            <span className="story-visual__corner story-visual__corner--top" aria-hidden="true" />
            <span className="story-visual__corner story-visual__corner--bottom" aria-hidden="true" />
            <span className="story-visual__label">CREATOR WORKSPACE / TAKE 01</span>
            <span className="story-visual__screen" aria-hidden="true">
              <span className="story-visual__screen-bar" />
              <span className="story-visual__screen-title">Keep showing up.</span>
              <span className="story-visual__screen-line story-visual__screen-line--wide" />
              <span className="story-visual__screen-line" />
              <span className="story-visual__screen-line story-visual__screen-line--short" />
            </span>
            <span className="story-visual__note" aria-hidden="true">
              <small>PROGRESS LOG</small>
              <strong>ONE MORE FRAME</strong>
              <span>◒ ◒ ◒</span>
            </span>
            <span className="story-visual__timeline" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="story-visual__status">
              {imageStatus === 'error'
                ? 'Image unavailable — showing the studio fallback.'
                : 'Visual placeholder — the story still comes first.'}
            </span>
          </div>
        ) : null}
      </div>
      <figcaption id="story-visual-caption">
        A synthetic visual frame for this learning demo. No real creator image is used.
      </figcaption>
    </figure>
  )
}
