// ENDPOINT TO EXPORT MAP
// Serverless handler for exporting map

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonPostRequest = require('./utils/refuseNonPostRequest.jsx');
const handlePostRequest = require('./utils/handlePostRequest.jsx');
const handleJsonParse = require('./utils/handleJsonParse.jsx');
const checkSessionExpired = require('./utils/checkExpires.jsx');
const exportMap = require('./export/exportMap.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {userId, projectId, type}} - API call
    RETURN {object} - body: exportFilepath || error
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
    const { userId, projectId, type } = parsedBody;

    // Check required fields
    if (!userId || userId.trim().length === 0 ||
        !projectId || projectId.trim().length === 0 ||
        !type || type.trim().length === 0 ) {          
          log("WARNING", 'Invalid body @mapExport', JSON.stringify(body));
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid request' })
          };
    }

    // Check token
    const authHeader = headers.Authorization || headers.authorization;
    const token = authHeader?.match(/Bearer\s+(\S+)/i)?.[1] || '';
    if (!token || token.trim().length === 0) {
      log("WARNING", 'Missing token @mapExport');
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Anti-malicious checks
    if (typeof userId !== 'string' || userId.length > 50 ||
        typeof projectId !== 'string' || projectId.length > 50 ||
        typeof type !== 'string' || type.length > 10 ) {
            log("WARNING", 'Request blocked by anti-malicious check @mapExport');
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid request' })
            };
    }

    // Set session expires
    const isValid = await checkSessionExpired(userId);
    if (!isValid) {
      log("INFO", 'Session expired');
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized', expired: true })
      };
    }

    // Export map
    const downloadUrl = await exportMap(projectId, type);
    if (!downloadUrl) {
      log("ERROR", 'Unable to export map @mapExport');
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }

    // Return success
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ downloadUrl })
    };

  // Catch error
  } catch (error) {
    log("ERROR", `Error in mapExport endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};