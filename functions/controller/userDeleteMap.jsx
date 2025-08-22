// FUNCTION TO DELETE MAP FROM USER
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {string, string} - userId, projectID
    RETURN {map} - true || false
*/

async function userDeleteMap(projectId) {

    // Delete project from user and all colabs
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateMany',
                                     filter: { 'maps.projectId': projectId  },
                                     update: { $pull: { maps: { projectId: projectId } } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to delete map from user @userDeleteMap.");
        return false;
    }

    // Return
    return result;
}

module.exports = userDeleteMap;