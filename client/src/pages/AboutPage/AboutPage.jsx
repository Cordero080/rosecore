import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./AboutPage.css";

const RECOGNITIONS = [
  {
    score: "9.7",
    outOf: "/ 10",
    source: "Booking.com",
    award: "Traveller Review Awards 2026",
  },
  { score: "5.0", outOf: "/ 5", source: "Airbnb", award: "Guest Favourite" },
];

const BEACHES = [
  { name: "Playa Punta Popy", distance: "5 min" },
  { name: "Playa Bonita", distance: "10 min" },
  { name: "Playa Las Ballenas", distance: "15 min" },
  { name: "Playa Cosón", distance: "20 min" },
  { name: "Playa Morón", distance: "35 min" },
  { name: "Playa Rincón", distance: "40 min" },
  { name: "Las Galeras", distance: "45 min" },
];

export default function AboutPage() {
  const { t } = useTranslation();
  const areaFacts = t("about.areaFacts", { returnObjects: true });

  useEffect(() => {
    document.title = "About — La Dolce Vita · Las Terrenas";
    const meta = document.querySelector('meta[name="description"]');
    if (meta)
      meta.setAttribute(
        "content",
        "A private residence in Las Terrenas, Samaná. Steps from Playa Bonita, surrounded by Caribbean nature. Learn about the property and the area.",
      );
  }, []);

  return (
    <main className="about-page">
      {/* ── Hero header ── */}
      <header className="about-header">
        <p className="about-eyebrow">{t("about.eyebrow")}</p>
        <h1 className="about-title">
          La <span className="about-title-gold">{t("about.titleAccent")}</span>{" "}
          Vita
        </h1>
        <p className="about-tagline">{t("about.tagline")}</p>
      </header>

      {/* ── Property intro ── */}
      <section className="about-intro">
        <p className="about-body">{t("about.intro1")}</p>
        <p className="about-body">{t("about.intro2")}</p>
        <div className="about-intro-meta">
          <span className="about-meta-address">{t("about.address")}</span>
          <a
            className="about-map-link"
            href="https://www.google.com/maps/place/La+Dolce+Vita+Beachfront+Rental+Apt+2/@19.3228721,-69.5348155,19z/data=!4m9!3m8!1s0x8eaefbedd8f84925:0x4334c14da98a57fc!5m2!4m1!1i2!8m2!3d19.3230496!4d-69.5337566!16s%2Fg%2F11qqk3h2cy?entry=ttu&g_ep=EgoyMDI2MDMwNC4xIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("about.mapsLink")}
          </a>
        </div>
      </section>

      {/* ── Gold divider ── */}
      <div className="about-divider" aria-hidden="true">
        <span className="about-divider-line" />
        <span className="about-divider-diamond" />
        <span className="about-divider-line" />
      </div>

      {/* ── Recognition ── */}
      <section className="about-recognition">
        <p className="about-section-eyebrow">{t("about.recognitionLabel")}</p>
        <div className="about-recognition-row">
          {RECOGNITIONS.map(({ score, outOf, source, award }) => (
            <div className="about-award" key={source}>
              <div className="about-award-score">
                <span className="about-award-number">{score}</span>
                <span className="about-award-outof">{outOf}</span>
              </div>
              <p className="about-award-source">{source}</p>
              <p className="about-award-label">{award}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gold divider ── */}
      <div className="about-divider" aria-hidden="true">
        <span className="about-divider-line" />
        <span className="about-divider-diamond" />
        <span className="about-divider-line" />
      </div>

      {/* ── Beaches ── */}
      <section className="about-beaches">
        <p className="about-section-eyebrow">{t("about.coastLabel")}</p>
        <h2 className="about-section-title">{t("about.nearbyBeachesTitle")}</h2>
        <ul className="about-beach-list">
          {BEACHES.map(({ name, distance }) => (
            <li className="about-beach-row" key={name}>
              <span className="about-beach-distance">{distance}</span>
              <span className="about-beach-rule" />
              <span className="about-beach-name">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Gold divider ── */}
      <div className="about-divider" aria-hidden="true">
        <span className="about-divider-line" />
        <span className="about-divider-diamond" />
        <span className="about-divider-line" />
      </div>

      {/* ── The area ── */}
      <section className="about-area">
        <p className="about-section-eyebrow">{t("about.areaLabel")}</p>
        <h2 className="about-section-title">{t("about.areaTitle")}</h2>
        <ul className="about-area-list">
          {areaFacts.map((fact, i) => (
            <li className="about-area-item" key={i}>
              <span className="about-area-dot" />
              <p className="about-area-fact">{fact}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
