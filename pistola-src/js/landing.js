// Landing Page - Glitch Title Animation

document.addEventListener("DOMContentLoaded", () => {
  const titleElement = document.getElementById("landingTitle");
  const TITLE_TEXT = "PVBLO C0RDERO";

  // Golden ratio constant for Weyl sequence
  const PHI = (1 + Math.sqrt(5)) / 2; // ≈ 1.618

  // Color variants for each letter
  const colorVariants = [
    "magenta",
    "cyan",
    "aqua",
    "purple",
    "blue",
    "orange",
    "pink",
    "green",
  ];

  // Base delay to wait for page load
  const BASE_DELAY = 0.8;

  // Calculate delays using Weyl sequence
  const letters = TITLE_TEXT.split("");
  const letterDelays = letters.map((_, i) => {
    const weyl = ((i + 1) * PHI) % 1;
    return BASE_DELAY + weyl * 0.6; // 0.6s max spread
  });

  // Track hovered letters for replay feature
  const hoveredLetters = new Set();
  let replayState = false;

  // Create letter spans
  letters.forEach((letter, index) => {
    const span = document.createElement("span");
    const isSpace = letter === " ";
    const isFlipped = index === 0 || index === letters.length - 1;
    const colorVariant = colorVariants[index % colorVariants.length];

    // Build class list
    let classes = ["title-letter"];
    if (isSpace) {
      classes.push("title-letter--space");
    } else {
      classes.push(`title-letter--${colorVariant}`);
      if (isFlipped) {
        classes.push("title-letter--flip");
      }
    }

    span.className = classes.join(" ");
    span.textContent = letter;
    span.setAttribute("data-letter", letter);

    if (!isSpace) {
      span.style.animationDelay = `${letterDelays[index]}s`;
    }

    // Hover tracking for replay
    if (!isSpace) {
      span.addEventListener("mouseenter", () => handleLetterHover(index));
    }

    titleElement.appendChild(span);
  });

  // Handle letter hover - trigger replay when all hovered
  function handleLetterHover(index) {
    hoveredLetters.add(index);

    // Count non-space letters
    const nonSpaceCount = letters.filter((l) => l !== " ").length;

    if (hoveredLetters.size === nonSpaceCount && !replayState) {
      replayState = true;
      hoveredLetters.clear();

      // Reset animation
      titleElement.classList.add("landing-title--reset");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          titleElement.classList.remove("landing-title--reset");
          titleElement.classList.add("landing-title--replay");

          // Reassign staggered delays for replay
          const letterSpans = titleElement.querySelectorAll(
            ".title-letter:not(.title-letter--space)",
          );
          letterSpans.forEach((span, i) => {
            const weyl = ((i + 1) * PHI) % 1;
            span.style.animationDelay = `${weyl * 0.4}s`;
          });

          setTimeout(() => {
            titleElement.classList.remove("landing-title--replay");
            replayState = false;

            // Restore original delays
            letterSpans.forEach((span, i) => {
              // Find original index
              const originalIndex = [...titleElement.children].indexOf(span);
              span.style.animationDelay = `${letterDelays[originalIndex]}s`;
            });
          }, 4000);
        });
      });
    }
  }
});
