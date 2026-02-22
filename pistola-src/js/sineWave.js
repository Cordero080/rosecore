function SineWaveGenerator(options) {
  Object.assign(this, options || {});

  if (!this.el) throw "No Canvas Selected";
  this.ctx = this.el.getContext("2d");
  if (!this.waves.length) throw "No waves specified";

  this.direction = -1; // 👈 control wave direction here

  this._resizeWidth();
  window.addEventListener("resize", this._resizeWidth.bind(this));

  this.resizeEvent();
  window.addEventListener("resize", this.resizeEvent.bind(this));

  if (typeof this.initialize === "function") {
    this.initialize.call(this);
  }

  // Initialize to center in screen coordinates (touch/mouse events use screen coords)
  this.mouseX = window.innerWidth / 2;
  this.mouseY = window.innerHeight / 2;
  this.smoothMouseX = this.mouseX;
  this.smoothMouseY = this.mouseY;

  // Per-wave smooth mouse tracking for delayed responses
  this.waveMouseX = this.waves.map(() => this.mouseX);
  this.waveMouseY = this.waves.map(() => this.mouseY);

  // Start the animation loop AFTER mouse tracking is initialized
  this.loop();

 window.addEventListener("mousemove", (e) => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  });

  // Touch support for mobile
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) {
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener("touchend", () => {
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
  }, { passive: true });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      this.direction *= -1;
    }
  });
  // Mobile scroll performance - reduce animation during scroll
  this.isScrolling = false;
  this.scrollTimeout = null;
  this.isMobile = window.innerWidth <= 768;

  if (this.isMobile) {
    window.addEventListener(
      "scroll",
      () => {
        this.isScrolling = true;
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
          this.isScrolling = false;
        }, 80);
      },
      { passive: true },
    );
  }

  // Spacebar prompt on scroll
  let promptShown = false;
  window.addEventListener(
    "wheel",
    () => {
      if (!promptShown) {
        promptShown = true;
        const prompt = document.getElementById("spacebarPrompt");
        if (prompt) {
          prompt.classList.add("pulse");
          prompt.addEventListener(
            "animationend",
            () => {
              prompt.classList.remove("pulse");
            },
            { once: true },
          );
        }
      }
    },
    { once: true },
  );
}

// Defaults
SineWaveGenerator.prototype.speed = 10;
SineWaveGenerator.prototype.amplitude = 20;
SineWaveGenerator.prototype.wavelength = 50;
SineWaveGenerator.prototype.segmentLength = 10;
SineWaveGenerator.prototype.lineWidth = 2;
SineWaveGenerator.prototype.strokeStyle = "rgba(255, 255, 255, 0.2)";
SineWaveGenerator.prototype.resizeEvent = function () {};

// Fill the screen
SineWaveGenerator.prototype._resizeWidth = function () {
  this.dpr = window.devicePixelRatio || 1;
  this.width = this.el.width = window.innerWidth * this.dpr;
  this.height = this.el.height = window.innerHeight * this.dpr;
  this.el.style.width = window.innerWidth + "px";
  this.el.style.height = window.innerHeight + "px";
  this.waveWidth = this.width * 0.95;
  this.waveLeft = this.width * 0.025;
};

SineWaveGenerator.prototype.clear = function () {
  this.ctx.clearRect(0, 0, this.width, this.height);
};

SineWaveGenerator.prototype.time = 0;

SineWaveGenerator.prototype.update = function (time) {
  const now = performance.now();
  const dt = Math.min((now - (this._lastFrame || now)) / 16.667, 3);
  this._lastFrame = now;
  this.time += 0.007 * this.direction; // 👈 dynamic direction

  // Page-aware reactivity: home page is more reactive
  this.isHomePage = window.location.pathname.includes("home");
  const smoothing = this.isHomePage ? 0.15 : 0.1; // home more snappy
  this.smoothMouseX += (this.mouseX - this.smoothMouseX) * smoothing;
  this.smoothMouseY += (this.mouseY - this.smoothMouseY) * smoothing;

  // Update per-wave mouse tracking with individual delays
  for (let i = 0; i < this.waves.length; i++) {
    const wave = this.waves[i];
    const waveDelay = wave.attractionDelay ?? 0.15;
    const frameAdjusted = 1 - Math.pow(1 - waveDelay, dt);
    this.waveMouseX[i] += (this.mouseX - this.waveMouseX[i]) * frameAdjusted;
    this.waveMouseY[i] += (this.mouseY - this.waveMouseY[i]) * frameAdjusted;
  }

  if (typeof time === "undefined") {
    time = this.time;
  }

  for (let i = 0; i < this.waves.length; i++) {
    const wave = this.waves[i];
    const modifier = wave.timeModifier || 1;
    this.drawSine(time * modifier, wave, i);
  }
};

// Math constants
const PI2 = Math.PI * 2;
const HALFPI = Math.PI / 2;

SineWaveGenerator.prototype.ease = function (percent, amplitude) {
  return amplitude * (Math.sin(percent * PI2 - HALFPI) + 1) * 0.7;
};

