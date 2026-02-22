// Quantum Ripple Orb Animation Script
// Moved from index.html
if (!window.qrColorScriptLoaded) {
  window.qrColorScriptLoaded = true;
  const colors = [
    { g1: "#0c2f74ff", g2: "#6b7bff", g3: "#5a8bb3", glow: "#6b7bff" },
    { g1: "#5a8bb3", g2: "#05224eff", g3: "#6b7bff", glow: "#5a8bb3a7" },
    { g1: "#6b7bff", g2: "#22223b", g3: "#5a8bb3", glow: "#22223b" },
    { g1: "#3a86ff", g2: "#0d6788ff", g3: "#b3e6e6", glow: "#3a86ff" },
    { g1: "#5e60ce", g2: "#48bfe3", g3: "#3172dcff", glow: "#0b6884ff" },
    { g1: "#22223b", g2: "#6b7bff", g3: "#5e60ce", glow: "#22223b" },
    { g1: "#075065ff", g2: "#5e60ce", g3: "#6ec6e6", glow: "#5e60ce" },
    { g1: "#6b7bff", g2: "#3a86ff", g3: "#152e8aff", glow: "#3a86ff" },
  ];
  let idx = 0,
    t = 0;
  function lerp(a, b, t) {
    a = a.replace("#", "");
    b = b.replace("#", "");
    let ar = parseInt(a.substring(0, 2), 16),
      ag = parseInt(a.substring(2, 4), 16),
      ab = parseInt(a.substring(4, 6), 16);
    let br = parseInt(b.substring(0, 2), 16),
      bg = parseInt(b.substring(2, 4), 16),
      bb = parseInt(b.substring(4, 6), 16);
    let r = Math.round(ar + (br - ar) * t),
      g = Math.round(ag + (bg - ag) * t),
      b_ = Math.round(ab + (bb - ab) * t);
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b_.toString(16).padStart(2, "0")}`;
  }
  setInterval(() => {
    idx = (idx + 1) % colors.length;
    t = 0;
  }, 3200);
  setInterval(() => {
    t = Math.min(t + 0.04, 1);
    const c1 = lerp(colors[idx].g1, colors[(idx + 1) % colors.length].g1, t);
    const c2 = lerp(colors[idx].g2, colors[(idx + 1) % colors.length].g2, t);
    const c3 = lerp(colors[idx].g3, colors[(idx + 1) % colors.length].g3, t);
    const glow = lerp(
      colors[idx].glow,
      colors[(idx + 1) % colors.length].glow,
      t
    );
    const root = document.documentElement;
    root.style.setProperty("--qr-color1", c1);
    root.style.setProperty("--qr-color2", c2);
    root.style.setProperty("--qr-color3", c3);
    root.style.setProperty("--qr-glow", glow);
  }, 80);
}
