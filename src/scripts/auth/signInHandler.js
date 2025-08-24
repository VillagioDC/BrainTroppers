// LANDING PAGE AUTHENTICATION MODULE
// HANDLE SIGN IN MODULE

// Handle sign in
export async function handleSignIn() {
    // Get form values
    const emailInput = document.getElementById('sign-in-email');
    const passwordInput = document.getElementById('sign-in-password');
    // Validate
    if (!emailInput || !passwordInput) {
        throw new Error('Form element missing');
    }
    // Normalize
    const email = normalizeEmail(emailInput.value);
    const password = passwordInput.value;
    // Validate
    if (!email || !password) {
        await showNotification('Invalid credentials', 'error');
        console.log('Invalid credentials');
        return;
    }
    // Validate email
    if (!validateEmail(email)) {
        await showNotification('Invalid email', 'error');
        console.log('Invalid email');
        return;
    }
    // Validate password
    if (!validatePassword(password)) {
        await showNotification('Invalid password', 'error');
        console.log('Invalid password');
        return;
    }
    // Sign in
    await showNotification('Signing in', 'info', 'wait');
    const result = await apiSignIn(email, password);
    // Handle result
    if (!result) {
        // If error on API
        await showNotification('Sign in error', 'error');
        console.log('Sign in error');
        return;
    } else if (result && result.error) {
        // If wrong request or wrong credentials
        await showNotification(result.error, 'error');
        console.log(result.error);
        return;
    // Handle success
    } else {
        // Set user and session
        setLocalStorageUser(result.auth);
        // Navigate to canvas
        if (localStorage.getItem('braintroop-user')) {
            // Show notification
            await showNotification('Signing in', 'success');
            // Redirect
            setTimeout(() => {
                window.location.href = './canvas.html';
            }, 2000);                    
        }
    }
}
