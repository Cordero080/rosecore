/**
 * konami.js
 * ↑ ↑ ↓ ↓ ← → ← → B A  →  Full-screen glitch shatter.
 *
 * Effect layers (all run simultaneously):
 *  1. RGB channel desync  — three copies of the page tinted R/G/B slide apart
 *  2. Canvas crack lines  — jagged fracture lines drawn across the screen
 *  3. Shard explosion     — 160 particles from random screen edges + center
 *  4. Scanline flicker    — rapid white-line overlay flashes
 *  5. Body filter chaos   — CSS filter pulses hue/invert on the whole page
 *  6. Wave spike          — sinewave reverses + maxes out speed
 *  7. Terminal message    — "// SYSTEM FAILURE" message at bottom
 */

(function () {
  const SEQUENCE = [
    "ArrowUp", "ArrowUp",
    "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight",
    "ArrowLeft", "ArrowRight",
    "b", "a",
  ];
  let progress = 0;
  let cooldown = false;

  document.addEventListener("keydown", (e) => {
    if (cooldown) return;
    if (e.key === SEQUENCE[progress]) {
      progress++;
      if (progress === SEQUENCE.length) {
        progress = 0;
        triggerShatter();
      }
    } else {
      progress = e.key === SEQUENCE[0] ? 1 : 0;
    }
  });

  // ── Main trigger ────────────────────────────────────────────────────────
  function triggerShatter() {
    if (cooldown) return;
    cooldown = true;

    rgbDesync();
    crackCanvas();
    shardExplosion(160);
    scanlineFlicker();
    bodyFilterChaos();
    waveSpike();
    showMessage();

    setTimeout(() => { cooldown = false; }, 6000);
  }

  // ── 1. RGB desync — three tinted page-covers slide apart ────────────────
  function rgbDesync() {
    const channels = [
      { color: "rgba(255,0,60,0.18)",   tx: -28, ty: -14, delay: 0 },
      { color: "rgba(0,255,200,0.14)",  tx:  28, ty:  14, delay: 30 },
      { color: "rgba(80,80,255,0.16)",  tx:  18, ty: -20, delay: 60 },
    ];

    channels.forEach(({ color, tx, ty, delay }) => {
      setTimeout(() => {
        const el = document.createElement("div");
        el.style.cssText = `
          position:fixed; inset:0; z-index:999980;
          background:${color};
          mix-blend-mode:screen;
          pointer-events:none;
          transform:translate(0,0);
          transition:transform 0.12s ease-out, opacity 0.4s ease;
        `;
        document.body.appendChild(el);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transform = `translate(${tx}px,${ty}px)`;
          });
        });

        // Hold displaced, then fade back
        setTimeout(() => {
          el.style.transform = "translate(0,0)";
          el.style.opacity = "0";
          setTimeout(() => el.remove(), 500);
        }, 800 + delay * 3);
      }, delay);
    });
  }

  // ── 2. Canvas crack lines ────────────────────────────────────────────────
  function crackCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = `
      position:fixed; inset:0; z-index:999985;
      pointer-events:none; opacity:0;
      transition:opacity 0.08s ease;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    // Draw jagged fracture lines from a random epicenter
    const epicX = window.innerWidth  * (0.3 + Math.random() * 0.4);
    const epicY = window.innerHeight * (0.2 + Math.random() * 0.4);
    const numCracks = 14 + Math.floor(Math.random() * 8);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8;

    for (let i = 0; i < numCracks; i++) {
      const angle = (Math.PI * 2 / numCracks) * i + (Math.random() - 0.5) * 0.5;
      const length = 200 + Math.random() * Math.max(window.innerWidth, window.innerHeight) * 0.7;
      drawCrack(ctx, epicX, epicY, angle, length, 0);
    }

    // Fade in then out
    requestAnimationFrame(() => {
      canvas.style.opacity = "0.9";
    });
    setTimeout(() => {
      canvas.style.opacity = "0";
      canvas.style.transition = "opacity 0.6s ease";
      setTimeout(() => canvas.remove(), 700);
    }, 700);
  }

  function drawCrack(ctx, x, y, angle, remainingLen, depth) {
    if (remainingLen <= 0 || depth > 5) return;
    const segLen = 30 + Math.random() * 80;
    const actual = Math.min(segLen, remainingLen);

    // Jitter the angle slightly each segment
    const jitter = (Math.random() - 0.5) * 0.45;
    const nx = x + Math.cos(angle + jitter) * actual;
    const ny = y + Math.sin(angle + jitter) * actual;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    // Branch occasionally
    if (Math.random() < 0.35 && depth < 3) {
      const branchAngle = angle + (Math.random() - 0.5) * 1.2;
      drawCrack(ctx, nx, ny, branchAngle, remainingLen * 0.5, depth + 1);
    }

    drawCrack(ctx, nx, ny, angle + jitter, remainingLen - actual, depth + 1);
  }

  // ── 3. Shard explosion ──────────────────────────────────────────────────
  function shardExplosion(count) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const colors = [
      "#00ffff", "#ff00cc", "#ffffff", "#6b7bff",
      "#ff006e", "#00ff7f", "#ffff00", "#ff4444",
    ];

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const p = document.createElement("div");

        // Shards come from multiple origins (epicenter + screen edges)
        const origin = Math.random();
        let ox, oy;
        if (origin < 0.4) {
          // Center cluster
          ox = W * 0.5 + (Math.random() - 0.5) * W * 0.3;
          oy = H * 0.5 + (Math.random() - 0.5) * H * 0.3;
        } else {
          // Random edge
          const edge = Math.floor(Math.random() * 4);
          ox = edge === 0 ? 0 : edge === 1 ? W : Math.random() * W;
          oy = edge === 2 ? 0 : edge === 3 ? H : Math.random() * H;
        }

        const angle = Math.random() * Math.PI * 2;
        const vel   = 120 + Math.random() * 380;
        const tx    = Math.cos(angle) * vel;
        const ty    = Math.sin(angle) * vel;

        // Mix of round particles and sharp rectangular shards
        const isShard = Math.random() < 0.4;
        const w = isShard ? 2 + Math.random() * 3 : 3 + Math.random() * 5;
        const h = isShard ? w * (3 + Math.random() * 6) : w;
        const rot = Math.random() * 360;

        const color    = colors[Math.floor(Math.random() * colors.length)];
        const duration = 700 + Math.random() * 900;

        p.style.cssText = `
          position:fixed;
          left:${ox}px; top:${oy}px;
          width:${w}px; height:${h}px;
          background:${color};
          border-radius:${isShard ? "1px" : "50%"};
          pointer-events:none;
          z-index:999995;
          box-shadow:0 0 ${w * 4}px ${color};
          transform:rotate(${rot}deg);
          transition:
            transform ${duration}ms cubic-bezier(0.1,0,0.8,1),
            opacity ${duration}ms ease;
          opacity:1;
        `;
        document.body.appendChild(p);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            p.style.transform = `translate(${tx}px,${ty}px) rotate(${rot + 180 + Math.random() * 360}deg) scale(0.1)`;
            p.style.opacity = "0";
          });
        });

        setTimeout(() => p.remove(), duration + 50);
      }, Math.random() * 200);
    }
  }

  // ── 4. Scanline flicker ─────────────────────────────────────────────────
  function scanlineFlicker() {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed; inset:0; z-index:999988;
      background:repeating-linear-gradient(
        0deg,
        transparent 0px,
        transparent 3px,
        rgba(255,255,255,0.03) 3px,
        rgba(255,255,255,0.03) 4px
      );
      pointer-events:none;
      animation:konami-scan-flicker 0.07s steps(1) infinite;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  // ── 5. Body filter chaos ────────────────────────────────────────────────
  function bodyFilterChaos() {
    document.body.classList.add("konami-filter-chaos");
    setTimeout(() => document.body.classList.remove("konami-filter-chaos"), 1500);
  }

  // ── 6. Wave spike ───────────────────────────────────────────────────────
  function waveSpike() {
    if (!window.waveGen) return;
    const origSpeed = window.waveGen.speed;
    window.waveGen.direction *= -1;
    window.waveGen.speed = origSpeed * 10;
    setTimeout(() => {
      if (window.waveGen) {
        window.waveGen.speed = origSpeed;
        window.waveGen.direction *= -1;
      }
    }, 2500);
  }

  // ── 7. Terminal message ─────────────────────────────────────────────────
  function showMessage() {
    const msg = document.createElement("div");
    msg.id = "konami-msg";
    msg.innerHTML = `
      <span class="konami-code-line">// SYSTEM FAILURE</span>
      <span class="konami-code-line">// ↑↑↓↓←→←→BA</span>
      <span class="konami-code-line">// nice try, pistola</span>
    `;
    document.body.appendChild(msg);
    setTimeout(() => msg.classList.add("konami-msg--visible"), 50);
    setTimeout(() => {
      msg.classList.remove("konami-msg--visible");
      setTimeout(() => msg.remove(), 500);
    }, 3500);
  }
})();
