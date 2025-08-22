// FUNCTION TO ADD  NEW MAP TO USER
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - newMap
    RETURN {map} - true || false
*/

async function userAddNewMap(newMap) {

    // Delete project from user and all colabs
    const result = await executeDB({ collectionName: 'users',
                                     type: 'updateOne',
                                     filter: { 'userId': newMap.owner },
                                     update: { $push: { maps: { projectId: newMap.projectId,
                                                                title: newMap.title,
                                                                lastUpdated: newMap.lastUpdated } } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to delete map from user @userDeleteMap.");
        return false;
    }

    // Return
    return result;
}

module.exports = userAddNewMap;