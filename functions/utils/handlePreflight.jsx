// FUNCTION TO HANDLE PREFLIGHT OPTIONS REQUEST
// No dependencies

// Functions
// No functions

/* PARAMETERS
  input {event} - API call
  RETURN {object} - statusCode:200 || null
*/

function handlePreflight(event, corsHeaders) {

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }
    // No preflight request, return null
    return;
}

module.exports = handlePreflight;