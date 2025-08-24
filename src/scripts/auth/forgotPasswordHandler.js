// HANDLE FORGOT PASSWORD MODULE

// Handle forgot password
export async function handleForgotPassword() {
    // Get form values
    const emailInput = document.getElementById('reset-email');
    if (!emailInput) {
        throw new Error('Form element missing');
    }
    // Validate
    const email = normalizeEmail(emailInput.value);
    if (!email) {
        await showNotification('Missing email address', 'error');
        console.log('Missing email address');
        return;
    }
    if (!validateEmail(email)) {
        await showNotification('Invalid email address', 'error');
        console.log('Invalid email address');
        return;
    }
    // Call API
    await showNotification('Reseting access', 'info', 'wait');
    const result = await apiForgotPassword(email);
    // Handle result
    if (!result) {
        // Error
        await showNotification('Password reset failed', 'error');
    } else if (result && result.error) {
        await showNotification(result.error, 'error');
    } else {
        // Pending
        await showNotification('Verification email sent', 'success');
    }
    // Remove modal
    removeForgotPasswordModal();
}

