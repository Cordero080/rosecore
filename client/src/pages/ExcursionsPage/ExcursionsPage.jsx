import { useEffect } from 'react'
import './ExcursionsPage.css'
import whaleImg     from '../../assets/images/excursions/whale-watching.jpg'
import limonImg     from '../../assets/images/excursions/el-limon.jpg'
import haitisesImg  from '../../assets/images/excursions/los-haitises.jpg'
import rinconImg    from '../../assets/images/excursions/rincon-day.jpg'
import snorkelImg   from '../../assets/images/excursions/snorkeling.jpg'
import atvImg       from '../../assets/images/excursions/atv-jungle.jpg'
import ziplineImg   from '../../assets/images/excursions/zipline.jpg'
import kiteImg      from '../../assets/images/excursions/kitesurfing.jpg'

const EXCURSIONS = [
  {
    id:       '01',
    name:     'Humpback Whale Watching',
    duration: 'Half day',
    season:   'Jan – Mar only',
    body:     'Every year, thousands of humpback whales migrate to Samaná Bay to breed — one of the highest concentrations on the planet. You\'ll hear them before you see them. A local guide boat takes you close enough to watch them breach, and sometimes close enough to feel the spray. There is nothing else like this in the Caribbean.',
    tags:     ['Seasonal', 'Wildlife', 'Boat tour'],
    image:    whaleImg,
  },
  {
    id:       '02',
    name:     'Salto El Limón',
    duration: 'Half day',
    season:   'Year-round',
    body:     'A 40-metre waterfall deep in the jungle hills of Samaná, reached by horseback on a trail through banana trees and bamboo groves. The pool at the base is cold, clear, and completely hidden from the world. About 30 minutes from the residence. One of the best half-days you can spend on the peninsula.',
    tags:     ['Waterfall', 'Horseback', 'Jungle'],
    image:    limonImg,
  },
  {
    id:       '03',
    name:     'Los Haitises National Park',
    duration: 'Full day',
    season:   'Year-round',
    body:     'A vast protected wilderness of mangroves, limestone karst formations, and caves lined with Taíno petroglyphs. Over 230 bird species, including several endemic to the Dominican Republic. Reached by boat through channels of ancient green forest. Bring a camera and a full day.',
    tags:     ['National park', 'Boat tour', 'Wildlife', 'History'],
    image:    haitisesImg,
  },
  {
    id:       '04',
    name:     'Playa Rincón Day Trip',
    duration: 'Full day',
    season:   'Year-round',
    body:     'Consistently ranked among the top beaches in the Caribbean — and difficult to reach, which is exactly why it stays pristine. Three kilometres of white sand, a river at one end, coconut palms the whole way. Go by boat for the full arrival experience. Bring lunch, or eat at the small local spots on the beach.',
    tags:     ['Beach', 'Boat or car', 'Top-rated'],
    image:    rinconImg,
  },
  {
    id:       '05',
    name:     'Snorkeling & Private Boat Charter',
    duration: 'Half day or full day',
    season:   'Year-round',
    body:     'Charter a local boat and pick your own route — hidden coves, shallow reefs, and beaches only accessible by sea. The water off the Samaná Peninsula is clear enough to see coral formations and sea turtles from the surface. Best arranged through a local guide who knows the spots that don\'t appear on any map.',
    tags:     ['Snorkeling', 'Boat', 'Private', 'Turtles'],
    image:    snorkelImg,
  },
  {
    id:       '06',
    name:     'ATV & Coffee Plantation Tour',
    duration: 'Half day',
    season:   'Year-round',
    body:     'Ride ATVs through jungle trails into the hills above Las Terrenas, stopping at local farms where cacao, coffee, and tropical fruit are grown. You\'ll taste things straight from the tree. A reminder that this island produces some of the finest cacao and coffee in the world, and almost none of it gets exported.',
    tags:     ['ATV', 'Coffee', 'Jungle', 'Local culture'],
    image:    atvImg,
  },
  {
    id:       '07',
    name:     'Zipline in the Rainforest',
    duration: 'Half day',
    season:   'Year-round',
    body:     'Over two kilometres of zipline cables through the forest canopy above Las Terrenas. The views open up between the trees — ocean on one side, mountains on the other. A good option for families or anyone who wants a rush without going far.',
    tags:     ['Zipline', 'Adrenaline', 'Canopy'],
    image:    ziplineImg,
  },
  {
    id:       '08',
    name:     'Kitesurfing & Surf Lessons',
    duration: 'Half day',
    season:   'Year-round',
    body:     'Playa Cosón and El Portillo both have consistent wind and surf, with local instructors available for all levels. Kitesurfing schools operate year-round with equipment rental included. If you\'ve never tried it, the wide empty beaches here are as good a place as any to start.',
    tags:     ['Kitesurfing', 'Surfing', 'Lessons', 'Beach'],
    image:    kiteImg,
  },
]

export default function ExcursionsPage() {
  useEffect(() => {
    const prevTitle = document.title
    const meta = document.querySelector('meta[name="description"]')
    const prevDesc = meta?.getAttribute('content')

    document.title = 'Excursions — La Dolce Vita · Las Terrenas, Samaná'
    meta?.setAttribute('content', 'Eight excursions from La Dolce Vita — whale watching, El Limón waterfall, Los Haitises, private boat charters, and more. Las Terrenas, Samaná, Dominican Republic.')

    return () => {
      document.title = prevTitle
      if (meta && prevDesc) meta.setAttribute('content', prevDesc)
    }
  }, [])

  return (
    <main className="excursions-page">

      <header className="excursions-header">
        <p className="excursions-eyebrow">Las Terrenas · Samaná · Dominican Republic</p>
        <h1 className="excursions-title">The <span className="excursions-title-gold">Peninsula</span></h1>
        <p className="excursions-subtitle">Eight excursions worth leaving the residence for.</p>
      </header>

      <div className="excursions-divider" aria-hidden="true">
        <span className="excursions-divider-line" />
        <span className="excursions-divider-diamond" />
        <span className="excursions-divider-line" />
      </div>

      <ul className="excursions-list">
        {EXCURSIONS.map(({ id, name, duration, season, body, tags, image }) => (
          <li className="excursion-entry" key={id}>

            <div className="excursion-entry-meta">
              <span className="excursion-entry-id">{id}</span>
              <span className="excursion-entry-duration">{duration}</span>
              <span className="excursion-entry-season">{season}</span>
            </div>

            <div className="excursion-entry-body">
              <div className="excursion-image-wrap">
                {image
                  ? <img src={image} alt={name} className="excursion-image" />
                  : <div className="excursion-image-placeholder">
                      <span className="excursion-image-placeholder-name">{name}</span>
                    </div>
                }
              </div>

              <div className="excursion-entry-content">
                <h2 className="excursion-name">{name}</h2>
                <p className="excursion-body">{body}</p>
                <ul className="excursion-tags">
                  {tags.map(tag => (
                    <li className="excursion-tag" key={tag}>{tag}</li>
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
