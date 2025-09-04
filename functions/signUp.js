// ENDPOINT TO SIGN UP USER
// Serverless handler for signing up user

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonPostRequest = require('./utils/refuseNonPostRequest.jsx');
const handlePostRequest = require('./utils/handlePostRequest.jsx');
const handleJsonParse = require('./utils/handleJsonParse.jsx');
const userSignUp = require('./controller/userSignUp.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {credentials: {email, password}}} - API call
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
        !credentials.password || credentials.password.trim().length === 0) {
      log('SERVER WARNING', 'Invalid body', JSON.stringify(body));
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Anti-malicious checks
    if (typeof credentials.email !== 'string' || credentials.email.length > 50 ||
        typeof credentials.password !== 'string' || credentials.password.length > 50) {
            log('SERVER WARNING', 'Request blocked by anti-malicious check');
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid request' })
            };
    }

    // Sign up user
    const signedUp = await userSignUp(credentials);
    // Check auth
    if (!signedUp || !signedUp.statusCode) {
      log('SERVER WARNING', 'User sign up failed');
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Sign up failed' })
      };
    }
    if (signedUp.statusCode !== 200) {
      log('SERVER WARNING', 'User sign up failed');
      return {
        statusCode: signedUp.statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(signedUp.body)
      };
    }

    // Return success
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: signedUp.body
    };

  // Catch error
  } catch (error) {
    log('SERVER ERROR', `Error in userSignUp endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};