// LANDING PAGE AUTHENTICATION MODULE
// AUTH NEW PASSWORD MODAL MODULE

// Import modules
import { switchToSignInClick } from './signUpModal.js';
import { validatePasswordInput } from './validatePassword.js';

// Show reset password modal
export async function showNewPasswordModal(authToken) {
    // Load reset password modal
    const newPasswordModal = await loadNewPasswordModal(authToken);
    if (!newPasswordModal) return;
    // Bind events
    bindNewPasswordModalEvents();
}

// Load new password modal
async function loadNewPasswordModal(authToken) {
    try {
        const res = await fetch('./snippets/new-password-modal.html');
        let html = await res.text();
        html = html.replace('{{authToken}}', authToken);
        document.body.insertAdjacentHTML('beforeend', html);
        return document.getElementById('new-password-modal');
    } catch (error) {
        console.error('Failed to load new-password modal:', error);
    }
}

// Bind reset password modal events
function bindNewPasswordModalEvents() {
    // Elements
    const closeNewPassword = document.getElementById('close-new-password');
    const switchToSignIn = document.getElementById('switch-to-sign-in');
    const newPasswordForm = document.getElementById('new-password-form');
    const passwordInput = document.getElementById('new-password');
    // Event listeners
    if (closeNewPassword) closeNewPassword.addEventListener('click', closeNewPasswordClick);
    if (switchToSignIn) switchToSignIn.addEventListener('click', switchToSignInClick);
    if (newPasswordForm) newPasswordForm.addEventListener('submit', newPasswordSubmitHandler);
    if (passwordInput) passwordInput.addEventListener('input', validatePasswordInput);
    // Outside click
    document.addEventListener('click', outsideClickHandler);
    // Esc key
    document.addEventListener('keydown', escKeyHandler);
}

// New password submit handler
async function newPasswordSubmitHandler(e) {
    e.preventDefault();
    const { handleNewPassword } = await import('./newPasswordHandler.js');
    await handleNewPassword();
    removeNewPasswordModal();
}

// Close new password modal
function closeNewPasswordClick() {
    removeNewPasswordModal();
}

// Outside click handler
function outsideClickHandler(e) {
    const newPasswordModal = document.getElementById('new-password-modal');
    if (newPasswordModal && e.target.contains(newPasswordModal)) removeNewPasswordModal();
}

// Esc key handler
function escKeyHandler(e) {
    if (e.key === 'Escape') removeNewPasswordModal();
}

// Remove new password modal
export function removeNewPasswordModal() {
    // Remove event listeners
    if (document.getElementById('close-new-password'))
        document.getElementById('close-new-password').removeEventListener('click', closeNewPasswordClick);
    if (document.getElementById('switch-to-sign-in'))
        document.getElementById('switch-to-sign-in').removeEventListener('click', switchToSignInClick);
    if (document.getElementById('new-password-form'))
        document.getElementById('new-password-form').removeEventListener('submit', newPasswordSubmitHandler);
    if (document.getElementById('new-password'))
        document.getElementById('new-password').removeEventListener('input', validatePasswordInput);
    document.removeEventListener('click', outsideClickHandler);
    document.removeEventListener('keydown', escKeyHandler);
    // Remove modal
    if (document.getElementById('new-password-modal'))
        document.getElementById('new-password-modal').remove();
}