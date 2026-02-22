// Minimal parallax for geometric overlay
// (home page sets window.homeParallaxActive to take over this transform)
function updateMinimalParallaxOverlay() {
  if (window.homeParallaxActive) return;
  const overlay = document.querySelector(".parallax-bg-overlay");
  if (!overlay) return;
  const scrollY = window.scrollY;
  overlay.style.transform = `translateY(${scrollY * 0.25}px)`;
}
window.addEventListener("scroll", updateMinimalParallaxOverlay);
document.addEventListener("DOMContentLoaded", updateMinimalParallaxOverlay);

// Bento cards - no tilt, just subtle hue shift on scroll
const bentoCards = document.querySelectorAll(".bento-card");

function updateBentoCards() {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const rawProgress = Math.min(scrollY / maxScroll, 1);
  const cardHue = rawProgress * 180; // Subtle hue shift

  bentoCards.forEach((card) => {
    card.style.filter = `hue-rotate(${cardHue}deg)`;
  });

  // Sinewave hue shift
  const sineWaveCanvas = document.getElementById("waves");
  if (sineWaveCanvas) {
    sineWaveCanvas.style.filter = `hue-rotate(${cardHue}deg)`;
  }
}

window.addEventListener("scroll", updateBentoCards);
document.addEventListener("DOMContentLoaded", updateBentoCards);

document.addEventListener("keydown", (e) => {
  if (e.key === "r" && window.waveGen) {
    waveGen.direction *= -1; // Reverse animation direction
  }
});

// Complementary Color Effect for PABLOPISTOLA hover

document.addEventListener("DOMContentLoaded", function () {
  // Ensure toggleComplementaryColors is accessible FIRST
  window.toggleComplementaryColors =
    window.toggleComplementaryColors ||
    function () {
      if (typeof window.isComplementaryMode === "undefined") {
        window.isComplementaryMode = false;
      }
      window.isComplementaryMode = !window.isComplementaryMode;
      if (window.isComplementaryMode) {
        document.body.classList.add("complementary-colors");
        // Use easter egg colors from easterEggSineWave.js
        if (window.initEasterEggColors) window.initEasterEggColors();
        if (window.startFeatherEffect) window.startFeatherEffect();
      } else {
        document.body.classList.remove("complementary-colors");
        // Reset to main colors from easterEggSineWave.js
        if (window.resetMainColors) window.resetMainColors();
        if (window.stopFeatherEffect) window.stopFeatherEffect();
      }
    };

  // Hero title click to toggle comp mode
  const heroTitle = document.getElementById("heroTitle");
  if (heroTitle) {
    heroTitle.style.cursor = "pointer";
    heroTitle.addEventListener("click", () => {
      if (typeof window.toggleComplementaryColors === "function") {
        window.toggleComplementaryColors();
        console.log("Comp mode toggled via hero title");
      }
    });
  }

  const myNameElement = document.getElementById("myName");
  if (!myNameElement) return;

  let scrambleInterval = null;
  let scrambleTimeout = null;
  const originalText = myNameElement.textContent;
  const nameLetters = originalText.split("");

  // Upside down unicode map for basic Latin letters
  const upsideDownMap = {};

  // Horizontally reflected unicode map for basic Latin letters
  const horizontalReflectMap = {
    A: "∀",
    B: "𐐒",
    C: "Ↄ",
    D: "◖",
    E: "Ǝ",
    F: "Ⅎ",
    G: "⅁",
    H: "h",
    I: "I",
    J: "ſ",
    K: "⋊",
    L: "⅃",
    M: "W",
    N: "И",
    O: "O",
    P: "Ԁ",
    Q: "Ò",
    R: "Я",
    S: "S",
    T: "⊥",
    U: "∩",
    V: "Λ",
    W: "m",
    X: "X",
    Y: "⅄",
    Z: "Z",
    a: "ɐ",
    b: "q",
    c: "ɔ",
    d: "p",
    e: "ǝ",
    f: "ɟ",
    g: "ƃ",
    h: "ɥ",
    i: "ı",
    j: "ɾ",
    k: "ʞ",
    l: "ʃ",
    m: "ɯ",
    n: "u",
    o: "o",
    p: "d",
    q: "b",
    r: "ɹ",
    s: "s",
    t: "ʇ",
    u: "n",
    v: "ʌ",
    w: "ʍ",
    x: "x",
    y: "ʎ",
    z: "z",
  };

  function scrambleName() {
    // Scramble using digits from pi and Fibonacci sequence
    // Animate Fibonacci sequence up to 13th digit, then back, replacing name letters
    // Pi digits up to the 23rd digit
    const piDigits = "3141592653589793238462643".split("");
    // Create the full sequence: up to 23rd, then back down
    let piUp = piDigits;
    let piDown = piDigits.slice(0, -1).reverse();
    // Map for horizontal reflection of digits
    const reflectMap = {
      0: "0",
      1: "Ɩ",
      2: "ᄅ",
      3: "Ɛ",
      6: "9",
      7: "ㄥ",
      8: "8",
      9: "6",
    };
    // Map for vertical flipping (upside down) of digits
    const upsideDownMap = {
      0: "0",
      1: "⇂",
      3: "Ɛ",
      6: "9",
      7: "ㄥ",
      8: "8",
      9: "6",
    };
    // Animation state
    if (!window.piAnimIndex) window.piAnimIndex = 0;
    let display = [];
    let piSeq, isDown;
    if (window.piAnimIndex < piUp.length) {
      piSeq = piUp;
      isDown = false;
    } else {
      piSeq = piDown;
      isDown = true;
    }
    for (let i = 0; i < nameLetters.length; i++) {
      let idx = (window.piAnimIndex + i) % piSeq.length;
      let num = piSeq[idx % piSeq.length];
      if (isDown) {
        // Flip vertically (upside down) instead of horizontal
        num = num
          .split("")
          .map((d) => upsideDownMap[d] || d)
          .join("");
      }
      display.push(num);
    }
    myNameElement.textContent = display.join(" ");
    window.piAnimIndex =
      (window.piAnimIndex + 1) % (piUp.length + piDown.length);
  }

  myNameElement.addEventListener("mouseenter", () => {
    window.piAnimIndex = 0;
    scrambleInterval = setInterval(scrambleName, 100);
    // Scramble animation is independent, does NOT toggle comp mode
  });

  myNameElement.addEventListener("mouseleave", () => {
    if (scrambleInterval) {
      clearInterval(scrambleInterval);
      scrambleInterval = null;
    }
    if (scrambleTimeout) {
      clearTimeout(scrambleTimeout);
      scrambleTimeout = null;
    }
    myNameElement.textContent = originalText;
  });
});

