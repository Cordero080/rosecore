import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./ExcursionsPage.css";
import whaleImg from "../../assets/images/excursions/whale-watching.jpg";
import limonImg from "../../assets/images/excursions/el-limon.jpg";
import haitisesImg from "../../assets/images/excursions/los-haitises.jpg";
import rinconImg from "../../assets/images/excursions/rincon-day.jpg";
import snorkelImg from "../../assets/images/excursions/snorkeling.jpg";
import atvImg from "../../assets/images/excursions/atv-jungle.jpg";
import ziplineImg from "../../assets/images/excursions/zipline.jpg";
import kiteImg from "../../assets/images/excursions/kitesurfing.jpg";

const IMAGES = [
  whaleImg,
  limonImg,
  haitisesImg,
  rinconImg,
  snorkelImg,
  atvImg,
  ziplineImg,
  kiteImg,
];

export default function ExcursionsPage() {
  const { t } = useTranslation();
  const excursions = t("excursions.excursions", { returnObjects: true });

  useEffect(() => {
    const prevTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content");

    document.title = "Excursions — La Dolce Vita · Las Terrenas, Samaná";
    meta?.setAttribute(
      "content",
      "Eight excursions from La Dolce Vita — whale watching, El Limón waterfall, Los Haitises, private boat charters, and more. Las Terrenas, Samaná, Dominican Republic.",
    );

    return () => {
      document.title = prevTitle;
      if (meta && prevDesc) meta.setAttribute("content", prevDesc);
    };
  }, []);

  return (
    <main className="excursions-page">
      <header className="excursions-header">
        <p className="excursions-eyebrow">{t("excursions.eyebrow")}</p>
        <h1 className="excursions-title">
          {t("excursions.title")}{" "}
          <span className="excursions-title-gold">
            {t("excursions.titleGold")}
          </span>
        </h1>
        <p className="excursions-subtitle">{t("excursions.subtitle")}</p>
      </header>

      <div className="excursions-divider" aria-hidden="true">
        <span className="excursions-divider-line" />
        <span className="excursions-divider-diamond" />
        <span className="excursions-divider-line" />
      </div>

      <ul className="excursions-list">
        {excursions.map((excursion, i) => (
          <li className="excursion-entry" key={i}>
            <div className="excursion-entry-meta">
              <span className="excursion-entry-id">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="excursion-entry-duration">
                {excursion.duration}
              </span>
              <span className="excursion-entry-season">{excursion.season}</span>
            </div>

            <div className="excursion-entry-body">
              <div className="excursion-image-wrap">
                {IMAGES[i] ? (
                  <img
                    src={IMAGES[i]}
                    alt={excursion.name}
                    className="excursion-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="excursion-image-placeholder">
                    <span className="excursion-image-placeholder-name">
                      {excursion.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="excursion-entry-content">
                <h2 className="excursion-name">{excursion.name}</h2>
                <p className="excursion-body">{excursion.body}</p>
                <ul className="excursion-tags">
                  {excursion.tags.map((tag) => (
                    <li className="excursion-tag" key={tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
