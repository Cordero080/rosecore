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
  const [mobileOpen, setMobileOpen] = useState(false)

  function close() { setMobileOpen(false) }

  return (
    <>
      {/* Hamburger — mobile only, shown via CSS */}
      <button
        className={`hamburger-btn ${mobileOpen ? 'is-active' : ''}`}
        onClick={() => setMobileOpen(p => !p)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        <span className="hamburger-icon">
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </span>
      </button>

      {/* Overlay — mobile only */}
      <div
        className={`nav-overlay ${mobileOpen ? 'is-visible' : ''}`}
        onClick={close}
      />

      <nav className={`sidenav ${mobileOpen ? 'is-open' : ''}`}>
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
                onClick={() => { setActive(item.id); close() }}
              >
                <span className="sidenav-icon" />
                <span className="sidenav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
