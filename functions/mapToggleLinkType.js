// ENDPOINT TO UNLINK NODE
// Serverless handler for unlinking nodes

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonPostRequest = require('./utils/refuseNonPostRequest.jsx');
const handlePostRequest = require('./utils/handlePostRequest.jsx');
const handleJsonParse = require('./utils/handleJsonParse.jsx');
const checkSessionExpired = require('./utils/checkExpires.jsx');
const mapRead = require('./controller/mapRead.jsx');
const mapLinkToggleType = require('./controller/mapLinkToggleType.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {projectId, nodeFrom, nodeTo, linkType}} - API call
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
    const { userId, projectId, nodeIdFrom, nodeIdTo, linkType } = parsedBody;

    // Check required fields
    if (!projectId || projectId.trim().length === 0 ||
        !nodeIdFrom || nodeIdFrom.trim().length === 0 ||
        !nodeIdTo || nodeIdTo.trim().length === 0 ||
        !linkType || linkType.trim().length === 0) {
          log('SERVER WARNING', 'Invalid body @mapToggleLinkType', JSON.stringify(body));
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
      log('SERVER WARNING', 'Missing token @mapToggleLinkType');
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Anti-malicious checks
    if (typeof projectId !== 'string' || projectId.length > 50 ||
        typeof nodeIdFrom !== 'string' || nodeIdFrom.length > 50 ||
        typeof nodeIdTo !== 'string' || nodeIdTo.length > 50 ||
        typeof linkType !== 'string' || (linkType !== 'direct' && linkType !== 'related')) {
            log('SERVER WARNING', 'Request blocked by anti-malicious check @mapToggleLinkType');
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid request' })
            };
    }

    // Set session expires
    const isValid = await checkSessionExpired(userId);
    if (!isValid) {
      log('SERVER INFO', 'Session expired');
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized', expired: true })
      };
    }

    // Read map
    const map = await mapRead(projectId);
    if (!map) {
      log('SERVER WARNING', 'Project not found @mapToggleLinkType', projectId);
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Project not found' })
      };
    }

    // Disconnect nodes on map
    const updatedMap = await mapLinkToggleType(map, nodeIdFrom, nodeIdTo, linkType);
    if (!updatedMap) {
      log('SERVER ERROR', 'Unable to toggle link type @mapToggleLinkType');
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
    log('SERVER ERROR', `Error in maptogglelinktype endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};