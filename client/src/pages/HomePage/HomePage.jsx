import { useEffect } from 'react'
import Hero from '../../components/Hero/Hero'
import AvailabilityCalendar from '../../components/AvailabilityCalendar/AvailabilityCalendar'
import Gallery from '../../components/Gallery/Gallery'
import './HomePage.css'

function useSceneTransition() {
  useEffect(() => {
    const gallery = document.getElementById('gallery')
    const veil    = document.getElementById('gallery-scene-veil')
    const avail   = document.getElementById('availability')
    if (!gallery || !veil || !avail) return

    gallery.style.willChange = 'transform'
    veil.style.willChange    = 'opacity'

    // Position the veil: 200px overlap above the availability/gallery seam
    function positionVeil() {
      veil.style.top    = (avail.offsetTop + avail.offsetHeight - 200) + 'px'
      veil.style.height = '750px'
    }

    positionVeil()

    const ro = new ResizeObserver(positionVeil)
    ro.observe(avail)

    let raf = null

    function update() {
      const vh  = window.innerHeight
      const top = gallery.getBoundingClientRect().top
      // t: 0 = gallery just entering viewport bottom, 1 = gallery top at viewport top
      const t = Math.max(0, Math.min(1, (vh - top) / vh))

      // Veil fades out, revealing gallery beneath
      veil.style.opacity = String(1 - t)

      // Gallery scales subtly into place — no translateY so no edge gaps
      gallery.style.transform = `scale(${0.97 + t * 0.03})`
    }

    function onScroll() {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      gallery.style.cssText = ''
      veil.style.cssText    = ''
    }
  }, [])
}

export default function HomePage() {
  useSceneTransition()
  return (
    <>
      <Hero />
      <section id="availability">
        <AvailabilityCalendar />
        <div className="availability-cta">
          <a href="https://www.airbnb.com/rooms/37812103" target="_blank" rel="noopener noreferrer" className="escape-cta">Reserve your stay</a>
          <a href="https://search.google.com/local/writereview?placeid=ChIJJUn42O37ro4R_FeKqU3BNEM" target="_blank" rel="noopener noreferrer" className="escape-review">Leave a review</a>
        </div>
      </section>
      <div id="gallery-scene-veil" className="gallery-scene-veil" />
      <section id="interlude">
        <p className="interlude-quote">A place where time slows, and the sea remembers your name.</p>
        <div className="interlude-rule" aria-hidden="true" />
      </section>
      <div className="gallery-scene">
        <Gallery />
      </div>
      <section id="escape">
        <h2 className="escape-heading">Book your escape.</h2>
        <a href="https://www.airbnb.com/rooms/37812103" target="_blank" rel="noopener noreferrer" className="escape-cta">Reserve your stay</a>
        <a href="https://search.google.com/local/writereview?placeid=ChIJJUn42O37ro4R_FeKqU3BNEM" target="_blank" rel="noopener noreferrer" className="escape-review">Leave a review</a>
      </section>
    </>
  )
}
