// ENDPOINT TO SIGN UP USER
// Serverless handler for signing up user

// Dependencies

// Functions
const userSignUp = require('./controller/userSignUp.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {credentials: {email, password}}} - API call
    RETURN {object} - {auth} || error
*/

exports.handler = async (event) => {

  // Define CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Refuse non-POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle POST request
  try {
    // Parse request
    const { headers, body } = event;
    if (!body) {
      log('SERVER WARNING', 'Invalid body', JSON.stringify(body));
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request body' })
      };
    }

    // Parse body
    const parsedBody = JSON.parse(body);
    const { credentials } = parsedBody;

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

    // Check token
    const authHeader = headers.Authorization || headers.authorization;
    const token = authHeader?.match(/Bearer\s+(\S+)/i)?.[1] || '';
    if (!token || token.trim().length === 0) {
      log('SERVER WARNING', 'Missing token');
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
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
    const auth = await userSignUp(credentials);
    // Check auth
    if (!auth || !auth.statusCode) {
      log('SERVER WARNING', 'User sign up failed');
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Sign up failed' })
      };
    }
    if (auth.statusCode !== 200) {
      log('SERVER WARNING', 'User sign up failed');
      return {
        statusCode: auth.statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: auth.body
      };
    }

    // Return success
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: auth.body
    };

  // Catch error
  } catch (error) {
    log('SERVER ERROR', `Error in userSignIn endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};