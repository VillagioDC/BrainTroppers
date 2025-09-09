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

    // Delete project from all users: owner and colabs
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateMany',
                                     filter: { maps: { $elemMatch: { projectId: projectId } }},
                                     update: { $pull: { maps: { projectId: projectId } }} });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("ERROR", "Unable to delete map from user @userDeleteMap.");
        return false;
    }

    // Return
    return true;
}

module.exports = userDeleteMap;