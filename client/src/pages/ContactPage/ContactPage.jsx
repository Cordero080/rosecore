import { useEffect } from 'react'
import './ContactPage.css'

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact — La Dolce Vita · Las Terrenas'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Get in touch with La Dolce Vita. Questions, availability, and reservations — we\'re here to help.')
  }, [])

  return (
    <main className="contact-page">

      <header className="contact-header">
        <p className="contact-eyebrow">La Dolce Vita · Las Terrenas</p>
        <h1 className="contact-title">Get in <span className="contact-title-gold">touch</span></h1>
        <p className="contact-subtitle">We're happy to answer questions before you book.</p>
      </header>

      <div className="contact-divider" aria-hidden="true">
        <span className="contact-divider-line" />
        <span className="contact-divider-diamond" />
        <span className="contact-divider-line" />
      </div>

      <div className="contact-body">

        {/* ── Direct contact ── */}
        <section className="contact-section">
          <p className="contact-section-eyebrow">Direct</p>
          <ul className="contact-list">
            <li className="contact-row">
              <span className="contact-row-label">Phone / WhatsApp</span>
              <span className="contact-row-dash" />
              <a className="contact-row-value" href="tel:+17048022216">+1 (704) 802-2216</a>
            </li>
            {/* Email — stretch goal */}
          </ul>
          <p className="contact-note">WhatsApp is the fastest way to reach us. We typically respond within a few hours.</p>
        </section>

        {/* ── Book online ── */}
        <section className="contact-section">
          <p className="contact-section-eyebrow">Book online</p>
          <ul className="contact-list">
            <li className="contact-row">
              <span className="contact-row-label">Airbnb</span>
              <span className="contact-row-dash" />
              <a
                className="contact-row-value"
                href="https://www.airbnb.com/rooms/37812103"
                target="_blank"
                rel="noopener noreferrer"
              >
                View listing ↗
              </a>
            </li>
            {/* Booking.com — stretch goal: add link here */}
          </ul>
        </section>

        {/* ── Find us ── */}
        <section className="contact-section">
          <p className="contact-section-eyebrow">Find us</p>
          <ul className="contact-list">
            <li className="contact-row">
              <span className="contact-row-label">Address</span>
              <span className="contact-row-dash" />
              <span className="contact-row-value">
                Ave 27 de Febrero, Apt 2<br />
                Las Terrenas, Samaná<br />
                Dominican Republic
              </span>
            </li>
            <li className="contact-row">
              <span className="contact-row-label">Maps</span>
              <span className="contact-row-dash" />
              <a
                className="contact-row-value"
                href="https://www.google.com/maps?q=19.3230496,-69.5337566"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Maps ↗
              </a>
            </li>
          </ul>
        </section>

        {/* ── Chat widget callout ── */}
        <section className="contact-chat-cta">
          <p className="contact-chat-label">Or use the chat</p>
          <p className="contact-chat-note">
            The concierge in the bottom-right corner can answer most questions instantly —
            availability, pricing, check-in, and more.
          </p>
        </section>

      </div>
    </main>
  )
}
