import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './SideNav.css'

const NAV_ITEMS = [
  { id: 'home',          label: 'Home',          path: '/'           },
  { id: 'about',         label: 'About',         path: '/about'      },
  { id: 'amenities',     label: 'Amenities',     path: '/amenities'  },
  { id: 'services',      label: 'Services'                           },
  { id: 'entertainment', label: 'Entertainment'                      },
  { id: 'excursions',    label: 'Excursions'                         },
  { id: 'beaches',       label: 'Beaches',       path: '/beaches'    },
  { id: 'gallery',       label: 'Photo Gallery', path: '/gallery'    },
  { id: 'contact',       label: 'Contact',       path: '/contact'    },
]

export default function SideNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const pathToId = { '/': 'home', '/about': 'about', '/gallery': 'gallery', '/amenities': 'amenities', '/contact': 'contact', '/beaches': 'beaches' }
  const activeId = pathToId[location.pathname] ?? 'home'

  function close() { setMobileOpen(false) }

  function handleItem(item) {
    if (item.path) navigate(item.path)
    close()
  }

  return (
    <>
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
                className={`sidenav-item ${activeId === item.id ? 'sidenav-item--active' : ''} ${!item.path ? 'sidenav-item--disabled' : ''}`}
                onClick={() => handleItem(item)}
                disabled={!item.path}
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
