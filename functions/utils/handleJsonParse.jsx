// FUNCTION TO HANDLE JSON PARSE
// No dependencies

// Functions
const log = require('./log.jsx');

/* PARAMETERS
  input {body} - API call body
  RETURN {object} - parsed body || error
*/

function handleJsonParse(body, corsHeaders) {

    // Handle JSON parse
    let parsedBody = null;
    try {
        parsedBody = JSON.parse(body);
    // Catch error
    } catch (error) {      
        log("WARNING", 'Invalid request @handleJsonParse', JSON.stringify(body));
        return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid request' })
        };
    }

    // Return parsed body
    return parsedBody;
}

module.exports = handleJsonParse;