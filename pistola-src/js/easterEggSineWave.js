// Easter Egg Sinewave - Complementary color version
// This creates the alternate wave colors for comp mode

function initEasterEggColors() {
  if (!window.waveGen || !window.waveGen.ctx) return;

  const gradient = window.waveGen.ctx.createLinearGradient(
    0,
    0,
    window.waveGen.width,
    0,
  );
  gradient.addColorStop(0, "#00ff7f"); // Complement of pink
  gradient.addColorStop(0.2, "#00ff80"); // Complement of magenta
  gradient.addColorStop(0.5, "#ffaa00"); // Complement of blue
  gradient.addColorStop(1, "#ff4500"); // Complement of turquoise

  window.waveGen.waves.forEach((w) => (w.strokeStyle = gradient));
}

function resetMainColors() {
  if (!window.waveGen || !window.waveGen.ctx) return;

  const gradient = window.waveGen.ctx.createLinearGradient(
    0,
    0,
    window.waveGen.width,
    0,
  );
  gradient.addColorStop(0, "pink");
  gradient.addColorStop(0.2, "magenta");
  gradient.addColorStop(0.5, "blue");
  gradient.addColorStop(1, "turquoise");

  window.waveGen.waves.forEach((w) => (w.strokeStyle = gradient));
}

// Export for use in comp mode toggle
window.initEasterEggColors = initEasterEggColors;
window.resetMainColors = resetMainColors;
