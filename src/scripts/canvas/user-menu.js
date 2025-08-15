// CANVAS
// USER MENU SCRIPT

// Elements
const userIcon = document.getElementById("userIcon");
const userMenuPopup = document.getElementById("userMenuPopup");

// Toggle user menu
userIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    // Close any open map menus
    document.querySelectorAll(".map-menu-popup.show").forEach(popup => {
        popup.classList.remove("show");
    });
    document.querySelectorAll(".map-menu-btn").forEach(btn => {
        btn.setAttribute("aria-expanded", "false");
    });
    // Toggle user menu
    userMenuPopup.classList.toggle("active");
    const expanded = userIcon.getAttribute("aria-expanded") === "true";
    userIcon.setAttribute("aria-expanded", !expanded);
});

// Close user menu
document.addEventListener("click", (e) => {
    if (!userIcon.contains(e.target) && !userMenuPopup.contains(e.target)) {
        userMenuPopup.classList.remove("active");
        userIcon.setAttribute("aria-expanded", "false");
    }
});

// Prevent clicks from closing user menu
document.querySelectorAll(".user-menu-popup").forEach(popup => {
    popup.addEventListener("click", (e) => {
        e.stopPropagation();
    });
});