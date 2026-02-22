/**
 * Media Icons
 * Images, expand, maximize, minimize
 */

/** Image/Photo - used for Media upload */
export const ImageIcon = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

/** Expand arrows - used for Fullscreen/Lightbox */
export const ExpandIcon = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    {...props}
  >
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
  </svg>
);

/** Maximize/Enter fullscreen */
export const MaximizeIcon = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    {...props}
  >
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

/** Camera Lens - used for Photo upload on avatars */
export const CameraLensIcon = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    {...props}
  >
    {/* Dark border ring */}
    <circle cx="12" cy="12" r="11" fill="none" stroke="#3c30a1ee" strokeWidth="2.5"/>
    {/* Blue lens base */}
    <circle cx="12" cy="12" r="8" fill="#0b4a9d"/>
    {/* Inner blue */}
    <circle cx="12" cy="12" r="5.5" fill="#0e5bb3"/>
    {/* Center - lighter depth */}
    <circle cx="12" cy="12" r="2.5" fill="#1e74dd"/>
    {/* Dark glass overlay */}
    <circle cx="12" cy="12" r="11" fill="rgba(83, 82, 128, 0.53)"/>
    {/* Lens reflection */}
    <ellipse cx="9" cy="8" rx="3" ry="2" fill="rgba(150, 255, 131, 0.67)" transform="rotate(-30 9 8)"/>
  </svg>
);

/** Minimize/Exit fullscreen */
export const MinimizeIcon = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    {...props}
  >
    <polyline points="4 14 10 14 10 20"/>
    <polyline points="20 10 14 10 14 4"/>
    <line x1="14" y1="10" x2="21" y2="3"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
