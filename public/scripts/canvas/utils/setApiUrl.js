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
        case 'userWaitlist':
            url += '/userWaitlist';
            break;
        case 'createNewMap':
            url += '/mapCreate';
            break;
        case 'createMapGetStatus':
            url += '/mapCreateGetStatus';
            break;
        case 'renameMap':
            url += '/mapTitleUpdate';
            break;
        case 'deleteMap':
            url += '/mapDelete';
            break;
        case 'loadMap':
            url += '/mapRead';
            break;
        case 'addNewNode':
            url += '/mapAddNode';
            break;
        case 'expandNode':
            url += '/mapExpandNode';
            break;
        case 'rewriteNode':
            url += '/mapRewriteNode';
            break;
        case 'rewireNode':
            url += '/mapRewireNode';
            break;
        case 'updateNode':
            url += '/mapUpdateNode';
            break;
        case 'assignMapToUser':
            url += '/userAssignMap';
            break;
        case 'refreshUser':
            url += '/userRefresh';
            break;
        default:
            url = '';
            throw new Error('Invalid API call.');
    }
    // Return URL
    return url;
}