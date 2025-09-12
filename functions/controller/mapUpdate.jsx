// FUNCTION TO UPDATE ENTIRE MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {string, object} - map
    RETURN {object} - map
*/

async function mapUpdate(map) {

    // Check input
    if (!map || typeof map !== 'object' || !map.projectId) {
        log("ERROR", "Unable to update map @updateMap.");
        return null;
    }

    // Update timestamp
    map.lastUpdated = new Date(Date.now());

    // Update entire map on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'replaceOne',
                                     filter: { projectId: map.projectId }, 
                                     replacement: { ...map } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("ERROR", "Unable to update map @updateMap.");
    }

    // Return
    return map;

}

module.exports = mapUpdate;