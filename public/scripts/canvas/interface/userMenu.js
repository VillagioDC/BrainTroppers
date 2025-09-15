// CANVAS MODULES
// TOGGLE USER MENU MODULE

// Import modules
import { goProPlan } from '../user/goPro.js';
import { userAccount } from '../user/userAccount.js';
import { toggleTheme } from './toggleTheme.js';
import { logOut } from "../user/logOut.js";

export async function toggleUserMenu(e) {
    e.stopPropagation();
    // Element
    const userMenuPopup = document.getElementById("user-menu-popup");
    // Show menu
    if (!userMenuPopup) {
        // Load user menu
        await loadUserMenu();
        // Set current theme
        setCurrentTheme();
        // Add event listeners
        bindUserMenuEvents();
    // Remove menu
    } else {
        // Remove user menu
        removeUserMenu();
    }
};

// Fetch and load user menu HTML
async function loadUserMenu() {
    try {
        const response = await fetch('./snippets/user-menu.html');
        if (!response.ok) throw new Error('failed to load user-menu.html');
        const html = await response.text();
        // Create popup container
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading user menu:', error);
    }
}

// Set current theme
function setCurrentTheme() {
    // Elements
    const themeToggle = document.getElementById('canvas');
    const menuTheme = document.getElementById("theme-toggle");
    if (!menuTheme) return;
    // Set current theme
    if (themeToggle.classList.contains('light'))
        menuTheme.innerHTML = '<i class="bi bi-brightness-high-fill"></i>&nbsp;Light Mode';
}

// Bind event listeners to user menu items
function bindUserMenuEvents() {
    // Add event listeners to user menu items
    if (document.getElementById("go-pro-plan"))
        document.getElementById("go-pro-plan").addEventListener("click", goProPlan);
    if (document.getElementById("user-account"))
        document.getElementById("user-account").addEventListener("click", userAccount);
    if (document.getElementById("theme-toggle"))
        document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
    if (document.getElementById("log-out"))
        document.getElementById("log-out").addEventListener("click", logOut);
    document.addEventListener('click', outsideClickHandler);
}

// Remove user menu HTML
export function removeUserMenu() {
    // Remove event listeners from user menu items
    if (document.getElementById("go-pro-plan"))
        document.getElementById("go-pro-plan").removeEventListener("click", goProPlan);
    if (document.getElementById("user-account"))
        document.getElementById("user-account").removeEventListener("click", userAccount);
    if (document.getElementById("theme-toggle"))
        document.getElementById("theme-toggle").removeEventListener("click", toggleTheme);
    if (document.getElementById("log-out"))
        document.getElementById("log-out").removeEventListener("click", logOut);
    document.removeEventListener('click', outsideClickHandler);
    // Remove popup container
    if (document.getElementById("user-menu-popup"))
        document.getElementById("user-menu-popup").remove();
}

// Outside click handler
function outsideClickHandler(e) {
    if (e.target.id !== "user-menu-popup") removeUserMenu();
}