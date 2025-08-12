// FUNCTION TO UPDATE ENTIRE MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {string, object} - projectID, map
    RETURN {map} - map
*/

async function updateMap(map) {

    // Update timestamp
    map.lastUpdated = Date.now();

    // Update entire map on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'replaceOne',
                                     filter: { projectId: map.projectId },
                                     replacement: map });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to update map @updateMap.");
    }

    // Return
    return map;

}

module.exports = updateMap;