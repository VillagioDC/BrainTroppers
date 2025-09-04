// ENDPOINT TO ASSIGN MAP TO USER
// Serverless handler for assigning map to a user

// Dependencies
const loadCORSHeaders = require('./utils/loadCORSHeaders.jsx');
const handlePreflight = require('./utils/handlePreflight.jsx');
const refuseNonPostRequest = require('./utils/refuseNonPostRequest.jsx');
const handlePostRequest = require('./utils/handlePostRequest.jsx');
const handleJsonParse = require('./utils/handleJsonParse.jsx');
const userAssignMap = require('./controller/userAssignMap.jsx');
const log = require('./utils/log.jsx');

/* PARAMETERS
    input {headers: {Authorization: Bearer <token>}, body: { assignedUserId, {map} }} - API call
    RETURN {object} - body: map || error
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
        const { assignedUserId, map } = parsedBody;

        // Check required fields
        if (!assignedUserId || assignedUserId.trim().length === 0 ||
            !map ||
            !map.projectId || map.projectId.trim().length === 0 ||
            !map.title || map.title.trim().length === 0 ||
            !map.lastUpdated) {
            log('SERVER_WARNING', 'Invalid body', JSON.stringify(body));
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing required fields', details: { assignedUserId, map } })
            };
        }

        // Anti-malicious checks
        if (typeof assignedUserId !== 'string' || assignedUserId.length > 50 ||
            typeof map !== 'object' ||
            typeof map.projectId !== 'string' || map.projectId.length > 50 ||
            typeof map.title !== 'string' || map.title.length > 50 ||
            typeof map.lastUpdated !== 'string' || map.lastUpdated.length > 50) {
            log('SERVER_WARNING', 'Request blocked by anti-malicious check');
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid request parameters' })
            };
        }

        // Validate and convert lastUpdated
        const lastUpdatedDate = new Date(map.lastUpdated);
        if (isNaN(lastUpdatedDate.getTime())) {
            log('SERVER_WARNING', 'Invalid lastUpdated date');
            return {
                statusCode: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid request' })
            };
        }
        map.lastUpdated = lastUpdatedDate;

        // Assign map to user
        const result = await userAssignMap({ assignedUserId, map });
        if (!result) {
            log('SERVER_ERROR', 'Assigning map to user failed');
            return {
                statusCode: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Failed to assign map' })
            };
        }

        // Return success
        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        };

    } catch (error) {
        log('SERVER_ERROR', `Error in userAssignMap endpoint: ${error.message}`);
        return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};