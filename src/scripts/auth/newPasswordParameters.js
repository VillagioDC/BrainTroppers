// LANDING PAGE AUTHENTICATION MODULE
// CHECK NEW PASSWORD URL PARAMETER MODULE

// Import modules
import { showNewPasswordModal } from './src/scripts/auth/newPasswordModal.js';

// Check reset password url parameter
export async function checkNewPasswordUrlParameter() {
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
        await showNewPasswordModal(authToken);
    }
}