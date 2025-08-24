// LANDING PAGE AUTHENTICATION MODULE
// AUTH NEW PASSWORD MODAL MODULE

// Import modules
import { removeForgotPasswordModal } from './forgotPasswordModal.js';
import { removeSignInModal } from './signInModal.js';
import { removeSignUpModal, switchToSignInClick } from './signUpModal.js';
import { validatePasswordInput } from './validatePassword.js';
import { handleNewPassword } from './newPasswordHandler.js';

let forgotPasswordModal, signInModal, signUpModal, newPasswordModal;

// Show reset password modal
export async function showNewPasswordModal(authToken) {
    // Elements
    forgotPasswordModal = document.getElementById('forgot-password-modal');
    signInModal = document.getElementById('sign-in-modal');
    signUpModal = document.getElementById('sign-up-modal');
    newPasswordModal = document.getElementById('new-password-modal');
    // Remove opened modals
    if (forgotPasswordModal) removeForgotPasswordModal();
    if (signInModal) removeSignInModal();
    if (signUpModal) removeSignUpModal();
    // Load reset password modal
    await loadNewPasswordModal(authToken);
    if (!newPasswordModal) return;
    // Bind events
    bindNewPasswordModalEvents();
}

// Load new password modal
export async function loadNewPasswordModal(authToken) {
    try {
        const res = await fetch('./src/snippets/new-password-modal.html');
        let html = await res.text();
        html = html.replace('{{authToken}}', authToken);
        document.body.insertAdjacentHTML('beforeend', html);
        return document.getElementById('new-password-modal');
    } catch (error) {
        console.error('Failed to load new-password modal:', error);
    }
}

// Bind reset password modal events
export function bindNewPasswordModalEvents() {
    // Elements
    const closeNewPassword = document.getElementById('close-new-password');
    const switchToSignIn = document.getElementById('switch-to-sign-in');
    const newPasswordForm = document.getElementById('new-password-form');
    const passwordInput = document.getElementById('new-password');
    // Event listeners
    if (closeNewPassword) closeNewPassword.addEventListener('click', closeNewPasswordClick);
    if (switchToSignIn) switchToSignIn.addEventListener('click', switchToSignInClick);
    if (newPasswordForm) newPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleNewPassword();
    });
    if (passwordInput) passwordInput.addEventListener('input', validatePasswordInput);
    document.addEventListener('click', outsideClickHandler);
}

// Close new password modal
export function closeNewPasswordClick() {
    removeNewPasswordModal();
}

// Outside click handler
export function outsideClickHandler(e) {
    if (newPasswordModal && e.target.contains(newPasswordModal)) removeNewPasswordModal();
}

// Remove new password modal
export function removeNewPasswordModal() {
    // Remove event listeners
    if (document.getElementById('close-new-password'))
        document.getElementById('close-new-password').removeEventListener('click', closeNewPasswordClick);
    if (document.getElementById('switch-to-sign-in'))
        document.getElementById('switch-to-sign-in').removeEventListener('click', switchToSignInClick);
    if (document.getElementById('new-password-form'))
        document.getElementById('new-password-form').removeEventListener('submit', handleNewPassword);
    if (document.getElementById('new-password'))
        document.getElementById('new-password').removeEventListener('input', validatePasswordInput);
    document.removeEventListener('click', outsideClickHandler);
    // Remove modal
    if (newPasswordModal) {
        newPasswordModal.remove();
        newPasswordModal = null;
    }
}