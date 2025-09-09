// FUNCTION TO UPDATE LAST CHANGE ON MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const userLastUpdated = require('./userLastUpdated.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - map
    RETURN {object} - updated map
*/

async function mapLastUpdated(map) {

    // Check input
    if (!map || typeof map !== 'object' || !map.projectId) {
        log("ERROR", "Unable to update map @mapLastUpdated.");
        return null;
    }

    // Update last change on map
    map.lastUpdated = new Date(Date.now());

    // Update last change on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'updateOne',
                                     filter: { projectId: map.projectId  },
                                     update: { $set: { lastUpdated: map.lastUpdated } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("ERROR", "Unable to update last change on map @mapLastUpdated.");
        return map;
    }

    // Update user maps
    await userLastUpdated(map);

    // Return
    return map;
}

module.exports = mapLastUpdated;