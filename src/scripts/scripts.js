// LANDING PAGE SCRIPTS

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await Promise.all([
            // Landing page modules
            import('./src/scripts/index/getstarted.js'),
            import('./src/scripts/index/uiux.js'),
            import('./src/scripts/index/brainstorm.js'),
            import('./src/scripts/common/notifications.js'),
            // Authentication module
            import('./src/scripts/auth/main-auth.js'),
        ]);
        // Clean local storage
        if (localStorage.getItem('braintroop-user')) localStorage.removeItem('braintroop-user');
        if (localStorage.getItem('braintroop-map')) localStorage.removeItem('braintroop-map');
        // Modules loaded successfully
        console.log('Page loaded successfully');
    } catch (error) {
        // Error loading modules
        console.error('Error loading modules:', error);
    }
});