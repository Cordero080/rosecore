import './Hero.css'

export default function Hero() {
  function scrollToCalendar() {
    document.getElementById('availability')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-bg-veil" />
      </div>

      <div className="hero-content">
        <p className="hero-eyebrow">Private Villa · Dominican Republic</p>

        <h1 className="hero-headline">
          La Dolce Vita
        </h1>

        <p className="hero-tagline">A place to <em>exhale</em>.</p>

        <div className="hero-actions">
          <button className="hero-btn hero-btn--primary" onClick={scrollToCalendar}>
            Check Availability
          </button>
          <button className="hero-btn hero-btn--ghost">
            Explore the Property
          </button>
        </div>
      </div>

      <div className="hero-glass-card">
        <p className="hero-card-label">Now booking</p>
        <p className="hero-card-value">Summer 2026</p>
      </div>
    </section>
  )
}
