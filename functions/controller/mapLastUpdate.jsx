// FUNCTION TO UPDATE LAST CHANGE ON MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - map
    RETURN {object} - updated map
*/

async function mapLastUpdate(map) {

    // Update last change on map
    map.lastUpdated = Date.now();

    // Update last change on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'updateOne',
                                     filter: { projectId: map.projectId  },
                                     update: { $set: { lastUpdated: Date.now() } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to update last change on map @mapLastUpdate.");
    }

    // Return
    return map;

}

module.exports = mapLastUpdate;