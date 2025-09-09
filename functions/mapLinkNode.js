// ENDPOINT TO LINK NODE
// Serverless handler for linking nodes

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonPostRequest = require('./utils/refuseNonPostRequest.jsx');
const handlePostRequest = require('./utils/handlePostRequest.jsx');
const handleJsonParse = require('./utils/handleJsonParse.jsx');
const checkSessionExpired = require('./utils/checkExpires.jsx');
const mapRead = require('./controller/mapRead.jsx');
const mapLinkConnect = require('./controller/mapLinkConnect.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {projectId, nodeFrom, nodeTo}} - API call
    RETURN {object} - body: updatedMap || error
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
    const { userId, projectId, nodeIdFrom, nodeIdTo } = parsedBody;

    // Check required fields
    if (!projectId || projectId.trim().length === 0 ||
        !nodeIdFrom || nodeIdFrom.trim().length === 0 ||
        !nodeIdTo || nodeIdTo.trim().length === 0) {
          log("WARNING", 'Invalid body @mapLinkNode', JSON.stringify(body));
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
      log("WARNING", 'Missing token @mapLinkNode');
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Anti-malicious checks
    if (typeof projectId !== 'string' || projectId.length > 50 ||
        typeof nodeIdFrom !== 'string' || nodeIdFrom.length > 50 ||
        typeof nodeIdTo !== 'string' || nodeIdTo.length > 50) {
            log("WARNING", 'Request blocked by anti-malicious check @mapLinkNode');
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

    // Read map
    const map = await mapRead(projectId);
    if (!map) {
      log("WARNING", 'Project not found @mapLinkNode', projectId);
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Project not found' })
      };
    }

    // Disconnect nodes on map
    const updatedMap = await mapLinkConnect(map, nodeIdFrom, nodeIdTo);
    if (!updatedMap) {
      log("ERROR", 'Unable to disconnect nodes on map @mapLinkNode');
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
      body: JSON.stringify(updatedMap)
    };

  // Catch error
  } catch (error) {
    log("ERROR", `Error in mapLinkNode endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};