function updateWaveColors(isComplementary) {
  if (window.waveGen && window.waveGen.ctx) {
    const gradient = window.waveGen.ctx.createLinearGradient(
      0,
      0,
      window.waveGen.width,
      0,
    );

    if (isComplementary) {
      // Complementary colors
      gradient.addColorStop(0, "#00ff7f"); // Complement of pink
      gradient.addColorStop(0.2, "#00ff80"); // Complement of magenta
      gradient.addColorStop(0.5, "#ffaa00"); // Complement of blue
      gradient.addColorStop(1, "#ff4500"); // Complement of turquoise
    } else {
      // Original colors
      gradient.addColorStop(0, "pink");
      gradient.addColorStop(0.2, "magenta");
      gradient.addColorStop(0.5, "blue");
      gradient.addColorStop(1, "turquoise");
    }

    window.waveGen.waves.forEach((w) => (w.strokeStyle = gradient));
  }
}

function setEtherealWaveComplexity(isEthereal) {
  if (window.waveGen) {
    if (isEthereal) {
      window.waveGen.speed = 0.7; // Slow, fabric-like
      window.waveGen.waves = [
        {
          timeModifier: 1,
          lineWidth: 5.4,
          amplitude: 264,
          wavelength: 480,
          segmentLength: 16,
        },
        {
          timeModifier: 0.8,
          lineWidth: 3,
          amplitude: 244,
          wavelength: 220,
          segmentLength: 12,
        },
        {
          timeModifier: 1.5,
          lineWidth: 2,
          amplitude: 96,
          wavelength: 80,
          segmentLength: 6,
        },
        {
          timeModifier: 2.3,
          lineWidth: 1,
          amplitude: 48,
          wavelength: 40,
          segmentLength: 3,
        },
        {
          timeModifier: 0.6,
          lineWidth: 0.7,
          amplitude: 36,
          wavelength: 720,
          segmentLength: 24,
        },
      ];
      window.waveGen.resizeEvent();
    } else {
      window.waveGen.speed = 4;
      window.waveGen.waves = [
        {
          timeModifier: 1,
          lineWidth: 3,
          amplitude: 150,
          wavelength: 200,
          segmentLength: 20,
        },
        { timeModifier: 1, lineWidth: 2, amplitude: 150, wavelength: 100 },
        {
          timeModifier: 1,
          lineWidth: 1,
          amplitude: -150,
          wavelength: 50,
          segmentLength: 10,
        },
        {
          timeModifier: 1,
          lineWidth: 0.5,
          amplitude: -100,
          wavelength: 100,
          segmentLength: 10,
        },
        {
          timeModifier: 1,
          lineWidth: 0.5,
          amplitude: -50,
          wavelength: 50,
          segmentLength: 20,
        },
      ];
      window.waveGen.resizeEvent();
    }
  }
}

