// HANDLE NEW PASSWORD MODULE

// Handle new password
export async function handleNewPassword() {
    // Get form values
    const emailInput = document.getElementById('new-password-email');
    const passwordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const authToken = document.querySelector('#new-password-form').getAttribute('data-auth-token');
    if (!emailInput || !passwordInput || !confirmPasswordInput || !authToken) {
        throw new Error('Form element missing');
    }
    // Validate
    const email = normalizeEmail(emailInput.value);
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    if (!email || !password || !confirmPassword) {
        await showNotification('Missing credentials', 'error');
        console.log('Missing credentials');
        return;
    }
    if (!validateEmail(email)) {
        await showNotification('Invalid email address', 'error');
        console.log('Invalid email address');
        return;
    }
    if (password !== confirmPassword) {
        await showNotification('Passwords do not match', 'error');
        console.log('Passwords do not match');
        return;
    }
    if (!validatePassword(password)) {
        await showNotification('Invalid password', 'error');
        console.log('Invalid password');
        return;
    }
    // Sign up
    await showNotification('Updating password', 'info', 'wait');
    // Call API
    const result = await apiNewPassword(email, password, authToken);
    // Handle result
    if (!result) {
        await showNotification('Password update failed', 'error');
        console.log('Reset password error');
    } else if (result && result.error) {
        // If wrong request or wrong credentials
        await showNotification(result.error, 'error');
    // Handle success
    } else {
        // Show notification
        await showNotification('Password updated', 'success');
        // Show sign in modal
        setTimeout(() => {
            switchToSignInClick();
        }, 2000);
    }
    // Remove new password modal
    removeNewPasswordModal();
}
