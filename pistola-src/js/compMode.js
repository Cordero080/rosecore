// Complementary Mode JavaScript
document.addEventListener("DOMContentLoaded", function () {
  function toggleComplementaryMode() {
    document.body.classList.toggle("complementary-colors");
  }

  // Toggle with 'C' key
  document.addEventListener("keydown", function (event) {
    if (event.key === "c" || event.key === "C") {
      toggleComplementaryMode();
    }
  });

  // Toggle on hover over #myName
  var myName = document.getElementById("myName");
  if (myName) {
    // Removed mouseenter and mouseleave listeners for #myName. Only app.js controls complementary mode.
  }
});
