// LANDING PAGE AUTHENTICATION MODULE
// AUTH SIGN IN MODAL MODULE

// Import modules
// Lazy imports

// Open sign in modal
export async function constructSignInModal() {
    // Prevent duplicating modals
    if (document.getElementById('sign-in-modal')) return;
    // Load sign in modal
    await loadSignInModal();
    bindSignInModalEvents();
    document.getElementById('sign-in-email').focus();
}

// Load sign in modal
async function loadSignInModal() {
    try {
        const res = await fetch('./snippets/sign-in-modal.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('beforeend', html);
        return;
    } catch (error) {
        console.error('Failed to load sign-in modal:', error);
    }
}

// Bind sign in modal events
function bindSignInModalEvents() {
    // Elements
    const closeSignIn = document.getElementById('close-sign-in');
    const forgotPassword = document.getElementById('show-forgot-password');
    const switchToSignUp = document.getElementById('switch-to-sign-up');
    const signInForm = document.getElementById('sign-in-form');
    const googleSignIn = document.getElementById('google-sign-in');
    // Event listeners
    if (closeSignIn) closeSignIn.addEventListener('click', closeSignInClick);
    if (forgotPassword) forgotPassword.addEventListener('click', forgotPasswordClick);
    if (switchToSignUp) switchToSignUp.addEventListener('click', switchToSignUpClick);
    if (signInForm) signInForm.addEventListener('submit', signInSubmitHandler);
    if (googleSignIn) googleSignIn.addEventListener('click', googleSignInHandler);
    // Outside click handler
    document.addEventListener('click', outsideClickHandler);
    // Esc key handler
    document.addEventListener('keydown', escKeyHandler);
}

// Forgot password click
async function forgotPasswordClick() {
    removeSignInModal();
    const { constructForgotPasswordModal } = await import('./forgotPasswordModal.js');
    constructForgotPasswordModal();
}

// Switch to sign up
async function switchToSignUpClick() {
    removeSignInModal();
    const { constructSignUpModal } = await import('./signUpModal.js');
    await constructSignUpModal();
}

// Sign in clicked
async function signInSubmitHandler(e) {
    e.preventDefault();
    const { handleSignIn } = await import('./signInHandler.js');
    await handleSignIn();
    removeSignInModal();
}

// Google sign in handler
async function googleSignInHandler(e) {
   e.preventDefault();
   const { initiateGoogleAuth } = await import('./googleAuth.js');
   await initiateGoogleAuth('sign-in');
   removeSignInModal();
}

// Close sign in
async function closeSignInClick() {
    removeSignInModal();
}

// Outside click handler
async function outsideClickHandler(e) {
    const signInModal = document.getElementById('sign-in-modal');
    if (signInModal && e.target.contains(signInModal)) removeSignInModal();
}

// Esc key handler
function escKeyHandler(e) {
    if (e.key === 'Escape') removeSignInModal();
}

// Remove sign in modal
export function removeSignInModal() {
    // Elements
    const closeSignIn = document.getElementById('close-sign-in');
    const forgotPassword = document.getElementById('show-forgot-password');
    const switchToSignUp = document.getElementById('switch-to-sign-up');
    const signInForm = document.getElementById('sign-in-form');
    const googleSignIn = document.getElementById('google-sign-in');
    // Event listeners
    if (closeSignIn) closeSignIn.removeEventListener('click', closeSignInClick);
    if (forgotPassword) forgotPassword.removeEventListener('click', forgotPasswordClick);
    if (switchToSignUp) switchToSignUp.removeEventListener('click', switchToSignUpClick);
    if (signInForm) signInForm.removeEventListener('submit', signInSubmitHandler);
    if (googleSignIn) googleSignIn.removeEventListener('click', googleSignInHandler);
    document.removeEventListener('click', outsideClickHandler);
    document.removeEventListener('keydown', escKeyHandler);
    // Remove modal
    if (document.getElementById('sign-in-modal')) {
        document.getElementById('sign-in-modal').remove();
    }
}

