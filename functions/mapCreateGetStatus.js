// ENDPOINT TO GET MAP CREATION STATUS
// Serverless handler for checking map status

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonGetRequest = require('./utils/refuseNonGetRequest.jsx');
const checkSessionExpired = require('./utils/checkExpires.jsx');
const setSessionExpires = require('./utils/setExpires.jsx');
const mapRead = require('./controller/mapRead.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    event {queryStringParameters: {projectId, userId}, headers: {Authorization: Bearer <token>}}
    RETURN {object} - body: {status, map?} || error
*/

exports.handler = async (event) => {
  // Define CORS headers
  const corsHeaders = loadCORSHeaders();

  // Handle preflight OPTIONS request
  const preflight = handlePreflight(event, corsHeaders);
  if (preflight) return preflight;

  // Refuse non-GET requests
  const nonGetRequest = refuseNonGetRequest(event, corsHeaders);
  if (nonGetRequest) return nonGetRequest;

  try {
    // Get params   
    const { projectId, userId } = event.queryStringParameters || {};
    if (!projectId || !userId) {
      log('SERVER WARNING', 'Invalid body @mapCreateGetStatus');
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Check token
    const authHeader = event.headers.Authorization || event.headers.authorization;
    const token = authHeader?.match(/Bearer\s+(\S+)/i)?.[1] || '';
    if (!token) {
      log('SERVER WARNING', 'Missing token @mapCreateGetStatus');
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Fetch map
    const map = await mapRead( projectId );
    if (!map) {
      log('SERVER WARNING', 'Project not found @mapCreateGetStatus', projectId);
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Map not found' })
      };
    }

    // Auth: Check ownership
    if (map.owner !== userId && map.colabs.contains(userId)) {
      return {
        statusCode: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Access forbidden' })
      };
    }

    // Map status
    let status;
    // If creating
    if (map.creationStatus === 'requested' || map.creationStatus === 'creating') {
      status = 'creating';
    // If failed
    } else if (map.creationStatus === 'failed') {
      log('SERVER ERROR', `Map creation failed @mapUpdateGetStatus: ${projectId}`);
      status = 'failed';
    // If created
    } else {
      log('SERVER INFO', "Map created @mapUpdateGetStatus:");
      status = 'created';
    }

    // Return
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(map)
    };

  } catch (error) {
    log('SERVER ERROR', `Error in mapCreateGetStatus endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};