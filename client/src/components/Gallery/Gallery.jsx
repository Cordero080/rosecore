import { useState, useEffect, useCallback, useRef } from 'react'
import './Gallery.css'

const imageModules = import.meta.glob('../../assets/images/*.jpeg', { eager: true })
const images = Object.values(imageModules).map(m => m.default)

const INTERVAL = 6000

export default function Gallery() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev]       = useState(null)
  const timerRef              = useRef(null)

  const goTo = useCallback((index) => {
    setPrev(current)
    setCurrent(index)
  }, [current])

  const next = useCallback(() => {
    goTo((current + 1) % images.length)
  }, [current, goTo])

  const previous = useCallback(() => {
    goTo((current - 1 + images.length) % images.length)
  }, [current, goTo])

  useEffect(() => {
    timerRef.current = setInterval(next, INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [next])

  function resetTimer() {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(next, INTERVAL)
  }

  function handlePrev() { previous(); resetTimer() }
  function handleNext() { next();     resetTimer() }
  function handleDot(i) { goTo(i);   resetTimer() }

  return (
    <section id="gallery" className="gallery">

      <div className="gallery-slides">
        {images.map((src, i) => (
          <div
            key={i}
            className={`gallery-slide ${i === current ? 'is-active' : ''} ${i === prev ? 'is-prev' : ''}`}
          >
            <div
              className={`gallery-slide-img kb-${(i % 4) + 1}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          </div>
        ))}
      </div>

      <div className="gallery-veil" />

      <div className="gallery-ui">
        <div className="gallery-header">
          <p className="gallery-eyebrow">The Property</p>
          <h2 className="gallery-title">La Dolce Vita</h2>
        </div>

        <div className="gallery-controls">
          <button className="gallery-arrow" onClick={handlePrev} aria-label="Previous">
            ←
          </button>

          <div className="gallery-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`gallery-dot ${i === current ? 'is-active' : ''}`}
                onClick={() => handleDot(i)}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>

          <button className="gallery-arrow" onClick={handleNext} aria-label="Next">
            →
          </button>
        </div>

        <p className="gallery-counter">{current + 1} / {images.length}</p>
      </div>

    </section>
  )
}
