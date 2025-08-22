// FUNCTION TO LOAD CORS HEADERS
// No dependencies

// Functions
// No functions

/* PARAMETERS
  no input
  RETURN {object} - CORS headers
*/

function loadCORSHeaders() {

    // Define CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    // Return CORS headers
    return corsHeaders;
}

module.exports = loadCORSHeaders;