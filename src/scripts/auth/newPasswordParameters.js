// CHECK NEW PASSWORD URL PARAMETER MODULE

// Check reset password url parameter
export async function checkNewPasswordUrlParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const newPassword = urlParams.get('newPassword');
    const authToken = urlParams.get('authToken');
    if (newPassword && authToken) {
        const cleanedUrl = window.location.origin;
        window.history.replaceState({}, document.title, cleanedUrl);
        await showNewPasswordModal(authToken);
    }
}