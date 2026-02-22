// Feather effect for complementary mode
(function () {
  function createFeather() {
    const feather = document.createElement("div");
    feather.className = "floating-feather";
    feather.style.left = Math.random() * 100 + "vw";
    feather.style.top = "-10vh";
    feather.style.opacity = Math.random() * 0.5 + 0.5;
    feather.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(feather);
    // Animate falling
    setTimeout(() => {
      feather.style.top = "110vh";
      feather.style.transform += ` scale(${Math.random() * 0.5 + 0.7})`;
    }, 50);
    // Remove after animation
    setTimeout(() => {
      feather.remove();
    }, 8000);
  }

  window.startFeatherEffect = function () {
    if (window.featherInterval) return;
    window.featherInterval = setInterval(createFeather, 400);
  };
  window.stopFeatherEffect = function () {
    clearInterval(window.featherInterval);
    window.featherInterval = null;
    document.querySelectorAll(".floating-feather").forEach((f) => f.remove());
  };
})();
