import { Link } from 'react-router-dom'

import { ScrollytellingStory } from './ScrollytellingStory'
import { StoryVisual } from './StoryVisual'
import './CreatorStory.css'

const storySteps = [
  {
    number: '01',
    title: 'Recovery',
    description:
      'A leg injury kept Jia Wei at home for about a year. In the slower days, she found room to begin again.',
    details: [
      { label: 'Season', value: 'A year at home' },
      { label: 'Shift', value: 'Make space' },
    ],
  },
  {
    number: '02',
    title: 'Learning',
    description:
      'She learned video editing one cut, one caption, and one small experiment at a time.',
    details: [
      { label: 'Starting point', value: 'One cut' },
      { label: 'Practice', value: 'Small experiments' },
    ],
  },
  {
    number: '03',
    title: 'Showing up',
    description:
      'She posted editing tips consistently, even when the early videos received little attention. The practice became part of the point.',
    details: [
      { label: 'Rhythm', value: 'Every day' },
      { label: 'Signal', value: 'Keep going' },
    ],
  },
  {
    number: '04',
    title: 'Growing through feedback',
    description:
      'Criticism still stung. She learned to process it, improve the next lesson, and return sooner.',
    details: [
      { label: 'Response', value: 'Process it' },
      { label: 'Next move', value: 'Return sooner' },
    ],
  },
]

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="page-container home-hero__inner">
          <div className="home-hero__copy">
            <p className="eyebrow">CREATOR STORY / FRAME 01</p>
            <h1 id="home-hero-title">Make room for the next frame.</h1>
            <p className="home-hero__lede">
              Jia Wei is a Malaysian lifestyle and beginner video-editing educator building a
              creative practice one small step at a time.
            </p>
            <div className="home-hero__actions">
              <Link className="button button--primary" to="/shop">
                Explore the collection
                <span aria-hidden="true">↗</span>
              </Link>
              <a className="text-link" href="#the-story">
                Read the story <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="synthetic-note">
              Synthetic learning demo — created for educational purposes.
            </p>
          </div>
          <StoryVisual
            imageSrc="/synthetic-jia-wei-portrait.jpg"
            alt="A warm creator workspace prepared for Jia Wei's editing practice."
          />
        </div>
        <div className="home-hero__edge-label" aria-hidden="true">
          <span>JIA WEI / JW STUDIO 02.0</span>
          <span>KEEP SHOWING UP</span>
        </div>
      </section>

      <section className="creator-intro" aria-labelledby="creator-intro-title">
        <div className="page-container creator-intro__grid">
          <div>
            <p className="eyebrow">ABOUT THE CREATOR</p>
            <h2 id="creator-intro-title">A friendly corner for making, learning, and trying again.</h2>
          </div>
          <div className="creator-intro__copy">
            <p>
              Jia Wei shares everyday lifestyle moments and beginner-friendly editing tips for
              people who are still finding their rhythm. Her work is lively, practical, and close
              to the process behind the finished post.
            </p>
            <dl className="creator-facts">
              <div>
                <dt>Based in</dt>
                <dd>Malaysia</dd>
              </div>
              <div>
                <dt>Creates</dt>
                <dd>Lifestyle + editing tips</dd>
              </div>
              <div>
                <dt>Community</dt>
                <dd>About 20k followers</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="story-section" id="the-story" aria-labelledby="story-title">
        <div className="page-container">
          <div className="story-section__heading">
            <div>
              <p className="eyebrow">FRAME BY FRAME / THE JOURNEY</p>
              <h2 id="story-title">Progress rarely arrives all at once.</h2>
            </div>
            <p>
              The collection is a set of small reminders from Jia Wei&apos;s creative practice: the
              quiet work, the rough drafts, and the choice to keep going.
            </p>
          </div>

          <ScrollytellingStory steps={storySteps} />
        </div>
      </section>

      <section className="belief-section" aria-labelledby="belief-title">
        <div className="page-container belief-section__inner">
          <p className="eyebrow eyebrow--light">CORE BELIEF / FRAME 04</p>
          <blockquote id="belief-title">
            “Keep showing up for what you believe in. You may not know if it will succeed, but even
            if it doesn&apos;t, the journey will never be wasted.”
          </blockquote>
          <p className="belief-section__credit">— Jia Wei&apos;s studio note</p>
        </div>
      </section>

      <section className="collection-invite" aria-labelledby="collection-invite-title">
        <div className="page-container collection-invite__inner">
          <div>
            <p className="eyebrow">THE COLLECTION / NEXT FRAME</p>
            <h2 id="collection-invite-title">Keep a little progress close.</h2>
          </div>
          <div className="collection-invite__copy">
            <p>
              The synthetic collection turns the studio story into everyday pieces for filming,
              studying, editing, and taking the next small step.
            </p>
            <Link className="button button--primary" to="/shop">
              Visit the collection
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
