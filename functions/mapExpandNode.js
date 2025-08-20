// ENDPOINT TO EXPAND NODE
// Serverless handler for expanding a node

// Dependencies

// Functions
const mapRead = require('./controller/mapRead.jsx');
const mapNodeExpand = require('./controller/mapNodeExpand.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: {projectId, parentNodeId, query}} - API call
    RETURN [{object}] - node data array or null
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
    const { projectId, parentNodeId, query } = parsedBody;

    if (!projectId || projectId.trim().length === 0 ||
        !parentNodeId || parentNodeId.trim().length === 0 ||
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
    if (typeof projectId !== 'string' || projectId.length > 50 ||
        typeof parentNodeId !== 'string' || parentNodeId.length > 50 ||
        typeof query !== 'string' || query.length > 500) {
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

    // Expand node based on query
    const expandedNodes = await mapNodeExpand(map, parentNodeId, query);
    if (!expandedNodes) {
      log('SERVER ERROR', 'Unable to expand node');
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unable to expand node' })
      };
    }

    // Return success
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(expandedNodes)
    };

  // Catch error
  } catch (error) {
    log('SERVER ERROR', `Error in mapExpandNode endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};