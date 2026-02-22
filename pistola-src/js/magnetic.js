/**
 * magnetic.js
 * Magnetic cursor attraction — interactive elements are pulled toward the cursor
 * when within range, then spring back smoothly when the cursor leaves.
 */

(function () {
  // Only run on desktop (no touch devices)
  if (window.matchMedia("(max-width: 900px)").matches) return;

  const RANGE = 110;       // px — distance at which magnetism starts
  const STRENGTH = 0.38;   // 0–1 — how strongly elements are pulled (higher = more pull)
  const SPRING = 0.18;     // spring-back lerp factor when cursor leaves

  const magneticSelector = [
    ".side-nav-link",
    ".hero-cta",
    ".contact-link",
    ".audio-toggle",
    ".hamburger-btn",
    ".enter-btn",
  ].join(", ");

  // Track per-element state
  const elementStates = new Map();

  function getState(el) {
    if (!elementStates.has(el)) {
      elementStates.set(el, { dx: 0, dy: 0, active: false, raf: null });
    }
    return elementStates.get(el);
  }

  let mouseX = -9999;
  let mouseY = -9999;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateElement(el) {
    const state = getState(el);
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const distX = mouseX - cx;
    const distY = mouseY - cy;
    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist < RANGE) {
      state.active = true;
      // Stronger pull the closer the cursor is
      const pull = (1 - dist / RANGE) * STRENGTH;
      const targetX = distX * pull;
      const targetY = distY * pull;
      state.dx += (targetX - state.dx) * 0.2;
      state.dy += (targetY - state.dy) * 0.2;
    } else {
      state.active = false;
      // Spring back to origin
      state.dx += (0 - state.dx) * SPRING;
      state.dy += (0 - state.dy) * SPRING;
    }

    el.style.transform = `translate(${state.dx.toFixed(2)}px, ${state.dy.toFixed(2)}px)`;

    // Keep animating if still displaced
    if (Math.abs(state.dx) > 0.1 || Math.abs(state.dy) > 0.1 || state.active) {
      state.raf = requestAnimationFrame(() => animateElement(el));
    } else {
      el.style.transform = "";
      state.raf = null;
    }
  }

  function startAnimation(el) {
    const state = getState(el);
    if (!state.raf) {
      state.raf = requestAnimationFrame(() => animateElement(el));
    }
  }

  function attachMagnetic(el) {
    // Store original transition so we can restore it
    const origTransition = el.style.transition;

    el.addEventListener("mouseenter", () => {
      // Suppress other transforms during magnetic phase
      el.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
      startAnimation(el);
    });

    el.addEventListener("mouseleave", () => {
      el.style.transition = origTransition;
      startAnimation(el); // spring back
    });
  }

  // Attach on DOM ready, and re-scan for late-added elements
  function init() {
    document.querySelectorAll(magneticSelector).forEach(attachMagnetic);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
