import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./SideNav.css";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
];

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const NAV_ITEMS = [
    { id: "home", label: t("nav.home"), path: "/" },
    { id: "about", label: t("nav.about"), path: "/about" },
    { id: "amenities", label: t("nav.amenities"), path: "/amenities" },
    { id: "entertainment", label: t("nav.entertainment") },
    { id: "beaches", label: t("nav.beaches"), path: "/beaches" },
    { id: "gallery", label: t("nav.gallery"), path: "/gallery" },
    { id: "contact", label: t("nav.contact"), path: "/contact" },
  ];

  const pathToId = {
    "/": "home",
    "/about": "about",
    "/gallery": "gallery",
    "/amenities": "amenities",
    "/contact": "contact",
    "/beaches": "beaches",
  };
  const activeId = pathToId[location.pathname] ?? "home";

  function close() {
    setMobileOpen(false);
  }

  function handleItem(item) {
    if (item.path) navigate(item.path);
    close();
  }

  return (
    <>
      <button
        className={`hamburger-btn ${mobileOpen ? "is-active" : ""}`}
        onClick={() => setMobileOpen((p) => !p)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        <span className="hamburger-icon">
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </span>
      </button>

      <div
        className={`nav-overlay ${mobileOpen ? "is-visible" : ""}`}
        onClick={close}
      />

      <nav className={`sidenav ${mobileOpen ? "is-open" : ""}`}>
        <div className="sidenav-grain" />
        <div className="sidenav-glow" />

        <div className="sidenav-brand">
          <span className="sidenav-brand-short">RC</span>
          <span className="sidenav-brand-full">Rosecore</span>
        </div>

        <ul className="sidenav-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                className={`sidenav-item ${activeId === item.id ? "sidenav-item--active" : ""} ${!item.path ? "sidenav-item--disabled" : ""}`}
                onClick={() => handleItem(item)}
                disabled={!item.path}
              >
                <span className="sidenav-icon" />
                <span className="sidenav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="sidenav-lang">
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              className={`sidenav-lang-btn ${i18n.resolvedLanguage === lang.code ? "sidenav-lang-btn--active" : ""}`}
              onClick={() => i18n.changeLanguage(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
