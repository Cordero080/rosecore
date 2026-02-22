import { useState } from 'react'
import './SideNav.css'

const NAV_ITEMS = [
  { id: 'home',          label: 'Home'          },
  { id: 'amenities',     label: 'Amenities'     },
  { id: 'services',      label: 'Services'      },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'excursions',    label: 'Excursions'    },
  { id: 'beaches',       label: 'Beaches'       },
  { id: 'gallery',       label: 'Photo Gallery' },
  { id: 'contact',       label: 'Contact'       },
]

export default function SideNav() {
  const [active, setActive] = useState('home')

  return (
    <nav className="sidenav">
      <div className="sidenav-grain" />
      <div className="sidenav-glow" />

      <div className="sidenav-brand">
        <span className="sidenav-brand-short">RC</span>
        <span className="sidenav-brand-full">Rosecore</span>
      </div>

      <ul className="sidenav-list">
        {NAV_ITEMS.map(item => (
          <li key={item.id}>
            <button
              className={`sidenav-item ${active === item.id ? 'sidenav-item--active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="sidenav-icon" />
              <span className="sidenav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
