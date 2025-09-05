// COMMON MODULES
// REDIRECT TO INITIAL PAGE MODULE

// Import modules
// No modules

export function redirectToInitialPage() {
    // Set URL
    let url = "";
    // If production mode
    if (typeof process !== 'undefined' && process.env && process.env.HOME_URL) {
        url = `${process.env.HOME_URL}`;
    // If development mode
    } else {
        url = './index.html';
    }
    // Return URL
    window.location.href = url;
}

export function redirectToSignIn() {
    // Set URL
    let url = "";
    // If production mode
    if (typeof process !== 'undefined' && process.env && process.env.HOME_URL) {
        url = `${process.env.HOME_URL}`;
    // If development mode
    } else {
        url = './index.html';
    }
    // Add query string
    url += '?expired=true&signIn=true';
    // Return URL
    window.location.href = url;
}