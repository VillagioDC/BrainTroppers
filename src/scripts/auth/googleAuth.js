// LANDING PAGE AUTHENTICATION MODULE
// GOOGLE AUTHENTICATION MODULE

// Pending

// Google authentication API
// Pending
export async function apiGoogleAuth(type) {
    try {
        const url = 'http://localhost:8888/.netlify/functions';
        const response = await fetch(`${url}/auth/google?type=${type}`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Google authentication failed: ${error.message}`);
    }
}

// Initiate Google authentication
// Pending
export async function initiateGoogleAuth(type) {
    try {
        await showNotification(`Initiating Google ${type === 'sign-in' ? 'Sign In' : 'Sign Up'}...`, 'info', 'wait');
        const result = await apiGoogleAuth(type);
        if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
        } else {
            await showNotification('Google authentication successful!', 'success');
            setTimeout(() => {
                window.location.href = './canvas.html';
            }, 2000);
        }
    } catch (error) {
        await showNotification(error.message, 'error');
        console.error('Google auth error:', error);
    }
}