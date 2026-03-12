import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './ContactPage.css'

export default function ContactPage() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = 'Contact — La Dolce Vita · Las Terrenas'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Get in touch with La Dolce Vita. Questions, availability, and reservations — we\'re here to help.')
  }, [])

  return (
    <main className="contact-page">

      <header className="contact-header">
        <p className="contact-eyebrow">{t('contact.eyebrow')}</p>
        <h1 className="contact-title">{t('contact.title')} <span className="contact-title-gold">{t('contact.titleGold')}</span></h1>
        <p className="contact-subtitle">{t('contact.subtitle')}</p>
      </header>

      <div className="contact-divider" aria-hidden="true">
        <span className="contact-divider-line" />
        <span className="contact-divider-diamond" />
        <span className="contact-divider-line" />
      </div>

      <div className="contact-body">

        {/* ── Direct contact ── */}
        <section className="contact-section">
          <p className="contact-section-eyebrow">{t('contact.directLabel')}</p>
          <ul className="contact-list">
            <li className="contact-row">
              <span className="contact-row-label">{t('contact.phoneLabel')}</span>
              <span className="contact-row-dash" />
              <a className="contact-row-value" href="tel:+17048022216">+1 (704) 802-2216</a>
            </li>
            {/* Email — stretch goal */}
          </ul>
          <p className="contact-note">{t('contact.whatsappNote')}</p>
        </section>

        {/* ── Book online ── */}
        <section className="contact-section">
          <p className="contact-section-eyebrow">{t('contact.bookLabel')}</p>
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
                {t('contact.airbnbLink')}
              </a>
            </li>
            {/* Booking.com — stretch goal: add link here */}
          </ul>
        </section>

        {/* ── Find us ── */}
        <section className="contact-section">
          <p className="contact-section-eyebrow">{t('contact.findUsLabel')}</p>
          <ul className="contact-list">
            <li className="contact-row">
              <span className="contact-row-label">{t('contact.addressLabel')}</span>
              <span className="contact-row-dash" />
              <span className="contact-row-value">
                Ave 27 de Febrero, Apt 2<br />
                Las Terrenas, Samaná<br />
                Dominican Republic
              </span>
            </li>
            <li className="contact-row">
              <span className="contact-row-label">{t('contact.mapsLabel')}</span>
              <span className="contact-row-dash" />
              <a
                className="contact-row-value"
                href="https://www.google.com/maps/place/La+Dolce+Vita+Beachfront+Rental+Apt+2/@19.3228721,-69.5348155,19z/data=!4m9!3m8!1s0x8eaefbedd8f84925:0x4334c14da98a57fc!5m2!4m1!1i2!8m2!3d19.3230496!4d-69.5337566!16s%2Fg%2F11qqk3h2cy?entry=ttu&g_ep=EgoyMDI2MDMwNC4xIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('contact.mapsLink')}
              </a>
            </li>
          </ul>
        </section>

        {/* ── Chat widget callout ── */}
        <section className="contact-chat-cta">
          <p className="contact-chat-label">{t('contact.chatLabel')}</p>
          <p className="contact-chat-note">{t('contact.chatNote')}</p>
        </section>

      </div>
    </main>
  )
}
