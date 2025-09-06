// FUNCTION TO SET API URL
// No dependencies

// Import modules
const log = require('./log.jsx');

function setApiUrl(api) {

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
        case 'mapCreate-background':
            url += '/mapCreate-background';
            break;
        default:
            url = '';
            log('SERVER ERROR', 'Invalid API call', api);
    }
    // Return URL
    return url;
}

module.exports = setApiUrl;