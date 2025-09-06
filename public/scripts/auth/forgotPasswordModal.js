// LANDING PAGE AUTHENTICATION MODULE
// AUTH FORGOT PASSWORD MODAL MODULE

// Import modules
// Lazy imports

// Open forgot password modal
export async function constructForgotPasswordModal() {
    // Prevent duplicating modals
    if (document.getElementById('forgot-password-modal')) return;
    // Load forgot password modal
    await loadForgotPasswordModal();
    bindForgotPasswordModalEvents();
    document.getElementById('reset-email').focus();
}

// Load forgot password modal
async function loadForgotPasswordModal() {
    try {
        const res = await fetch('./snippets/forgot-password-modal.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('beforeend', html);
        return;
    } catch (error) {
        console.error('Failed to load forgot-password modal:', error);
    }
}

// Bind forgot password modal events
function bindForgotPasswordModalEvents() {
    // Elements
    const closeForgotPassword = document.getElementById('close-forgot-password');
    const backToSignInLink = document.getElementById('back-to-sign-in');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    // Event listeners
    if (closeForgotPassword) closeForgotPassword.addEventListener('click', closeForgotPasswordClick);
    if (backToSignInLink) backToSignInLink.addEventListener('click', backToSignInLinkClick);
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', forgotPasswordSubmitHandler);
    // Outside click
    document.addEventListener('click', outsideClickHandler);
    // Esc key
    document.addEventListener('keydown', escKeyHandler);
}

// Back to sign in link
async function backToSignInLinkClick() {
    removeForgotPasswordModal();
    const { constructSignInModal } = await import ('./signInModal.js');
    constructSignInModal();
}

// Forgot password modal clicked
async function forgotPasswordSubmitHandler(e) {
    e.preventDefault();
    const { handleForgotPassword } = await import('./forgotPasswordHandler.js');
    await handleForgotPassword();
    removeForgotPasswordModal();
}

// Close forgot password modal
function closeForgotPasswordClick() {
    removeForgotPasswordModal();
}

// Outside click handler
function outsideClickHandler(e) {
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    if (forgotPasswordModal && e.target.contains(forgotPasswordModal)) removeForgotPasswordModal();
}

// Esc key handler
function escKeyHandler(e) {
    if (e.key === 'Escape') removeForgotPasswordModal();
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
    if (forgotPasswordForm) forgotPasswordForm.removeEventListener('submit', forgotPasswordSubmitHandler);
    document.removeEventListener('click', outsideClickHandler);
    document.removeEventListener('keydown', escKeyHandler);
    // Remove modal
    if (document.getElementById('forgot-password-modal')) {
        document.getElementById('forgot-password-modal').remove();
    }
}