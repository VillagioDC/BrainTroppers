// FUNCTION TO HANDLE POST REQUEST
// No dependencies

// Functions
const log = require('./log.jsx');

/* PARAMETERS
  input {event} - API call
  RETURN {object} - event || error result
*/

function handlePostRequest(event, corsHeaders) {

    // Handle post request
    const { headers, body } = event;
    if (!headers || typeof headers !== 'object' || !body || typeof body !== 'string') {
      log('SERVER WARNING', 'Invalid POST request @handlePostRequest', event);
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request' })
      };
    }

    // Post request is valid
    return event;
}

module.exports = handlePostRequest;