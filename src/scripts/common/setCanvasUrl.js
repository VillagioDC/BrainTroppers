// LANDING PAGE
// SET CANVAS URL MODULE

// Import modules
// No modules

export function setCanvasUrl() {
    // Set URL
    let url = "";
    // If production mode
    if (typeof process !== 'undefined' && process.env && process.env.API_URL) {
        url = `${process.env.CANVAS_URL}`;
    // If development mode
    } else {
        url = './canvas.html';
    }

    // Return URL
    return url;
}