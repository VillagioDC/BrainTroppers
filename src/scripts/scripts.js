// LANDING PAGE SCRIPTS

document.addEventListener('DOMContentLoaded', function() {

    // Load all scripts in parallel
    Promise.all([
        // Landing page scripts
        loadScript('./src/scripts/index/getstarted.js'),
        loadScript('./src/scripts/index/uiux.js'),
        loadScript('./src/scripts/index/brainstorm.js'),
        loadScript('./src/scripts/notifications.js'),
        // Authentication scripts
        loadScript('./src/scripts/index/sign-in-up.js'),
    ]).then(() => {
        // Clean local storage
        if (localStorage.getItem('user')) localStorage.removeItem('user');
        if (localStorage.getItem('map')) localStorage.removeItem('map');
        // Scripts loaded successfully
        console.log('Page loaded successfully');
    }).catch(error => {
        // Error loading scripts
        console.error('Error loading scripts:', error);
    });
});

// Load scripts dinamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}