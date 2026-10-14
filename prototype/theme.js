(function () {
  var button = document.querySelector("[data-theme]");
  if (!button) return;
  button.addEventListener("click", function () {
    document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(
        "theme",
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    } catch (e) {}
  });
})();
