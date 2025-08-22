// FUNCTION TO REFUSE NON POST REQUEST
// No dependencies

// Functions
// No functions

/* PARAMETERS
  input {event} - API call
  RETURN {object} - refuse response || null
*/

function refuseNonPostRequest(event, corsHeaders) {

    // Refuse non-POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    // POST request, return null
    return null;
}

module.exports = refuseNonPostRequest;