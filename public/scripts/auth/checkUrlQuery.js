// LANDING PAGE AUTHENTICATION MODULE
// CHECK NEW PASSWORD URL PARAMETER MODULE

// Import modules
// Lazy imports

// Check URL query
export function checkUrlQuery() {
    // Check reset password url parameter
    checkNewPasswordUrlParameter();
    // Check session expired url parameter
    checkSessionExpiredUrlParameter();
    return;
}

// Check reset password url parameter
async function checkNewPasswordUrlParameter() {
    // Get url parameters
    const urlParams = new URLSearchParams(window.location.search);
    const newPassword = urlParams.get('newPassword');
    const authToken = urlParams.get('authToken');
    // Show new password modal
    if (newPassword && authToken) {
        // Clean navigation url
        const cleanedUrl = window.location.origin;
        window.history.replaceState({}, document.title, cleanedUrl);
        // Show new password modal
        const { showNewPasswordModal } = await import('./newPasswordModal.js');
        await showNewPasswordModal(authToken);
    }
    return;
}

// Check session expired url parameter
async function checkSessionExpiredUrlParameter() {
    // Get url parameters
    const urlParams = new URLSearchParams(window.location.search);
    const expired = urlParams.get('expired');
    const signIn = urlParams.get('signIn');
    // Show new password modal
    if (expired && signIn) {
        // Clean navigation url
        const cleanedUrl = window.location.origin;
        window.history.replaceState({}, document.title, cleanedUrl);
        // Show sign in modal
        const { constructSignInModal } = await import('./signInModal.js');
        await constructSignInModal();
    }
    return;
}