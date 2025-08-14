// CANVAS THEME SCRIPT

document.querySelector(".theme-toggle").addEventListener("click", (e) => {
  e.preventDefault();
  const icon = document.querySelector(".theme-toggle i");
  const text = document.querySelector(".theme-toggle");
  if (icon.classList.contains("fa-moon")) {
    icon.classList.replace("fa-moon", "fa-sun");
    text.textContent = " Light Mode";
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
    text.textContent = " Dark Mode";
  }
  document.body.classList.toggle("light-mode");
});