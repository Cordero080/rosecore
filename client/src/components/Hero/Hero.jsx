import { useNavigate } from 'react-router-dom'
import './Hero.css'

export default function Hero() {
  const navigate = useNavigate()

  function scrollToCalendar() {
    document.getElementById('availability')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-bg-veil" />
      </div>

      <div className="hero-content">
        <p className="hero-eyebrow">Private Residence · Dominican Republic</p>

        <h1 className="hero-headline">
          La Dolce Vita
        </h1>

        <p className="hero-tagline">A place to <em>exhale</em>.</p>

        <div className="hero-actions">
          <button className="hero-btn hero-btn--primary" onClick={scrollToCalendar}>
            Check Availability
          </button>
          <button className="hero-btn hero-btn--ghost" onClick={() => navigate('/gallery')}>
            Explore the Property
          </button>
        </div>
      </div>

      {/* Curved tongue extending from bottom-left of hero into the next section */}
      <div className="hero-tongue" aria-hidden="true">
        <svg viewBox="0 0 690 130" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tongue-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f5f7fa50" stopOpacity="1"   />
              <stop offset="100%" stopColor="#f5f7fa61" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path
            d="M 0 0 C 1400 10, 600 700, 100 110 L 1000 130 L 0 1130 Z"
            fill="url(#tongue-fade)"
          />
        </svg>
      </div>
    </section>
  )
}
