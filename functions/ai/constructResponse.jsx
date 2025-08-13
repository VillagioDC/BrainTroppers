// FUNCTION TO CONSTRUCT RESPONSE FROM AI
// No dependencies

// Functions
const parseJSON = require('../utils/parseJSON.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    response {string} - raw string response from AI
    RETURN {object} || null - JSON structured response
*/

async function constructAIResponse (response) {

    // Construct structured response
    let structuredResponse = {};

    // If no response
    if (!response || !response.content || response.content === "") {
        log("SERVER DEBUG", "No response from AI @handleMessageToAction");
        structuredResponse = [ { action: "none", response: null, status: "ignored" } ];
        return structuredResponse;
    }

    // Parse json using Relaxed Json library
    const jsonResponse = parseJSON(response.content);

    // Handle parsing error
    if (!jsonResponse) {
        log("SERVER ERROR", "Unable to parse response from AI @handleMessageToAction", response.content);
        structuredResponse = [ { action: "none", response: null, status: "ignored" } ];
        return structuredResponse;
    }

    // Construct structured response
    structuredResponse = jsonResponse.map(item => {
        return { action: item.action || "none",
                 order: item.order || 0,
                 pending: item.pending || "none",
                 response: item.response || "none",
                 module: item.module || "none",
                 parameters: item.parameters || {},
                 status: "pending"
               }
    });

    // Return response
    return structuredResponse;
    
};

module.exports = constructAIResponse;