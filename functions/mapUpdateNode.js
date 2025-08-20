// ENDPOINT TO UPDATE NODE
// Serverless handler for updating a node

// Dependencies

// Functions
const mapRead = require('./controller/mapRead.jsx');
const mapNodeUpdate = require('./controller/mapNodeUpdate.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {projectId, nodeId, content, detail}} - API call
    RETURN {object} - map data or null
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
    const { projectId, nodeId, content, detail } = parsedBody;

    if (!projectId || projectId.trim().length === 0 ||
        !nodeId || nodeId.trim().length === 0 || 
        !content || content.trim().length === 0 ||
        !detail || detail.trim().length === 0) {          
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
    if (typeof projectId !== 'string' || projectId.length > 50 ||
        typeof nodeId !== 'string' || nodeId.length > 50 ||
        typeof content !== 'string' || content.length > 500 ||
        typeof detail !== 'string' || detail.length > 500) {
            log('SERVER WARNING', 'Request blocked by anti-malicious check');
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid request' })
            };
    }

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
    node.content = content;
    node.detail = detail;

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
      body: JSON.stringify(map)
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