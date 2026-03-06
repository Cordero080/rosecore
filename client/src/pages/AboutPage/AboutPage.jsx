import { useEffect } from 'react'
import './AboutPage.css'

const RECOGNITIONS = [
  { score: '9.7', outOf: '/ 10', source: 'Booking.com', award: 'Traveller Review Awards 2026' },
  { score: '5.0', outOf: '/ 5',  source: 'Airbnb',      award: 'Guest Favourite'              },
]

const BEACHES = [
  { name: 'Playa Bonita',     distance: '5 min'  },
  { name: 'Playa Punta Popy', distance: '10 min' },
  { name: 'Playa Las Ballenas',distance: '15 min' },
  { name: 'Playa Cosón',      distance: '20 min' },
  { name: 'Playa Morón',      distance: '35 min' },
  { name: 'Playa Rincón',     distance: '40 min' },
  { name: 'Las Galeras',      distance: '45 min' },
]

const AREA_FACTS = [
  'French and Italian expat community — cosmopolitan but Caribbean-relaxed.',
  'Three languages on the street: Dominican Spanish, French, and English.',
  'Food truck park in town, open daily from 4 pm with twelve trucks.',
  'Nearest airport: Samaná El Catey (AZS). Santo Domingo (SDQ) is two hours by road.',
  'Best weather: December through May. Whale watching season January through March.',
]

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About — La Dolce Vita · Las Terrenas'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'A private residence in Las Terrenas, Samaná. Steps from Playa Bonita, surrounded by Caribbean nature. Learn about the property and the area.')
  }, [])

  return (
    <main className="about-page">

      {/* ── Hero header ── */}
      <header className="about-header">
        <p className="about-eyebrow">Las Terrenas · Samaná · Dominican Republic</p>
        <h1 className="about-title">La <span className="about-title-gold">Dolce</span> Vita</h1>
        <p className="about-tagline">A place to exhale.</p>
      </header>

      {/* ── Property intro ── */}
      <section className="about-intro">
        <p className="about-body">
          A private two-bedroom residence on the Samaná Peninsula, steps from one of the most
          beautiful beaches in the Dominican Republic. The apartment sits on Ave 27 de Febrero
          in Las Terrenas — a town that feels like the south of France dropped into the Caribbean.
        </p>
        <p className="about-body">
          Two bedrooms, two private bathrooms, a full kitchen, and a private pool shaded by palms.
          Comfortable enough for a family. Quiet enough for two. The kind of place where a week
          turns into a longer conversation.
        </p>
        <div className="about-intro-meta">
          <span className="about-meta-address">
            Ave 27 de Febrero, <strong>Apartment 2</strong> · Las Terrenas, Samaná · Dominican Republic
          </span>
          <a
            className="about-map-link"
            href="https://www.google.com/maps?q=19.3230496,-69.5337566"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps ↗
          </a>
        </div>
      </section>

      {/* ── Gold divider ── */}
      <div className="about-divider" aria-hidden="true">
        <span className="about-divider-line" />
        <span className="about-divider-diamond" />
        <span className="about-divider-line" />
      </div>

      {/* ── Recognition ── */}
      <section className="about-recognition">
        <p className="about-section-eyebrow">Recognition</p>
        <div className="about-recognition-row">
          {RECOGNITIONS.map(({ score, outOf, source, award }) => (
            <div className="about-award" key={source}>
              <div className="about-award-score">
                <span className="about-award-number">{score}</span>
                <span className="about-award-outof">{outOf}</span>
              </div>
              <p className="about-award-source">{source}</p>
              <p className="about-award-label">{award}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gold divider ── */}
      <div className="about-divider" aria-hidden="true">
        <span className="about-divider-line" />
        <span className="about-divider-diamond" />
        <span className="about-divider-line" />
      </div>

      {/* ── Beaches ── */}
      <section className="about-beaches">
        <p className="about-section-eyebrow">The Coast</p>
        <h2 className="about-section-title">Nearby beaches</h2>
        <ul className="about-beach-list">
          {BEACHES.map(({ name, distance }) => (
            <li className="about-beach-row" key={name}>
              <span className="about-beach-distance">{distance}</span>
              <span className="about-beach-rule" />
              <span className="about-beach-name">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Gold divider ── */}
      <div className="about-divider" aria-hidden="true">
        <span className="about-divider-line" />
        <span className="about-divider-diamond" />
        <span className="about-divider-line" />
      </div>

      {/* ── The area ── */}
      <section className="about-area">
        <p className="about-section-eyebrow">Las Terrenas</p>
        <h2 className="about-section-title">The area</h2>
        <ul className="about-area-list">
          {AREA_FACTS.map((fact, i) => (
            <li className="about-area-item" key={i}>
              <span className="about-area-dot" />
              <p className="about-area-fact">{fact}</p>
            </li>
          ))}
        </ul>
      </section>

    </main>
  )
}
