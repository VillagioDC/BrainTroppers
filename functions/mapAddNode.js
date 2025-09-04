// ENDPOINT TO ADD NEW NODE
// Serverless handler for adding a node

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonPostRequest = require('./utils/refuseNonPostRequest.jsx');
const handlePostRequest = require('./utils/handlePostRequest.jsx');
const checkSessionExpired = require('./utils/checkExpires.jsx');
const setSessionExpires = require('./utils/setExpires.jsx');
const handleJsonParse = require('./utils/handleJsonParse.jsx');
const mapRead = require('./controller/mapRead.jsx');
const mapNodeCreate = require('./controller/mapNodeCreate.jsx');
const log = require('./utils/log.jsx');
const checkSessionExpired = require('./utils/checkExpires.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {userId, projectId, parentId, query}} - API call
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
    if (!postRequest || postRequest.statusCode) return postRequest;
    const { headers, body } = postRequest;

    // Parse body
    const parsedBody = handleJsonParse(body, corsHeaders);
    if (!parsedBody || parsedBody.statusCode) return parsedBody;
    const { userId, projectId, parentId, query } = parsedBody;

    // Check required fields
    if (!userId || userId.trim().length === 0 ||
        !projectId || projectId.trim().length === 0 ||
        !parentId || parentId.trim().length === 0 ||
        !query || query.trim().length === 0) {
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
    if (typeof userId !== 'string' || userId.length > 50 ||
        typeof projectId !== 'string' || projectId.length > 50 ||
        typeof parentId !== 'string' || parentId.length > 50 ||
        typeof query !== 'string' || query.length > 500) {
            log('SERVER WARNING', 'Request blocked by anti-malicious check');
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid request' })
            };
    }

    // Set session expires
    const isValid = await checkSessionExpired(userId);
    if (!isValid) {
      log('SERVER WARNING', 'Session expired');
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized', expired: true })
      };
    }
    // Set session expires
    await setSessionExpires(userId);

    // Read map
    const map = await mapRead(projectId);
    if (!map) {
      log('SERVER WARNING', 'Project not found');
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Project not found' })
      };
    }

    // Create new node based on query
    const updatedMap = await mapNodeCreate(map, parentId, query);
    if (!updatedMap) {
      log('SERVER ERROR', 'Unable to create node');
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
    log('SERVER ERROR', `Error in mapAddNode endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};