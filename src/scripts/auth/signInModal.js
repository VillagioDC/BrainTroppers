// LANDING PAGE AUTHENTICATION MODULE
// AUTH SIGN IN MODAL MODULE

let signInModal = null;

// Open sign in modal
export async function signInBtnClick() {
    if (signInModal) return;
    if (signUpModal) removeSignUpModal();
    if (forgotPasswordModal) removeForgotPasswordModal();
    signInModal = await loadSignInModal();
    bindSignInModalEvents();
    document.getElementById('sign-in-email').focus();
}

// Load sign in modal
export async function loadSignInModal() {
    try {
        const res = await fetch('./src/snippets/sign-in-modal.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('beforeend', html);
        return document.getElementById('sign-in-modal');
    } catch (error) {
        console.error('Failed to load sign-in modal:', error);
    }
}

// Bind sign in modal events
export function bindSignInModalEvents() {
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
    if (signInForm) signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSignIn();
    });
    if (googleSignIn) googleSignIn.addEventListener('click', async (e) => {
        e.preventDefault();
        await initiateGoogleAuth('sign-in');
    });
    document.addEventListener('click', outsideClickHandler);
}

// Switch to sign up
export async function switchToSignUpClick() {
    if (signInModal) removeSignInModal();
    signUpModal = await loadSignUpModal();
    bindSignUpModalEvents();
    document.getElementById('sign-up-email').focus();
}

// Close sign in
export function closeSignInClick() {
    removeSignInModal();
}

// Outside click handler
export function outsideClickHandler(e) {
    if (signInModal && !signInModal.contains(e.target)) removeSignInModal();
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
    if (signInForm) signInForm.removeEventListener('submit', handleSignIn);
    if (googleSignIn) googleSignIn.removeEventListener('click', initiateGoogleAuth);
    document.removeEventListener('click', outsideClickHandler);
    // Remove modal
    if (signInModal) {
        signInModal.remove();
        signInModal = null;
    }
}

