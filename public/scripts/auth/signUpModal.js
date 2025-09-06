// LANDING PAGE AUTHENTICATION MODULE
// AUTH SIGN UP MODAL MODULE

// Import modules
// Lazy imports
import { validatePasswordInput } from './validatePassword.js';

// Open sign up modal
export async function constructSignUpModal() {
    // Prevent duplicating modals
    if (document.getElementById('sign-up-modal')) return;
    // Load sign up modal
    await loadSignUpModal();
    bindSignUpModalEvents();
    document.getElementById('sign-up-email').focus();
}

// Load sign up modal
async function loadSignUpModal() {
    try {
        const res = await fetch('./snippets/sign-up-modal.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('beforeend', html);
        return;
    } catch (error) {
        console.error('Failed to load sign-up modal:', error);
    }
}

    // Bind sign up modal events
function bindSignUpModalEvents() {
    // Elements
    const closeSignUp = document.getElementById('close-sign-up');
    const switchToSignIn = document.getElementById('switch-to-sign-in');
    const signUpForm = document.getElementById('sign-up-form');
    const googleSignUp = document.getElementById('google-sign-up');
    const passwordInput = document.getElementById('sign-up-password');
    // Event listeners
    if (closeSignUp) closeSignUp.addEventListener('click', closeSignUpClick);
    if (switchToSignIn) switchToSignIn.addEventListener('click', switchToSignInClick);
    if (signUpForm) signUpForm.addEventListener('submit', signUpSubmitHandler);
    if (googleSignUp) googleSignUp.addEventListener('click', googleSignUpHandler);
    if (passwordInput) passwordInput.addEventListener('input', validatePasswordInput);
    // Outside click
    document.addEventListener('click', outsideClickHandler);
    // Esc key click
    document.addEventListener('keydown', escKeyHandler);
}

// Google sign up handler
async function googleSignUpHandler(e) {
    e.preventDefault();
    const { initiateGoogleAuth } = await import('./googleAuth.js');
    await initiateGoogleAuth('sign-up');
    removeSignUpModal();
}

// Switch to sign in
export async function switchToSignInClick() {
    removeSignUpModal();
    const { constructSignInModal } = await import('./signInModal.js');
    await constructSignInModal();
}

// Sign up clicked
async function signUpSubmitHandler(e) {
    e.preventDefault();
    const { handleSignUp } = await import('./signUpHandler.js');
    await handleSignUp();
    removeSignUpModal();
}

// Close sign up
function closeSignUpClick() {
    removeSignUpModal();
}

// Outside click handler
function outsideClickHandler(e) {
    const signUpModal = document.getElementById('sign-up-modal');
    if (signUpModal && e.target.contains(signUpModal)) removeSignUpModal();
}

// Esc key handler
function escKeyHandler(e) {
    if (e.key === 'Escape') removeSignUpModal();
}

// Remove sign up modal
function removeSignUpModal() {
    // Elements
    const closeSignUp = document.getElementById('close-sign-up');
    const switchToSignIn = document.getElementById('switch-to-sign-in');
    const signUpForm = document.getElementById('sign-up-form');
    const googleSignUp = document.getElementById('google-sign-up');
    const passwordInput = document.getElementById('sign-up-password');
    // Event listeners
    if (closeSignUp) closeSignUp.removeEventListener('click', closeSignUpClick);
    if (switchToSignIn) switchToSignIn.removeEventListener('click', switchToSignInClick);
    if (signUpForm) signUpForm.removeEventListener('submit', signUpSubmitHandler);
    if (googleSignUp) googleSignUp.removeEventListener('click', googleSignUpHandler);
    if (passwordInput) passwordInput.removeEventListener('input', validatePasswordInput);
    document.removeEventListener('click', outsideClickHandler);
    document.removeEventListener('keydown', escKeyHandler);
    // Remove modal
    if (document.getElementById('sign-up-modal')) {
        document.getElementById('sign-up-modal').remove();
    }
}