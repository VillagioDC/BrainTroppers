// LANDING PAGE SCRIPTS

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await Promise.all([
            // Landing page modules
            import('./index/uiUx.js'),
            import('./index/brainstorm.js'),
            // Authentication module
            import('./auth/authMain.js'),
        ]);
        // Clean local storage
        if (localStorage.getItem('braintroop-user')) localStorage.removeItem('braintroop-user');
        // Modules loaded successfully
        console.log('Page loaded successfully');
    } catch (error) {
        // Error loading modules
        console.error('Error loading modules:', error);
    }
});