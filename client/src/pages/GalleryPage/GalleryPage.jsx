import { useState, useEffect, useCallback } from 'react'
import './GalleryPage.css'

const imageModules = import.meta.glob('../../assets/images/*.jpeg', { eager: true })
const images = Object.values(imageModules).map(m => m.default)

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState(null)

  const close = useCallback(() => setLightbox(null), [])

  const prev = useCallback(() => {
    setLightbox(i => (i - 1 + images.length) % images.length)
  }, [])

  const next = useCallback(() => {
    setLightbox(i => (i + 1) % images.length)
  }, [])

  useEffect(() => {
    if (lightbox === null) return
    function onKey(e) {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next, close])

  return (
    <div className="gallery-page">
      <header className="gallery-page-header">
        <p className="gallery-page-eyebrow">The Property</p>
        <h1 className="gallery-page-title">La Dolce Vita</h1>
        <p className="gallery-page-subtitle">{images.length} photos</p>
      </header>

      <div className="gallery-page-grid">
        {images.map((src, i) => (
          <button
            key={i}
            className="gallery-thumb"
            onClick={() => setLightbox(i)}
            aria-label={`View photo ${i + 1} of ${images.length}`}
          >
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="gallery-lb"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          <button className="gallery-lb-close" onClick={close} aria-label="Close">✕</button>

          <button
            className="gallery-lb-arrow gallery-lb-prev"
            onClick={e => { e.stopPropagation(); prev() }}
            aria-label="Previous photo"
          >←</button>

          <div className="gallery-lb-stage" onClick={e => e.stopPropagation()}>
            <img
              key={lightbox}
              src={images[lightbox]}
              alt={`Photo ${lightbox + 1}`}
              className="gallery-lb-img"
            />
          </div>

          <button
            className="gallery-lb-arrow gallery-lb-next"
            onClick={e => { e.stopPropagation(); next() }}
            aria-label="Next photo"
          >→</button>

          <p className="gallery-lb-counter">{lightbox + 1} / {images.length}</p>
        </div>
      )}
    </div>
  )
}
