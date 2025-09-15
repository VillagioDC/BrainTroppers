// FUNCTION TO PARSE JSON
const rjson = require('relaxed-json'); // npm install relaxed-json

// Functions
const log = require('./log.jsx');

/* PARAMETERS
    jsonString {string} - JSON string to parse
    RETURN {object} || null - Return Json object or null
*/

function parseJSON(jsonString) {
    
    // Handle error
    if (!jsonString) {
        log("WARNING", "Empty JSON string @parseJSON");
        return null;
    }

    // Parse json string using Relaxed Json library
    let jsonObject = null;
    try {
        jsonObject = rjson.parse(jsonString);

    // Catch error
    } catch (error) {
        log("ERROR", "Error while parsing JSON string @parseJSON", error);
        return null;
    }

    // Handle error
    if (!jsonObject || typeof jsonObject !== "object") {
        log("ERROR", "Unable to parse JSON string @parseJSON");
        return null;
    }

    // Return
    return jsonObject;    
}

module.exports = parseJSON;
    