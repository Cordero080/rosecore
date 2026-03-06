import { useEffect } from 'react'
import './AmenitiesPage.css'

const STATS = [
  { value: '2',    label: 'Bedrooms'   },
  { value: '2',    label: 'Bathrooms'  },
  { value: '4',    label: 'Guests max' },
  { value: '$130', label: 'Per night'  },
]

const AMENITIES = [
  { name: 'Private Pool',    detail: 'Exclusive to guests. Palm-shaded, open year-round.'              },
  { name: 'Beachfront',      detail: '5-minute walk to Playa Bonita — turquoise water, white sand.'   },
  { name: 'Air Conditioning',detail: 'Central AC throughout all rooms.'                               },
  { name: 'Full Kitchen',    detail: 'Fully equipped. Cook at home or stock up at the local market.'  },
  { name: 'High-Speed WiFi', detail: 'Reliable connection for remote work or streaming.'              },
  { name: 'Washer & Dryer',  detail: 'In-unit laundry. Ideal for longer stays.'                      },
  { name: 'Pets Welcome',    detail: 'Well-behaved pets allowed. Please mention when booking.'        },
  { name: 'Private Parking', detail: 'On-site parking available for guests with a vehicle.'          },
]

const RULES = [
  { label: 'Check-in',  value: '3:00 PM'   },
  { label: 'Check-out', value: '11:00 AM'  },
  { label: 'Guests',    value: 'Up to 4'   },
  { label: 'Pets',      value: 'Allowed'   },
]

export default function AmenitiesPage() {
  useEffect(() => {
    document.title = 'Amenities — La Dolce Vita · Las Terrenas'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Private pool, full kitchen, AC, beachfront access and more. Everything included at La Dolce Vita in Las Terrenas, Dominican Republic.')
  }, [])

  return (
    <main className="amenities-page">

      <header className="amenities-header">
        <p className="amenities-eyebrow">La Dolce Vita · Las Terrenas</p>
        <h1 className="amenities-title">The <span className="amenities-title-gold">Space</span></h1>
        <p className="amenities-subtitle">Ave 27 de Febrero · Samaná, Dominican Republic</p>
      </header>

      <div className="amenities-stats">
        {STATS.map(({ value, label }) => (
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
        <p className="amenities-section-eyebrow">Included</p>
        <h2 className="amenities-section-title">What's here</h2>
        <div className="amenities-grid">
          {AMENITIES.map(({ name, detail }) => (
            <div className="amenity-card" key={name}>
              <span className="amenity-rule" />
              <h3 className="amenity-name">{name}</h3>
              <p className="amenity-detail">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="amenities-rules-section">
        <p className="amenities-section-eyebrow">Details</p>
        <h2 className="amenities-section-title">House rules</h2>
        <ul className="amenities-rules-list">
          {RULES.map(({ label, value }) => (
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
