// ENDPOINT TO FORGOT PASSWORD
// Serverless handler for triggering password reset

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonPostRequest = require('./utils/refuseNonPostRequest.jsx');
const handlePostRequest = require('./utils/handlePostRequest.jsx');
const handleJsonParse = require('./utils/handleJsonParse.jsx');
const userSendReset = require('./auth/userSendReset.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {credentials: {email}} - API call
    RETURN {object} - body: message || error
*/

exports.handler = async (event) => {

  // Define CORS headers
  const corsHeaders = loadCORSHeaders();

  // Handle preflight OPTIONS request
  const preflight = handlePreflight(event, corsHeaders);
  if (preflight) return preflight;

  // Refuse non-POST requests
  const nonPostRequest = refuseNonPostRequest(event, corsHeaders);
  if (nonPostRequest) return nonPostRequest;

  // Handle POST request
  try {
    // Handle POST request
    const postRequest = handlePostRequest(event, corsHeaders);
    if (!postRequest || postRequest.statusCode === 400) return postRequest;
    const { headers, body } = postRequest;

    // Parse body
    const parsedBody = handleJsonParse(body, corsHeaders);
    if (!parsedBody || parsedBody.statusCode === 400) return parsedBody;
    const { credentials } = parsedBody;

    // Check required fields
    if (!credentials || 
        !credentials.email || credentials.email.trim().length === 0 ) {
      log('SERVER WARNING', 'Invalid credentials @forgotPassword', JSON.stringify(body));
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing email address' })
      };
    }

    // Anti-malicious checks
    if (typeof credentials.email !== 'string' || credentials.email.length > 50) {
            log('SERVER WARNING', 'Request blocked by anti-malicious check @forgotPassword', JSON.stringify(body));
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid request' })
            };
    }

    // Send reset email
    const response = await userSendReset(credentials.email);
    // Check response
    if (!response) {
      log('SERVER ERROR', 'Failed sending password reset email @forgotPassword', JSON.stringify(response));
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Fail sending reset email' })
      };
    }

    // Return success
    return {
      statusCode: response.statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: response.body
    };

  // Catch error
  } catch (error) {
    log('SERVER ERROR', `Error in forgotPassword endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};