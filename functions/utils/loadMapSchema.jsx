// LOAD MAP SCHEMA
const fs = require('fs');
const path = require('path');

// Functions
const log = require('./log.jsx');

/* PARAMETERS
    input () - none
    RETURN {object} - Return map schema or null
*/
async function loadMapSchema() {

    try {
        // File name
        const filename = path.join(__dirname, '../data/mapSchema.json');

        // Load map schema
        const mapStr = fs.readFileSync(filename, 'utf8');
        // Handle error
        if (!mapStr) {
            log("SERVER ERROR", "Unable to read map schema @loadMapSchema");
            return null;
        }

        // Parse map schema
        const mapSchema = JSON.parse(mapStr);

        // Return
        return mapSchema;

    // Catch error
    } catch (error) {
        log("SERVER ERROR", "Unable to load map schema @loadMapSchema", error);
        return null;
    }
}

// Export
module.exports = loadMapSchema;