SineWaveGenerator.prototype.drawSine = function (time, options, waveIndex) {
  const {
    amplitude = this.amplitude,
    wavelength = this.wavelength,
    lineWidth = this.lineWidth,
    strokeStyle = this.strokeStyle,
    segmentLength = this.segmentLength,
    // Per-wave attraction properties
    attraction = 1, // 1 = normal pull toward cursor, -1 = repel, 0 = no effect
    attractionStrength = 1, // multiplier for how strong the attraction is
    attractionRadius = 350, // how far the influence reaches
  } = options;

  const ctx = this.ctx;
  ctx.beginPath();
  ctx.lineWidth = lineWidth * this.dpr;
  ctx.strokeStyle = strokeStyle;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const yAxis = this.height / 2;

  ctx.moveTo(0, yAxis);
  ctx.lineTo(this.waveLeft, yAxis);

  // Build points array first for smooth curve rendering
  const points = [];
  for (let i = 0; i < this.waveWidth; i += segmentLength) {
    const segmentX = i + this.waveLeft;
    const waveX = time * this.speed + (-yAxis + i) / wavelength;
    const waveY = Math.sin(waveX);
    const easedAmp = this.ease(i / this.waveWidth, amplitude);

    // Use per-wave delayed mouse position for ribboning effect
    const cursorX = this.waveMouseX[waveIndex] ?? this.width / 2 / this.dpr;
    const cursorY = this.waveMouseY[waveIndex] ?? this.height / 2 / this.dpr;
    const dpr = this.dpr ?? 1;

    if (isNaN(segmentX) || isNaN(waveY) || isNaN(easedAmp)) continue;

    const distanceToMouse = Math.abs(segmentX / dpr - cursorX);
    const distanceLimit = this.isHomePage
      ? attractionRadius
      : attractionRadius * 1.15;
    const pullPower = this.isHomePage ? 2 : 2.5;
    const pullStrength = Math.pow(
      Math.max(0, 1 - distanceToMouse / distanceLimit),
      pullPower,
    );

    const centerBias = 1 - Math.abs(i / this.waveWidth - 0.5) * 2;
    const influence = pullStrength * centerBias;

    const pullMultiplier = this.isHomePage ? 1.0 : 0.85;
    // Apply per-wave attraction (positive = toward cursor, negative = away)
    const mousePull =
      (cursorY - yAxis / dpr) *
      influence *
      pullMultiplier *
      dpr *
      attraction *
      attractionStrength;

    const finalY = easedAmp * waveY + yAxis + mousePull;

    if (!isNaN(finalY)) {
      points.push({ x: segmentX, y: finalY });
    }
  }

  // Draw smooth curve through points using quadratic bezier
  if (points.length > 1) {
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xMid = (points[i].x + points[i + 1].x) / 2;
      const yMid = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xMid, yMid);
    }
    // Connect to last point
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  ctx.lineTo(this.width, yAxis);
  ctx.stroke();
};

SineWaveGenerator.prototype.loop = function () {
  // Skip rendering during mobile scroll for performance
  if (this.isMobile && this.isScrolling) {
    requestAnimationFrame(this.loop.bind(this));
    return;
  }

  this.clear();
  this.update();
  requestAnimationFrame(this.loop.bind(this));
};

window.waveGen = new SineWaveGenerator({
  el: document.getElementById("waves"),
  speed: 0.6, // slowed down for a calmer vibe
  waves: [
    // Wave 1: Heavy leader - very slow due to mass
    {
      timeModifier: 1,
      lineWidth: 22.5,
      amplitude: 150,
      wavelength: 300,
      segmentLength: 20,
      attraction: 1,
      attractionStrength: 0.12,
      attractionDelay: 0.004, // extremely slow - massive, barely reacts
      attractionRadius: 280,
    },
    // Wave 2: Light ribbon - quick to respond
    {
      timeModifier: 1,
      lineWidth: 1,
      amplitude: 150,
      wavelength: 100,
      attraction: 1,
      attractionStrength: 0.8,
      attractionDelay: 0.12, // faster - light
      attractionRadius: 400,
    },
    // Wave 3: Snappy thin line
    {
      timeModifier: 1,
      lineWidth: 0.5,
      amplitude: 120,
      wavelength: 150,
      segmentLength: 10,
      attraction: 1,
      attractionStrength: 0.7,
      attractionDelay: 0.18, // snappy - very light
      attractionRadius: 350,
    },
    // Wave 4: Medium ribbon
    {
      timeModifier: 1,
      lineWidth: 1.3,
      amplitude: 100,
      wavelength: 100,
      segmentLength: 10,
      attraction: 1,
      attractionStrength: 0.6,
      attractionDelay: 0.09, // medium-fast
      attractionRadius: 380,
    },
    // Wave 5: Ghostly trail - light but subtle
    {
      timeModifier: 1,
      lineWidth: 0.3,
      amplitude: 50,
      wavelength: 80,
      segmentLength: 20,
      attraction: 1,
      attractionStrength: 0.5,
      attractionDelay: 0.06, // lighter than thick wave
      attractionRadius: 300,
    },
  ],
  resizeEvent: function () {
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0, "pink");
    gradient.addColorStop(0.2, "magenta");
    gradient.addColorStop(0.5, "blue");
    gradient.addColorStop(1, "turquoise");

    this.waves.forEach((w) => (w.strokeStyle = gradient));
  },
});

// This file has moved to js/sineWave.js
// Please update your HTML <script> tag to:
// <script src="js/sineWave.js"></script>

// Add a fourth card beneath the three, styled as requested
const container = document.querySelector(".container");
if (container) {
  const moreCard = document.createElement("div");
  moreCard.className = "card more-card";
  moreCard.innerHTML = '<span class="glitch" data-text="more">more</span>';
  container.appendChild(moreCard);
} // how to add more words to the more card
//
