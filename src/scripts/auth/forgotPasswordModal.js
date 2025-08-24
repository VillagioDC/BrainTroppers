// LANDING PAGE AUTHENTICATION MODULE
// AUTH FORGOT PASSWORD MODAL MODULE

// Import modules
import { removeSignInModal, signInBtnClick } from './signInModal.js';
import { removeSignUpModal } from './signUpModal.js';
import { handleForgotPassword } from './forgotPasswordHandler.js';

let forgotPasswordModal, signInModal, signUpModal;

// Open forgot password modal
export async function forgotPasswordClick() {
    // Elements
    forgotPasswordModal = document.getElementById('forgot-password-modal');
    signInModal = document.getElementById('sign-in-modal');
    signUpModal = document.getElementById('sign-up-modal');
    // Remove opened modals
    if (forgotPasswordModal) return;
    if (signInModal) removeSignInModal();
    if (signUpModal) removeSignUpModal();
    // Load forgot password modal
    forgotPasswordModal = await loadForgotPasswordModal();
    bindForgotPasswordModalEvents();
    document.getElementById('reset-email').focus();
}

// Load forgot password modal
export async function loadForgotPasswordModal() {
    try {
        const res = await fetch('./src/snippets/forgot-password-modal.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('beforeend', html);
        return document.getElementById('forgot-password-modal');
    } catch (error) {
        console.error('Failed to load forgot-password modal:', error);
    }
}

// Bind forgot password modal events
export function bindForgotPasswordModalEvents() {
    // Elements
    const closeForgotPassword = document.getElementById('close-forgot-password');
    const backToSignInLink = document.getElementById('back-to-sign-in');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    // Event listeners
    if (closeForgotPassword) closeForgotPassword.addEventListener('click', closeForgotPasswordClick);
    if (backToSignInLink) backToSignInLink.addEventListener('click', backToSignInLinkClick);
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleForgotPassword();
    });
    document.addEventListener('click', outsideClickHandler);
}

// Back to sign in link
export async function backToSignInLinkClick() {
    if (forgotPasswordModal) removeForgotPasswordModal();
    await signInBtnClick();
}

// Close forgot password modal
export function closeForgotPasswordClick() {
    removeForgotPasswordModal();
}

// Outside click handler
export function outsideClickHandler(e) {
    if (forgotPasswordModal && e.target.contains(forgotPasswordModal)) removeForgotPasswordModal();
}

// Remove forgot password modal
export function removeForgotPasswordModal() {
    // Elements
    const closeForgotPassword = document.getElementById('close-forgot-password');
    const backToSignInLink = document.getElementById('back-to-sign-in');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    // Event listeners
    if (closeForgotPassword) closeForgotPassword.removeEventListener('click', closeForgotPasswordClick);
    if (backToSignInLink) backToSignInLink.removeEventListener('click', backToSignInLinkClick);
    if (forgotPasswordForm) forgotPasswordForm.removeEventListener('submit', handleForgotPassword);
    document.removeEventListener('click', outsideClickHandler);
    // Remove modal
    if (forgotPasswordModal) {
        forgotPasswordModal.remove();
        forgotPasswordModal = null;
    }
}