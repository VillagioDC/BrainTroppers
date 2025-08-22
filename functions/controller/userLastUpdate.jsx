// FUNCTION TO UPDATE LAST CHANGE ON USER PROJECTS
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - map
    RETURN {object} - modified count || null
*/

async function userLastUpdate(map) {

    // Get project ID
    const projectId = map.projectId;
    const lastUpdate = map.lastUpdated;

    // Update last change on user and all colabs
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateMany',
                                     filter: { 'maps.projectId': projectId },
                                     update: { $set: { 'maps.$.lastUpdated': lastUpdate } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to update last change on user @userLastUpdate.");
        return null;
    }

    // Return
    return result;
}

module.exports = userLastUpdate;