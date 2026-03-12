import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './BeachesPage.css'
import bonitaImg   from '../../assets/images/beaches/bonita.jpg'
import puntaPopImg from '../../assets/images/beaches/punta-popy.jpg'
import ballenasImg from '../../assets/images/beaches/las-ballenas.jpg'
import rinconImg   from '../../assets/images/beaches/rincon.jpg'
import galerasImg  from '../../assets/images/beaches/las-galeras.jpg'
import cosonImg    from '../../assets/images/beaches/coson.jpg'
import moronImg    from '../../assets/images/beaches/moron.jpg'
import cayoImg     from '../../assets/images/beaches/el-cayo-levantado.jpg'

const IMAGES = [bonitaImg, puntaPopImg, ballenasImg, cosonImg, moronImg, rinconImg, cayoImg, galerasImg]

export default function BeachesPage() {
  const { t } = useTranslation()
  const beaches = t('beaches.beaches', { returnObjects: true })

  useEffect(() => {
    document.title = 'Beaches — La Dolce Vita · Las Terrenas'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Eight beaches from La Dolce Vita — from Playa Bonita steps away to Cayo Levantado island and the legendary Playa Rincón. Las Terrenas, Samaná.')
  }, [])

  return (
    <main className="beaches-page">

      <header className="beaches-header">
        <p className="beaches-eyebrow">{t('beaches.eyebrow')}</p>
        <h1 className="beaches-title">{t('beaches.title')} <span className="beaches-title-gold">{t('beaches.titleGold')}</span></h1>
        <p className="beaches-subtitle">{t('beaches.subtitle')}</p>
      </header>

      <div className="beaches-divider" aria-hidden="true">
        <span className="beaches-divider-line" />
        <span className="beaches-divider-diamond" />
        <span className="beaches-divider-line" />
      </div>

      <ul className="beaches-list">
        {beaches.map((beach, i) => (
          <li className="beach-entry" key={i}>

            <div className="beach-entry-meta">
              <span className="beach-entry-id">{String(i + 1).padStart(2, '0')}</span>
              <span className="beach-entry-distance">{beach.distance}</span>
              <span className="beach-entry-drive">{beach.drive}</span>
            </div>

            <div className="beach-entry-body">
              <div className="beach-image-wrap">
                {IMAGES[i]
                  ? <img src={IMAGES[i]} alt={beach.name} className="beach-image" />
                  : <div className="beach-image-placeholder">
                      <span className="beach-image-placeholder-name">{beach.name}</span>
                    </div>
                }
              </div>

              <div className="beach-entry-content">
                <h2 className="beach-name">{beach.name}</h2>
                <p className="beach-body">{beach.body}</p>
                <ul className="beach-tags">
                  {beach.tags.map(tag => (
                    <li className="beach-tag" key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </div>

          </li>
        ))}
      </ul>

    </main>
  )
}
