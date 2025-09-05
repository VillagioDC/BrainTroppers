// LANDING PAGE AUTHENTICATION MODULE
// SET API URL MODULE

// Import modules
// No modules

export function setApiUrl(api) {

    // Set URL
    let url = "";
    // If production mode
    if (typeof process !== 'undefined' && process.env && process.env.API_URL) {
        url = `${process.env.API_URL}`;
    // If development mode
    } else {
        url = 'http://localhost:8888/.netlify/functions';
    }

    // Set full url
    switch (api) {
        case 'signIn':
            url += '/signIn';
            break;
        case 'signUp':
            url += '/signUp';
            break;
        case 'forgotPassword':
            url += '/resetPassword';
            break;
        case 'newPassword':
            url += '/setNewPassword';
            break;
        default:
            url = '';
            throw new Error('Invalid API call.');
    }
    // Return URL
    return url;
}