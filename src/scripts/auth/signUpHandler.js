// LANDING PAGE AUTHENTICATION MODULE
// HANDLE SIGN UP MODULE

// Import modules
import { normalizeEmail, validateEmail } from '../common/validateEmail.js';
import { validatePassword } from './validatePassword.js';
import { apiSignUp } from './signUpApi.js';
import { switchToSignInClick } from './signUpModal.js';
import { showNotification } from '../common/notifications.js';

// Handle sign up
export async function handleSignUp() {
    // Get form values
    const emailInput = document.getElementById('sign-up-email');
    const passwordInput = document.getElementById('sign-up-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (!emailInput || !passwordInput || !confirmPasswordInput) {
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
    await showNotification('Creating account', 'info', 'wait');
    // Call API
    const result = await apiSignUp(email, password);
    // Handle result
    if (!result) {
        await showNotification('Sign up error', 'error');
        console.log('Sign up error');
    } else if (result && result.error) {
        // If wrong request or wrong credentials
        await showNotification(result.error, 'error');
        console.log(result.error);
    // Handle success
    } else {
        // Show notification
        await showNotification('Verification email sent', 'success');
        // Show sign in modal
        setTimeout(() => {
            switchToSignInClick();
        }, 2000);
    }
}