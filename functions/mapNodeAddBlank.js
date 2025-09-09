// ENDPOINT TO ADD BLANK NODE
// Serverless handler for adding a blank node

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonPostRequest = require('./utils/refuseNonPostRequest.jsx');
const handlePostRequest = require('./utils/handlePostRequest.jsx');
const handleJsonParse = require('./utils/handleJsonParse.jsx');
const checkSessionExpired = require('./utils/checkExpires.jsx');
const mapRead = require('./controller/mapRead.jsx');
const mapAddBlankNode = require('./controller/mapAddBlankNode.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {userId, projectId, parentId, node}} - API call
    RETURN [{object}] - body: updatedMap || error
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
    const { userId, projectId, parentId, node } = parsedBody;

    // Check required fields
    if (!userId || userId.trim().length === 0 ||
        !projectId || projectId.trim().length === 0 ||
        !parentId || parentId.trim().length === 0 ||
        !node) {
      log("WARNING", 'Invalid body @mapNodeAddBlank', JSON.stringify(body));
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
      log("WARNING", 'Missing token @mapNodeAddBlank');
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Anti-malicious checks
    if (typeof userId !== 'string' || userId.length > 50 ||
        typeof projectId !== 'string' || projectId.length > 50 ||
        typeof parentId !== 'string' || parentId.length > 50 ||
        typeof node !== 'object' ) {
            log("WARNING", 'Request blocked by anti-malicious check @mapNodeAddBlank');
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
      log("WARNING", 'Project not found @mapNodeAddBlank', projectId);
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Project not found' })
      };
    }

    // Create new blank node
    const updatedMap = await mapAddBlankNode(map, parentId, node);
    if (!updatedMap) {
      log("ERROR", 'Unable to create node @mapNodeAddBlank');
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unable to create node' })
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
    log("ERROR", `Error in mapNodeAddBlank endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};