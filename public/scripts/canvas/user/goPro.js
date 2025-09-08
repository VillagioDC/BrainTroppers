// CANVAS MODULES
// GO PRO POPUP MODULE

// Import modules
import { removeUserMenu } from '../interface/userMenu.js';
import { userWaitlistApi } from './userWaitlistApi.js'

export async function goProPlan() {
    // Load pro plan popup
    await loadProPlanPopup();
    // Bind event listeners
    bindProPlanPopupEvents();
    // Remove user menu
    removeUserMenu();
}

// Load pro plan popup
async function loadProPlanPopup() {
    try {
        const response = await fetch('./snippets/pro-plan.html');
        if (!response.ok) throw new Error('Failed to load pro-plan.html');
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading pro plan popup:', error);
    }
}

// Bind event listeners to pro plan popup
function bindProPlanPopupEvents() {
    // Add event listeners to pro plan popup
    // Submit pro plan form
    if (document.getElementById("pro-plan-form"))
        document.getElementById("pro-plan-form").addEventListener("submit", proPlanFormSubmit);
    // Close pro plan popup
    if (document.getElementById("pro-plan-close"))
        document.getElementById("pro-plan-close").addEventListener("click", removeProPlanPopup);
    // Outside click handler
    document.addEventListener('click', outsideClickHandler);
    // Escape key handler
    document.addEventListener('keydown', escapeKeyHandler);
}

// Submit pro plan form
async function proPlanFormSubmit(e) {
    e.preventDefault();
    // Call API
    const result = await userWaitlistApi();
    // Handle result
    if (!result || result.error) {
        // Error
        await showNotification('Failed to register', 'error');
    } else {
        // Registered
        await showNotification('Done', 'success');
    }
    removeProPlanPopup();
}

// Handle outside click
function outsideClickHandler(e) {
    const proPlanContent = document.querySelector('.pro-plan-content');
    if (proPlanContent && !proPlanContent.contains(e.target)) {
        removeProPlanPopup();
    }
}

// Escape key handler
function escapeKeyHandler(e) {
    if (e.key === 'Escape') {
        removeProPlanPopup();
    }
}

// Remove pro plan popup
function removeProPlanPopup() {
    // Remove event listeners
    if (document.getElementById("pro-plan-form"))
        document.getElementById("pro-plan-form").removeEventListener("submit", proPlanFormSubmit);
    if (document.getElementById("pro-plan-close"))
        document.getElementById("pro-plan-close").removeEventListener("click", removeProPlanPopup);
    document.removeEventListener('click', outsideClickHandler);
    document.removeEventListener('keydown', escapeKeyHandler);
    // Remove pro plan popup
    document.getElementById("pro-plan-modal").remove();
}
