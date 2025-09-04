// ENDPOINT TO SET USER NEW PASSWORD
// Serverless handler for setting user new password

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonPostRequest = require('./utils/refuseNonPostRequest.jsx');
const handlePostRequest = require('./utils/handlePostRequest.jsx');
const handleJsonParse = require('./utils/handleJsonParse.jsx');
const userNewPassword = require('./controller/userNewPassword.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {credentials: {email, password, authToken}}} - API call
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
        !credentials.email || credentials.email.trim().length === 0 ||
        !credentials.password || credentials.password.trim().length === 0 ||
        !credentials.authToken || credentials.authToken.trim().length === 0) {
      log('SERVER WARNING', 'Invalid body', JSON.stringify(body));
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Anti-malicious checks
    if (typeof credentials.email !== 'string' || credentials.email.length > 50 ||
        typeof credentials.password !== 'string' || credentials.password.length > 50 ||
        typeof credentials.authToken !== 'string' || credentials.authToken.length > 50) {
            log('SERVER WARNING', 'Request blocked by anti-malicious check');
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid request' })
            };
    }

    // Set user new password
    const updated = await userNewPassword(credentials);
    // Check response
    if (!updated || !updated.statusCode) {
      log('SERVER ERROR', 'User new password error');
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Password update failed' })
      };
    }
    if (updated.statusCode !== 200) {
      log('SERVER WARNING', 'User new password failed');
      return {
        statusCode: signedUp.statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(updated.body)
      };
    }

    // Return success
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(updated.body)
    };

  // Catch error
  } catch (error) {
    log('SERVER ERROR', `Error in setNewPassword endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};