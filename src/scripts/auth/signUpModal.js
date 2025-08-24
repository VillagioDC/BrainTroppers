// LANDING PAGE AUTHENTICATION MODULE
// AUTH SIGN UP MODAL MODULE

// Import modules
import { removeSignInModal, signInBtnClick } from './signInModal.js';
import { validatePasswordInput } from './validatePassword.js';
import { removeForgotPasswordModal } from './forgotPasswordModal.js';
import { handleSignUp } from './signUpHandler.js';
import { initiateGoogleAuth } from './googleAuth.js';

let signUpModal, signInModal, forgotPasswordModal;

// Open sign up modal
export async function signUpBtnClick() {
    // Elements
    signUpModal = document.getElementById('sign-up-modal');
    signInModal = document.getElementById('sign-in-modal');
    forgotPasswordModal = document.getElementById('forgot-password-modal');
    // Remove opened modals
    if (signUpModal) return;
    if (signInModal) removeSignInModal();
    if (forgotPasswordModal) removeForgotPasswordModal();
    // Load sign up modal
    signUpModal = await loadSignUpModal();
    bindSignUpModalEvents();
    document.getElementById('sign-up-email').focus();
}

// Load sign up modal
export async function loadSignUpModal() {
    try {
        const res = await fetch('./src/snippets/sign-up-modal.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('beforeend', html);
        return document.getElementById('sign-up-modal');
    } catch (error) {
        console.error('Failed to load sign-up modal:', error);
    }
}

    // Bind sign up modal events
export function bindSignUpModalEvents() {
    // Elements
    const closeSignUp = document.getElementById('close-sign-up');
    const switchToSignIn = document.getElementById('switch-to-sign-in');
    const signUpForm = document.getElementById('sign-up-form');
    const googleSignUp = document.getElementById('google-sign-up');
    const passwordInput = document.getElementById('sign-up-password');
    // Event listeners
    if (closeSignUp) closeSignUp.addEventListener('click', closeSignUpClick);
    if (switchToSignIn) switchToSignIn.addEventListener('click', switchToSignInClick);
    if (signUpForm) signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSignUp();
    });
    if (googleSignUp) googleSignUp.addEventListener('click', async (e) => {
        e.preventDefault();
        await initiateGoogleAuth('sign-up');
    });
    if (passwordInput) passwordInput.addEventListener('input', validatePasswordInput);
    document.addEventListener('click', outsideClickHandler);
}

// Switch to sign in
export async function switchToSignInClick() {
    if (signUpModal) removeSignUpModal();
    await signInBtnClick();
}

// Close sign up
export function closeSignUpClick() {
    removeSignUpModal();
}

// Outside click handler
export function outsideClickHandler(e) {
    if (signUpModal && e.target.contains(signUpModal)) removeSignUpModal();
}

// Remove sign up modal
export function removeSignUpModal() {
    // Elements
    const closeSignUp = document.getElementById('close-sign-up');
    const switchToSignIn = document.getElementById('switch-to-sign-in');
    const signUpForm = document.getElementById('sign-up-form');
    const googleSignUp = document.getElementById('google-sign-up');
    const passwordInput = document.getElementById('sign-up-password');
    // Event listeners
    if (closeSignUp) closeSignUp.removeEventListener('click', closeSignUpClick);
    if (switchToSignIn) switchToSignIn.removeEventListener('click', switchToSignInClick);
    if (signUpForm) signUpForm.removeEventListener('submit', handleSignUp);
    if (googleSignUp) googleSignUp.removeEventListener('click', initiateGoogleAuth);
    if (passwordInput) passwordInput.removeEventListener('input', validatePasswordInput);
    document.removeEventListener('click', outsideClickHandler);
    // Remove modal
    if (signUpModal) {
        signUpModal.remove();
        signUpModal = null;
    }
}