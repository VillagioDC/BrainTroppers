// ENDPOINT TO GET MAP CREATION STATUS
// Serverless handler for checking map status

// Dependencies

// Functions
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonGetRequest = require('./utils/refuseNonGetRequest.jsx');
const mapRead = require('./controller/mapRead.jsx');
const userRead = require('./controller/userRead.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    event {queryStringParameters: {projectId, userId}, headers: {Authorization: Bearer <token>}}
    RETURN {object} - body: {status, user?, map?} || error
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
      log("WARNING", 'Invalid body @mapCreateGetStatus');
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
      log("WARNING", 'Missing token @mapCreateGetStatus');
      return {
        statusCode: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    // Fetch map
    const map = await mapRead( projectId );
    if (!map) {
      log("WARNING", 'Project not found @mapCreateGetStatus', projectId);
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
    // If failed
    if (map.creationStatus === 'Failed') {
      log("ERROR", `Map creation failed @mapUpdateGetStatus: ${projectId}`);
    // If created
    } else if (map.creationStatus === 'Created') {
      log("INFO", "Map created @mapUpdateGetStatus:");
    }

    // Collect user if map created
    let user = null;
    if (map.creationStatus === 'Created')
      user = await userRead(userId);

    // Construct response
    const response = {
      status: map.creationStatus, // Requesting, Creating, Brainstorming, Enriching, Created, Failed
      user: map.creationStatus !== 'Failed' ? user : null,
      map: map.creationStatus !== 'Failed' ? map : null
    };

    // Return
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    };

  } catch (error) {
    log("ERROR", `Error in mapCreateGetStatus endpoint: ${error.message}`);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};