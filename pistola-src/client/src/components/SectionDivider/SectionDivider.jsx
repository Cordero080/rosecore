import './SectionDivider.css'

export default function SectionDivider() {
  return (
    <div className="section-divider" aria-hidden="true">
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Opaque at wave crest, fully transparent well before the SVG bottom edge */}
          <linearGradient id="divider-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f5f7fa" stopOpacity="0.95" />
            <stop offset="40%"  stopColor="#f5f7fa" stopOpacity="0.4"  />
            <stop offset="70%"  stopColor="#f5f7fa" stopOpacity="0"    />
            <stop offset="100%" stopColor="#f5f7fa" stopOpacity="0"    />
          </linearGradient>
        </defs>
        <path
          d="
            M 0 320
            L 0 110
            C 480 10, 960 170, 1440 70
            L 1440 320
            Z
          "
          fill="url(#divider-fade)"
        />
      </svg>
    </div>
  )
}
