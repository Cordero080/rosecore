import { useEffect } from 'react'
import './BeachesPage.css'
import bonitaImg   from '../../assets/images/beaches/bonita.jpg'
import puntaPopImg   from '../../assets/images/beaches/punta-popy.jpg'
import ballenasImg   from '../../assets/images/beaches/las-ballenas.jpg'
import rinconImg     from '../../assets/images/beaches/rincon.jpg'
import galerasImg    from '../../assets/images/beaches/las-galeras.jpg'
import cosonImg     from '../../assets/images/beaches/coson.jpg'

const BEACHES = [
  {
    id:       '01',
    name:     'Playa Bonita',
    distance: '5 min',
    drive:    'Walking distance',
    body:     'The closest beach to the residence and the one you\'ll return to most. Calm turquoise water, white sand, and palm trees that lean into the wind. The sunsets here are unhurried and spectacular — the kind that make you stay longer than planned.',
    tags:     ['Swimming', 'Sunsets', 'Palms'],
    image:    bonitaImg,
  },
  {
    id:       '02',
    name:     'Playa Punta Popy',
    distance: '10 min',
    drive:    'Short drive or walk',
    body:     'The town beach. Calmer water, a string of cafés and beach bars along the shore. Good for a morning coffee with your feet in the sand, or a long afternoon with nowhere to be.',
    tags:     ['Cafés', 'Town beach', 'Calm water'],
    image:    puntaPopImg,
  },
  {
    id:       '03',
    name:     'Playa Las Ballenas',
    distance: '15 min',
    drive:    'Short drive',
    body:     'Quiet and windswept, with an end-of-the-world feeling that the other beaches lack. Best walked at golden hour, when the light turns amber and the beach is mostly empty.',
    tags:     ['Walking', 'Golden hour', 'Quiet'],
    image:    ballenasImg,
  },
  {
    id:       '04',
    name:     'Playa Cosón',
    distance: '20 min',
    drive:    'Short drive',
    body:     'Seven kilometres of wild, undeveloped beach — one of the longest in the Dominican Republic. A favourite among surfers and anyone who wants to feel genuinely far from civilisation. Bring water.',
    tags:     ['Surfing', 'Wild beach', 'Long stretch'],
    image:    cosonImg,
  },
  {
    id:       '05',
    name:     'Playa Morón',
    distance: '35 min',
    drive:    'Drive required',
    body:     'Remote and peaceful, with almost no crowds even in high season. Pristine water, dramatic cliffs nearby, and the kind of silence that\'s hard to find anywhere on the peninsula.',
    tags:     ['Remote', 'Uncrowded', 'Pristine'],
    image:    null,
  },
  {
    id:       '06',
    name:     'Playa Rincón',
    distance: '40 min',
    drive:    'Drive required',
    body:     'Consistently ranked among the best beaches in the Caribbean — and it earns it. A long arc of white sand backed by coconut palms, with a river at one end and clear Atlantic water. Worth every minute of the drive.',
    tags:     ['Top-rated', 'Caribbean classic', 'River'],
    image:    rinconImg,
  },
  {
    id:       '07',
    name:     'Las Galeras',
    distance: '45 min',
    drive:    'Drive required',
    body:     'A small fishing village at the far tip of the Samaná Peninsula. The drive alone is worth it — winding roads through jungle and hills. Several small beaches within the village, each one more secluded than the last.',
    tags:     ['Village', 'Secluded', 'Scenic drive'],
    image:    galerasImg,
  },
]

export default function BeachesPage() {
  useEffect(() => {
    document.title = 'Beaches — La Dolce Vita · Las Terrenas'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Seven beaches within 45 minutes of La Dolce Vita — from Playa Bonita steps away to the legendary Playa Rincón. Las Terrenas, Samaná.')
  }, [])

  return (
    <main className="beaches-page">

      <header className="beaches-header">
        <p className="beaches-eyebrow">Las Terrenas · Samaná · Dominican Republic</p>
        <h1 className="beaches-title">The <span className="beaches-title-gold">Coast</span></h1>
        <p className="beaches-subtitle">Seven beaches within 45 minutes.</p>
      </header>

      <div className="beaches-divider" aria-hidden="true">
        <span className="beaches-divider-line" />
        <span className="beaches-divider-diamond" />
        <span className="beaches-divider-line" />
      </div>

      <ul className="beaches-list">
        {BEACHES.map(({ id, name, distance, drive, body, tags, image }) => (
          <li className="beach-entry" key={id}>

            <div className="beach-entry-meta">
              <span className="beach-entry-id">{id}</span>
              <span className="beach-entry-distance">{distance}</span>
              <span className="beach-entry-drive">{drive}</span>
            </div>

            <div className="beach-entry-body">
              <div className="beach-image-wrap">
                {image
                  ? <img src={image} alt={name} className="beach-image" />
                  : <div className="beach-image-placeholder">
                      <span className="beach-image-placeholder-name">{name}</span>
                    </div>
                }
              </div>

              <div className="beach-entry-content">
                <h2 className="beach-name">{name}</h2>
                <p className="beach-body">{body}</p>
                <ul className="beach-tags">
                  {tags.map(tag => (
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
