import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./AvailabilityCalendar.css";

const ICAL_URL = import.meta.env.DEV
  ? "http://localhost:3001/api/ical"
  : "/api/ical";

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AvailabilityCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [blockedSet, setBlockedSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const DAYS = t("calendar.days", { returnObjects: true });
  const MONTHS = t("calendar.months", { returnObjects: true });

  useEffect(() => {
    fetch(ICAL_URL)
      .then((r) => r.json())
      .then((data) => setBlockedSet(new Set(data.blockedDates)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal-wrapper">
      <div className="cal-container">
        <div className="cal-grain" />

        <div className="cal-header">
          <button
            className="cal-nav"
            onClick={prevMonth}
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="cal-month-label">
            {MONTHS[month]} {year}
          </span>
          <button
            className="cal-nav"
            onClick={nextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="cal-day-headers">
          {DAYS.map((d) => (
            <span key={d} className="cal-day-name">
              {d}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="cal-loading">{t("calendar.loading")}</div>
        ) : (
          <div className="cal-grid">
            {cells.map((day, i) => {
              if (!day)
                return (
                  <span
                    key={`empty-${i}`}
                    className="cal-cell cal-cell--empty"
                  />
                );

              const key = toKey(year, month, day);
              const isBlocked = blockedSet.has(key);
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              return (
                <span
                  key={key}
                  className={[
                    "cal-cell",
                    isBlocked ? "cal-cell--blocked" : "cal-cell--available",
                    isToday ? "cal-cell--today" : "",
                  ].join(" ")}
                  title={
                    isBlocked ? t("calendar.booked") : t("calendar.available")
                  }
                >
                  {day}
                </span>
              );
            })}
          </div>
        )}

        <div className="cal-legend">
          <span className="cal-legend-item">
            <span className="cal-legend-dot cal-legend-dot--available" />
            {t("calendar.available")}
          </span>
          <span className="cal-legend-item">
            <span className="cal-legend-dot cal-legend-dot--blocked" />
            {t("calendar.booked")}
          </span>
        </div>
      </div>
    </div>
  );
}
