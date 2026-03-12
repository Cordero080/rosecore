import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Hero from '../../components/Hero/Hero'
import AvailabilityCalendar from '../../components/AvailabilityCalendar/AvailabilityCalendar'
import Gallery from '../../components/Gallery/Gallery'
import './HomePage.css'

function useSceneTransition() {
  useEffect(() => {
    const gallery = document.getElementById('gallery')
    const veil    = document.getElementById('gallery-scene-veil')
    const avail   = document.getElementById('availability')
    const quote   = document.querySelector('.interlude-quote')
    if (!gallery || !veil || !avail) return

    gallery.style.willChange = 'transform'
    veil.style.willChange    = 'opacity'
    if (quote) quote.style.willChange = 'transform, opacity'

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

      // Gallery scale-in
      const galleryTop = gallery.getBoundingClientRect().top
      const t = Math.max(0, Math.min(1, (vh - galleryTop) / vh))
      veil.style.opacity = String(1 - t)
      gallery.style.transform = `scale(${0.97 + t * 0.03})`

      // Quote parallax — grows slightly as it enters view
      if (quote) {
        const qTop = quote.getBoundingClientRect().top
        const q = Math.max(0, Math.min(1, (vh - qTop) / (vh * 0.6)))
        quote.style.opacity   = String(0.4 + q * 0.6)
        quote.style.transform = `scale(${0.95 + q * 0.05})`
      }
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
      if (quote) quote.style.cssText = ''
    }
  }, [])
}

export default function HomePage() {
  useSceneTransition()
  const { t } = useTranslation()

  return (
    <>
      <Hero />
      <section id="availability">
        <AvailabilityCalendar />
        <div className="availability-cta">
          <a href="https://www.airbnb.com/rooms/37812103" target="_blank" rel="noopener noreferrer" className="escape-cta">{t('home.reserveStay')}</a>
          <a href="https://search.google.com/local/writereview?placeid=ChIJJUn42O37ro4R_FeKqU3BNEM" target="_blank" rel="noopener noreferrer" className="escape-review">{t('home.leaveReview')}</a>
        </div>
      </section>
      <div id="gallery-scene-veil" className="gallery-scene-veil" />
      <section id="interlude">
        <p className="interlude-quote">{t('home.interludeQuote')}</p>
        <div className="interlude-rule" aria-hidden="true" />
      </section>
      <div className="gallery-scene">
        <Gallery />
      </div>
      <section id="escape">
        <h2 className="escape-heading">{t('home.bookEscape')}</h2>
        <a href="https://www.airbnb.com/rooms/37812103" target="_blank" rel="noopener noreferrer" className="escape-cta">{t('home.reserveStay')}</a>
        <a href="https://search.google.com/local/writereview?placeid=ChIJJUn42O37ro4R_FeKqU3BNEM" target="_blank" rel="noopener noreferrer" className="escape-review">{t('home.leaveReview')}</a>
      </section>
    </>
  )
}
