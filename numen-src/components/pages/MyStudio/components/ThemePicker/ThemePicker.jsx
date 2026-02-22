// ThemePicker.jsx - MySpace theme selection
import './ThemePicker.scss';

// Import wallpapers
import bipolarInvert from '@assets/wallpapers/Bipolar-invert.webp';
import bipolarPink from '@assets/wallpapers/Bipolar-pink.webp';
import bipolarTeal from '@assets/wallpapers/Bipolar-teal.webp';
import triad from '@assets/wallpapers/triad.webp';
import triad2 from '@assets/wallpapers/triad-2.webp';
import triad3 from '@assets/wallpapers/triad-3.webp';
import triad31 from '@assets/wallpapers/triad-3-1.webp';

import peacockWarp from '@assets/wallpapers/PEACOCK-warp.webp';
import triasPattern from '@assets/wallpapers/trias-pattern.webp';
import colorsVertical from '@assets/wallpapers/colors-vertical.webp';

const THEME_OPTIONS = [
  { id: 'classic', name: 'Classic', preview: '#003366' },
  { id: 'emo', name: 'Emo', preview: '#1a0a0a' },
  { id: 'scene', name: 'Scene', preview: '#ff69b4' },
  { id: 'starry', name: 'Starry', preview: '#0a0a2e' },
  { id: 'glitter', name: 'Glitter', preview: '#2a1a00' },
];

const WALLPAPER_OPTIONS = [
  { id: 'none', name: 'none', src: null },
  // Image wallpapers
  { id: 'invert', name: 'invert', src: bipolarInvert },
  { id: 'pink', name: 'pink', src: bipolarPink },
  { id: 'teal', name: 'teal', src: bipolarTeal },
  { id: 'triad', name: 'triad', src: triad },
  { id: 'triad2', name: 'triad 2', src: triad2 },
  { id: 'triad3', name: 'triad 3', src: triad3 },
  { id: 'triad31', name: 'triad 3-1', src: triad31 },
  { id: 'triasPattern', name: 'trias pattern', src: triasPattern },
  { id: 'peacockWarp', name: 'peacock warp', src: peacockWarp },
  { id: 'colorsVertical', name: 'colors vertical', src: colorsVertical },
  // CSS gradient wallpapers
  { id: 'cyberpunk', name: 'cyberpunk', css: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'neonCity', name: 'neon city', css: 'linear-gradient(180deg, #0a0015 0%, #1a0030 30%, #ff00ff20 70%, #00ffff10 100%)' },
  { id: 'vaporwave', name: 'vaporwave', css: 'linear-gradient(180deg, #ff71ce 0%, #01cdfe 25%, #05ffa1 50%, #b967ff 75%, #fffb96 100%)' },
  { id: 'matrix', name: 'matrix', css: 'linear-gradient(180deg, #000000 0%, #003300 50%, #00ff00 100%)' },
  { id: 'sunset', name: 'sunset', css: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 20%, #16213e 40%, #e94560 70%, #ff6b6b 100%)' },
  { id: 'aurora', name: 'aurora', css: 'linear-gradient(135deg, #000428 0%, #004e92 25%, #00d4ff 50%, #7b2ff7 75%, #f107a3 100%)' },
  { id: 'deepSpace', name: 'deep space', css: 'radial-gradient(ellipse at bottom, #1b2838 0%, #090a0f 100%)' },
  { id: 'hologram', name: 'hologram', css: 'linear-gradient(45deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)' },
  { id: 'midnight', name: 'midnight', css: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)' },
  { id: 'bloodMoon', name: 'blood moon', css: 'radial-gradient(circle at 30% 30%, #4a0000 0%, #1a0000 50%, #0a0000 100%)' },
  { id: 'electric', name: 'electric', css: 'linear-gradient(135deg, #000000 0%, #1a0a30 25%, #0a1a30 50%, #00ffff30 100%)' },
  { id: 'fire', name: 'fire', css: 'linear-gradient(180deg, #000000 0%, #1a0a00 30%, #ff4500 70%, #ff8c00 100%)' },
  { id: 'cosmic', name: 'cosmic', css: 'radial-gradient(ellipse at center, #1a0030 0%, #0d001a 50%, #000000 100%)' },
  { id: 'glitch', name: 'glitch', css: 'repeating-linear-gradient(90deg, #ff00ff10 0px, #ff00ff10 2px, transparent 2px, transparent 4px), linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)' },
  { id: 'grid', name: 'tron grid', css: 'repeating-linear-gradient(0deg, transparent 0px, transparent 49px, #00ffff20 49px, #00ffff20 50px), repeating-linear-gradient(90deg, transparent 0px, transparent 49px, #00ffff20 49px, #00ffff20 50px), linear-gradient(180deg, #000000 0%, #0a0a1a 100%)' },
  // Animated wallpapers (CSS class-based)
  { id: 'floatingOrbs', name: '✨ orbs', css: 'linear-gradient(135deg, #0a0015 0%, #1a0030 100%)', animated: 'floating-orbs' },
  { id: 'starfield', name: '✨ starfield', css: 'radial-gradient(ellipse at bottom, #0d1b2a 0%, #000000 100%)', animated: 'starfield' },
  { id: 'bubbles', name: '✨ bubbles', css: 'linear-gradient(180deg, #000428 0%, #004e92 100%)', animated: 'bubbles' },
  { id: 'fireflies', name: '✨ fireflies', css: 'linear-gradient(180deg, #0a0a0a 0%, #1a2a1a 50%, #0a0a0a 100%)', animated: 'fireflies' },
  { id: 'neonRain', name: '✨ neon rain', css: 'linear-gradient(180deg, #0a0015 0%, #000000 100%)', animated: 'neon-rain' },
];

function ThemePicker({ currentTheme, currentWallpaper, onUpdateField, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="theme-section">
      <h2 className="section-title">theme</h2>
      <div className="theme-picker">
        {THEME_OPTIONS.map(({ id, name, preview }) => (
          <button
            key={id}
            className={`theme-option ${currentTheme === id ? 'selected' : ''}`}
            onClick={() => onUpdateField('theme', id)}
            style={{ '--preview-color': preview }}
          >
            <span className="theme-preview" />
            <span className="theme-name">{name}</span>
          </button>
        ))}
      </div>

      <h2 className="section-title">wallpaper</h2>
      <div className="wallpaper-picker">
        {WALLPAPER_OPTIONS.map(({ id, name, src, css }) => (
          <button
            key={id}
            className={`wallpaper-option ${currentWallpaper === id ? 'selected' : ''}`}
            onClick={() => onUpdateField('wallpaper', id)}
          >
            <span 
              className="wallpaper-preview"
              style={src ? { backgroundImage: `url(${src})` } : css ? { background: css } : {}}
            />
            <span className="wallpaper-name">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemePicker;