const audio = document.getElementById("site-audio");
const audioToggle = document.getElementById("audio-toggle");

if (audio) {
  audio.volume = 0.3;
}

// Autoplay on first user interaction (browsers block autoplay without it)
let audioStarted = false;
function tryAutoplay() {
  if (audioStarted || !audio) return;
  audioStarted = true;
  audio.play().then(() => {
    // Successfully playing — update button state to show "playing"
    if (audioToggle) {
      audioToggle.classList.remove("muted");
      audioToggle.setAttribute("aria-label", "Pause music");
    }
  }).catch(() => {
    // Autoplay blocked — stay muted, user can click button manually
    audioStarted = false;
  });
  // Remove listeners after first successful attempt
  ["click", "keydown", "mousemove"].forEach((evt) =>
    document.removeEventListener(evt, tryAutoplay)
  );
}
["click", "keydown", "mousemove"].forEach((evt) =>
  document.addEventListener(evt, tryAutoplay, { once: false, passive: true })
);

// Manual toggle — play/pause
if (audio && audioToggle) {
  audioToggle.addEventListener("click", (e) => {
    e.stopPropagation(); // don't trigger tryAutoplay as well
    if (audio.paused) {
      audio.play().then(() => {
        audioStarted = true;
        audioToggle.classList.remove("muted");
        audioToggle.setAttribute("aria-label", "Pause music");
      }).catch(() => {});
    } else {
      audio.pause();
      audioToggle.classList.add("muted");
      audioToggle.setAttribute("aria-label", "Play music");
    }
  });
}

let cursorY = window.innerHeight / 2;
let cursorX = window.innerWidth / 2;
window.addEventListener("mousemove", function (e) {
  cursorX = e.clientX;
  cursorY = e.clientY;
});
// Patch sinewave animation to attract to cursor in both X and Y
if (window.waveGen) {
  const originalDraw = window.waveGen.draw;
  window.waveGen.draw = function () {
    const canvas = document.getElementById("waves");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    window.waveGen.waves.forEach((wave, i) => {
      // Track both X and Y offset for each wave
      if (!wave._offsetY) wave._offsetY = canvas.height / 2;
      if (!wave._offsetX) wave._offsetX = canvas.width / 2;
      // Calculate distance from wave to cursor
      let distY = Math.abs(wave._offsetY - cursorY);
      let distX = Math.abs(wave._offsetX - cursorX);
      // Pull strength decreases as distance increases
      let strengthY = Math.max(0.04, 0.18 - (distY / canvas.height) * 0.16);
      let strengthX = Math.max(0.04, 0.18 - (distX / canvas.width) * 0.16);
      wave._offsetY += (cursorY - wave._offsetY) * strengthY;
      wave._offsetX += (cursorX - wave._offsetX) * strengthX;
      wave.offsetY = wave._offsetY;
      wave.offsetX = wave._offsetX;
    });
    if (originalDraw) originalDraw.call(window.waveGen);
  };
}

