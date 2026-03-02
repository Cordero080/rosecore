import { useState, useEffect, useCallback } from 'react'
import './GalleryPage.css'
import * as manifest from './galleryManifest'

const sceneryModules  = import.meta.glob('../../assets/images/*.jpeg',          { eager: true })
const propertyModules = import.meta.glob('../../assets/images/property/*.{jpg,jpeg}', { eager: true })

function buildSlides(modules, config) {
  return Object.entries(modules).map(([path, m]) => {
    const filename = path.split('/').pop()
    return {
      src:     m.default,
      caption: config.captions[filename] ?? config.defaultCaption,
      alt:     config.alts?.[filename]   ?? config.defaultAlt,
      label:   config.label,
    }
  })
}

const CATEGORIES = {
  scenery:  buildSlides(sceneryModules,  manifest.scenery),
  property: buildSlides(propertyModules, manifest.property),
}

// ─── Slideshow ────────────────────────────────────────────────────────────────

function Slideshow({ slides, eyebrow, title, onOpenLightbox }) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState('forward')

  const goNext = useCallback(() => {
    setDir('forward')
    setIdx(i => (i + 1) % slides.length)
  }, [slides.length])

  const goPrev = useCallback(() => {
    setDir('backward')
    setIdx(i => (i - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Auto-advance — functional setIdx means no stale closure regardless of deps
  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(goNext, 7000)
    return () => clearInterval(t)
  }, [goNext, slides.length])

  if (!slides.length) return (
    <section className="gs-section">
      <header className="gs-header">
        <p className="gs-eyebrow">{eyebrow}</p>
        <h2 className="gs-title">{title}</h2>
      </header>
      <div className="gs-empty">Photos coming soon.</div>
    </section>
  )

  const slide = slides[idx]
  const n = slides.length

  return (
    <section className="gs-section">
      <header className="gs-header">
        <p className="gs-eyebrow">{eyebrow}</p>
        <h2 className="gs-title">{title}</h2>
      </header>

      <div className="gs-stage" aria-label={`${title} photo gallery`}>
        {/* Slide — key change remounts element, triggering CSS enter animation */}
        <div key={idx} className={`gs-slide gs-slide-${dir}`} aria-hidden="true">
          <img src={slide.src} alt={slide.alt} draggable={false} />
        </div>

        {/* Caption */}
        <div key={`c${idx}`} className="gs-caption">
          <span className="gs-caption-label">{slide.label}</span>
          <span className="gs-caption-text">{slide.caption}</span>
        </div>

        {/* Progress bar */}
        <div className="gs-progress" aria-hidden="true">
          <div key={`p${idx}`} className="gs-progress-fill" />
        </div>

        {/* Counter */}
        <p className="gs-counter">{idx + 1} / {n}</p>

        {/* Expand button for lightbox */}
        <button
          className="gs-expand"
          onClick={() => onOpenLightbox?.(idx)}
          aria-label="View full size"
        >⤢</button>
      </div>

      {/* Nav row: arrow · dots · arrow — outside stage, no z-index conflicts */}
      <div className="gs-nav">
        <button className="gs-btn gs-btn--prev" onClick={goPrev} aria-label="Previous photo">
          <svg width="36" height="12" viewBox="0 0 36 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <line x1="36" y1="6" x2="6" y2="6" />
            <polyline points="11,1 5,6 11,11" />
          </svg>
        </button>

        <div
          className="gs-track"
          role="slider"
          aria-valuenow={idx + 1}
          aria-valuemin={1}
          aria-valuemax={n}
          aria-label="Slide position"
          onClick={e => {
            const pct = e.nativeEvent.offsetX / e.currentTarget.offsetWidth
            const target = Math.round(pct * (n - 1))
            setDir(target > idx ? 'forward' : 'backward')
            setIdx(target)
          }}
        >
          <div
            className="gs-track-fill"
            style={{ width: `${(idx / Math.max(n - 1, 1)) * 100}%` }}
          />
        </div>

        <button className="gs-btn gs-btn--next" onClick={goNext} aria-label="Next photo">
          <svg width="36" height="12" viewBox="0 0 36 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <line x1="0" y1="6" x2="30" y2="6" />
            <polyline points="25,1 31,6 25,11" />
          </svg>
        </button>
      </div>
    </section>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ slides, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPrev, onNext, onClose])

  return (
    <div
      className="gallery-lb"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
    >
      <button className="gallery-lb-close" onClick={onClose} aria-label="Close">✕</button>

      <button
        className="gallery-lb-arrow gallery-lb-prev"
        onClick={e => { e.stopPropagation(); onPrev() }}
        aria-label="Previous photo"
      >←</button>

      <div className="gallery-lb-stage" onClick={e => e.stopPropagation()}>
        <img
          key={index}
          src={slides[index].src}
          alt={slides[index].alt}
          className="gallery-lb-img"
        />
      </div>

      <button
        className="gallery-lb-arrow gallery-lb-next"
        onClick={e => { e.stopPropagation(); onNext() }}
        aria-label="Next photo"
      >→</button>

      <p className="gallery-lb-counter">{index + 1} / {slides.length}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState(null)

  // Set page-specific title and description for SEO
  useEffect(() => {
    const prevTitle = document.title
    const metaDesc  = document.querySelector('meta[name="description"]')
    const prevDesc  = metaDesc?.getAttribute('content')

    document.title = 'Photo Gallery — La Dolce Vita · Las Terrenas, Samaná'
    metaDesc?.setAttribute('content',
      'Browse photos of the private pool, bedrooms, living spaces, and Caribbean coastal scenery at La Dolce Vita in Las Terrenas, Samaná, Dominican Republic.'
    )

    return () => {
      document.title = prevTitle
      if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc)
    }
  }, []) // { category, index } | null

  const openLightbox  = (category, index) => setLightbox({ category, index })
  const closeLightbox = useCallback(() => setLightbox(null), [])

  const lbSlides = lightbox ? CATEGORIES[lightbox.category] : []
  const lbIndex  = lightbox?.index ?? 0

  const lbPrev = useCallback(() =>
    setLightbox(lb => ({ ...lb, index: (lb.index - 1 + lbSlides.length) % lbSlides.length }))
  , [lbSlides.length])

  const lbNext = useCallback(() =>
    setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lbSlides.length }))
  , [lbSlides.length])

  const total = CATEGORIES.scenery.length + CATEGORIES.property.length

  return (
    <div className="gallery-page">
      <header className="gallery-page-header">
        <p className="gallery-page-eyebrow">The Property</p>
        <h1 className="gallery-page-title">La Dolce Vita</h1>
        <p className="gallery-page-subtitle">{total} photos</p>
      </header>

      <Slideshow
        slides={CATEGORIES.scenery}
        eyebrow="Scenery"
        title="The Coast"
        onOpenLightbox={i => openLightbox('scenery',  i)}
      />

      <Slideshow
        slides={CATEGORIES.property}
        eyebrow="The Villa"
        title="La Dolce Vita"
        onOpenLightbox={i => openLightbox('property', i)}
      />

      {lightbox && (
        <Lightbox
          slides={lbSlides}
          index={lbIndex}
          onClose={closeLightbox}
          onPrev={lbPrev}
          onNext={lbNext}
        />
      )}
    </div>
  )
}
