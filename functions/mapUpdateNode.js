// ENDPOINT TO UPDATE NODE
// Serverless handler for updating a node

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonPostRequest = require('./utils/refuseNonPostRequest.jsx');
const handlePostRequest = require('./utils/handlePostRequest.jsx');
const handleJsonParse = require('./utils/handleJsonParse.jsx');
const checkSessionExpired = require('./utils/checkExpires.jsx');
const setSessionExpires = require('./utils/setExpires.jsx');
const mapRead = require('./controller/mapRead.jsx');
const mapNodeUpdate = require('./controller/mapNodeUpdate.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {userId, projectId, nodeId, content, detail}} - API call
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
    const { userId, projectId, nodeId, shortName, content, detail, directLink, relatedLink, x, y, locked, approved, hidden, colorScheme, layer } = parsedBody;

    // Check required fields
    if (!userId || userId.trim().length === 0 ||
        !projectId || projectId.trim().length === 0 ||
        !nodeId || nodeId.trim().length === 0 || 
        !shortName || shortName.trim().length === 0 ||
        !directLink ||
        !colorScheme || colorScheme.length === 0 ||
        !layer) {          
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
        typeof nodeId !== 'string' || nodeId.length > 50 ||
        typeof shortName !== 'string' || shortName.length > 50 ||
        (content && (typeof content !== 'string' || content.length > 500)) ||
        (detail && (typeof detail !== 'string' || detail.length > 500)) ||
        !Array.isArray(directLink) ||
        (relatedLink && !Array.isArray(relatedLink)) ||
        (x && typeof x !== 'number') ||
        (y && typeof y !== 'number') ||
        (locked && typeof locked !== 'boolean') ||
        (approved && typeof approved !== 'boolean') ||
        (hidden && typeof hidden !== 'boolean') ||
        typeof colorScheme !== 'string' || colorScheme.length > 50 ||
        typeof layer !== 'number') {
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

    // Find node
    const node = map.nodes.find(node => node.nodeId === nodeId);
    if (!node) {
      log('SERVER WARNING', 'Node not found');
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Node not found' })
      };
    }

    // Update node
    node.shortName = shortName;
    node.content = content || "";
    node.detail = detail || "";
    node.directLink = directLink;
    node.relatedLink = relatedLink || [];
    node.x = x || null;
    node.y = y || null;
    node.locked = locked || false;
    node.approved = approved || false;
    node.hidden = hidden || false;
    node.colorScheme = colorScheme;
    node.layer = layer;

    // Update map node
    const updatedMap = await mapNodeUpdate(map, node);
    if (!updatedMap) {
      log('SERVER ERROR', 'Unable to update node on map');
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unable to update node' })
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
    log('SERVER ERROR', `Error in mapUpdateNode endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};