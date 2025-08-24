// LANDING PAGE AUTHENTICATION MODULE
// AUTH FORGOT PASSWORD MODAL MODULE

let forgotPasswordModal = null;

// Open forgot password modal
export async function forgotPasswordClick() {
    if (forgotPasswordModal) return;
    if (signInModal) removeSignInModal();
    if (signUpModal) removeSignUpModal();
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
    signInModal = await loadSignInModal();
    bindSignInModalEvents();
    document.getElementById('sign-in-email').focus();
}

// Close forgot password modal
export function closeForgotPasswordClick() {
    removeForgotPasswordModal();
}

// Outside click handler
export function outsideClickHandler(e) {
    if (e.target === forgotPasswordModal) removeForgotPasswordModal();
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