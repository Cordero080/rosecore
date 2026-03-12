import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './AmenitiesPage.css'

export default function AmenitiesPage() {
  const { t } = useTranslation()
  const stats     = t('amenities.stats',     { returnObjects: true })
  const amenities = t('amenities.amenities', { returnObjects: true })
  const rules     = t('amenities.rules',     { returnObjects: true })

  useEffect(() => {
    document.title = 'Amenities — La Dolce Vita · Las Terrenas'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Private pool, full kitchen, AC, beachfront access and more. Everything included at La Dolce Vita in Las Terrenas, Dominican Republic.')
  }, [])

  return (
    <main className="amenities-page">

      <header className="amenities-header">
        <p className="amenities-eyebrow">{t('amenities.eyebrow')}</p>
        <h1 className="amenities-title">{t('amenities.title')} <span className="amenities-title-gold">{t('amenities.titleGold')}</span></h1>
        <p className="amenities-subtitle">{t('amenities.subtitle')}</p>
      </header>

      <div className="amenities-stats">
        {stats.map(({ value, label }) => (
          <div className="amenities-stat" key={label}>
            <span className="amenities-stat-value">{value}</span>
            <span className="amenities-stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="amenities-divider" aria-hidden="true">
        <span className="amenities-divider-line" />
        <span className="amenities-divider-diamond" />
        <span className="amenities-divider-line" />
      </div>

      <section className="amenities-section">
        <p className="amenities-section-eyebrow">{t('amenities.includedLabel')}</p>
        <h2 className="amenities-section-title">{t('amenities.whatsHereTitle')}</h2>
        <div className="amenities-grid">
          {amenities.map(({ name, detail }) => (
            <div className="amenity-card" key={name}>
              <span className="amenity-rule" />
              <h3 className="amenity-name">{name}</h3>
              <p className="amenity-detail">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="amenities-rules-section">
        <p className="amenities-section-eyebrow">{t('amenities.detailsLabel')}</p>
        <h2 className="amenities-section-title">{t('amenities.houseRulesTitle')}</h2>
        <ul className="amenities-rules-list">
          {rules.map(({ label, value }) => (
            <li className="amenities-rule-row" key={label}>
              <span className="amenities-rule-label">{label}</span>
              <span className="amenities-rule-dash" />
              <span className="amenities-rule-value">{value}</span>
            </li>
          ))}
        </ul>
      </section>

    </main>
  )
}
