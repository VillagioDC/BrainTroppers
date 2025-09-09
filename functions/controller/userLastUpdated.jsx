// FUNCTION TO UPDATE LAST CHANGE ON USER PROJECTS
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - map
    RETURN {object} - modified count || null
*/

async function userLastUpdated(map) {

    // Get project ID
    const projectId = map.projectId;
    const lastUpdated = map.lastUpdated;

    // Update last change on user and all colabs
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateMany',
                                     filter: { 'maps.projectId': projectId },
                                     update: { $set: { 'maps.$.lastUpdated': lastUpdated } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("ERROR", "Unable to update last change on user @userLastUpdated.");
        return null;
    }

    // Return
    return result;
}

module.exports = userLastUpdated;