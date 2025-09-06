// ENDPOINT TO RESET PASSWORD
// Serverless handler for reseting password (GET request)

// Dependencies

// Functions
const handlePreflight = require('./utils/handlePreflight.jsx');
const userResetPassword = require('./auth/userResetPassword.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {query} - API call
    RETURN {object} - null
*/

exports.handler = async (event) => {

  // Define CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight OPTIONS request
  const preflight = handlePreflight(event, corsHeaders);
  if (preflight) return preflight;

  // Refuse non-GET requests
  if (event.httpMethod !== 'GET')
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Bad request' })
    };

  // Handle GET request
  const query = event.rawQuery;
  if (!query || query.trim().length === 0)
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Bad request' })
    };

  // Anti-malicious checks
  if (query.length > 50)
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Bad request' })
    };

  try {
    // Reset password
    const response = await userResetPassword(query);
    // Handle error
    if (!response)
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
    if (!response || response.statusCode != 200 || !response.body.authToken)
      return {
        statusCode: response.statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: response.error })
      };

    // Create redirection url
    // const url = //const url = `${process.env.URL}/index.html`;
    const url = `http://localhost:5500/index.html`;
    const newPasswordParam = 'newPassword=true';
    const authTokenParam = `authToken=${response.body.authToken}`;
    const redirectUrl = `${url}?${newPasswordParam}&${authTokenParam}`;

    // Return success
    return {
      statusCode: 302,
      headers: { Location: redirectUrl },
      body: ''
    };
    
  // Catch error
  } catch (error) {
    log('SERVER ERROR', `Error in resetPassword endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};