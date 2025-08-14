// CANVAS USER MENU SCRIPT

const userIcon = document.getElementById("userIcon");
const userMenuPopup = document.getElementById("userMenuPopup");

userIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  userMenuPopup.classList.toggle("active");
  const expanded = userIcon.getAttribute("aria-expanded") === "true";
  userIcon.setAttribute("aria-expanded", !expanded);
});

document.addEventListener("click", (e) => {
  if (!userIcon.contains(e.target) && !userMenuPopup.contains(e.target)) {
    userMenuPopup.classList.remove("active");
    userIcon.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".user-menu-popup").forEach(popup => {
  popup.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});