// Custom Cursor System
document.addEventListener("DOMContentLoaded", function () {
  console.log("Creating custom cursor system...");

  // Create cursor elements
  const cursorMain = document.createElement("div");
  cursorMain.className = "cursor-main";
  cursorMain.style.display = "block";

  const cursorFollow = document.createElement("div");
  cursorFollow.className = "cursor-follow";
  cursorFollow.style.display = "block";

  const cursorGlow = document.createElement("div");
  cursorGlow.className = "cursor-glow";
  cursorGlow.style.display = "block";

  document.body.appendChild(cursorMain);
  document.body.appendChild(cursorFollow);
  document.body.appendChild(cursorGlow);

  console.log("Cursor elements created:", cursorMain, cursorFollow, cursorGlow);

  let mouseX = window.innerWidth / 2,
    mouseY = window.innerHeight / 2;
  let followerX = mouseX,
    followerY = mouseY;
  let glowX = mouseX,
    glowY = mouseY;
  let particleTimer = 0;

  // Velocity tracking
  let prevMouseX = mouseX, prevMouseY = mouseY;
  let velX = 0, velY = 0;
  let speed = 0;

  // Initial positioning
  cursorMain.style.left = mouseX - 10 + "px";
  cursorMain.style.top = mouseY - 10 + "px";
  cursorFollow.style.left = mouseX - 4 + "px";
  cursorFollow.style.top = mouseY - 4 + "px";

  // Update cursor position
  document.addEventListener("mousemove", function (e) {
    velX = e.clientX - mouseX;
    velY = e.clientY - mouseY;
    speed = Math.sqrt(velX * velX + velY * velY);

    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorMain.style.left = mouseX - 10 + "px";
    cursorMain.style.top = mouseY - 10 + "px";

    // Velocity-based particle spawning — more particles when moving fast
    particleTimer++;
    const spawnRate = speed > 20 ? 4 : speed > 8 ? 8 : 15;
    if (particleTimer % spawnRate === 0) {
      createParticle(mouseX, mouseY, velX, velY, speed);
    }
  });

  // Smooth follow animation
  function animateFollower() {
    const speed = 0.15;

    followerX += (mouseX - followerX) * speed;
    followerY += (mouseY - followerY) * speed;

    cursorFollow.style.left = followerX - 4 + "px";
    cursorFollow.style.top = followerY - 4 + "px";

    // Glow follows even slower
    const glowSpeed = 0.08;
    glowX += (mouseX - glowX) * glowSpeed;
    glowY += (mouseY - glowY) * glowSpeed;

    cursorGlow.style.left = glowX - 50 + "px";
    cursorGlow.style.top = glowY - 50 + "px";

    requestAnimationFrame(animateFollower);
  }

  animateFollower();

  // Hover effects on interactive elements
  const interactiveElements =
    'a, button, .card, .nav-links a, #myName, [role="button"], input, textarea';

  document.addEventListener("mouseover", function (e) {
    if (e.target.matches(interactiveElements)) {
      cursorMain.classList.add("hover");
      cursorGlow.classList.add("active");
    }
  });

  document.addEventListener("mouseout", function (e) {
    if (e.target.matches(interactiveElements)) {
      cursorMain.classList.remove("hover");
      cursorGlow.classList.remove("active");
    }
  });

  // Create velocity-aware particle trail
  function createParticle(x, y, vx = 0, vy = 0, spd = 0) {
    const particle = document.createElement("div");
    particle.className = "cursor-particle";

    // Neon palette — bias toward cyan/magenta at speed
    const colors = ["#00ffff", "#ff00ff", "#ffff00", "#6b7bff", "#ff006e"];
    particle.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    // At high speed: elongate particle in direction of travel
    if (spd > 12) {
      const angle = Math.atan2(vy, vx) * (180 / Math.PI);
      const stretch = Math.min(1 + spd * 0.12, 5);
      const size = Math.min(2 + spd * 0.1, 6);
      particle.style.width = size + "px";
      particle.style.height = size * stretch + "px";
      particle.style.transform = `rotate(${angle + 90}deg)`;
      particle.style.opacity = "0.85";
    }

    // Offset: trail behind cursor based on velocity direction
    const trailFactor = Math.min(spd * 0.4, 14);
    const offsetX = (Math.random() - 0.5) * 14 - (vx / Math.max(spd, 1)) * trailFactor;
    const offsetY = (Math.random() - 0.5) * 14 - (vy / Math.max(spd, 1)) * trailFactor;

    particle.style.left = x + offsetX + "px";
    particle.style.top = y + offsetY + "px";

    // Faster movement = shorter particle lifetime (more energetic feel)
    const lifetime = spd > 15 ? 500 : 1000;

    document.body.appendChild(particle);
    setTimeout(() => {
      if (particle.parentNode) particle.parentNode.removeChild(particle);
    }, lifetime);
  }

  // Hide cursor when leaving window
  document.addEventListener("mouseenter", function () {
    cursorMain.style.opacity = "1";
    cursorFollow.style.opacity = "0.8";
  });

  document.addEventListener("mouseleave", function () {
    cursorMain.style.opacity = "0";
    cursorFollow.style.opacity = "0";
    cursorGlow.classList.remove("active");
  });
});
// IntersectionObserver for bento card entry animations
const cardLinks = document.querySelectorAll(".bento-card-link");

const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, i * 100);
        cardObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px",
  },
);

cardLinks.forEach((card) => cardObserver.observe(card));

// ── SVG Circuit Trace — scroll-triggered path draw ─────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const traceSvg  = document.querySelector(".svg-trace");
  const tracePath = document.querySelector(".trace-path");
  if (!traceSvg || !tracePath) return;

  // Measure the full path length and set up dash
  const pathLen = tracePath.getTotalLength();
  tracePath.style.strokeDasharray  = pathLen;
  tracePath.style.strokeDashoffset = pathLen;
  tracePath.style.transition = "none";

  let drawn = false;

  const traceObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !drawn) {
          drawn = true;

          // Animate the draw over ~1.4s
          tracePath.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)";
          tracePath.style.strokeDashoffset = "0";

          // After path is drawn, reveal decorations
          setTimeout(() => {
            traceSvg.classList.add("trace-drawn");
          }, 1200);

          traceObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  traceObserver.observe(traceSvg);
});


