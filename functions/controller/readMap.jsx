// FUNCTION TO READ MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');

/* PARAMETERS
    input {object} - projectID
    RETURN {object} - map or null
*/

async function readMap(projectId) {

    // Find document on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'findOne',
                                     filter: { projectId: projectId  } });
    // Handle error
    if (!result || !result.projectId || result.projectId !== projectId) {
        log("SERVER ERROR", "Unable to read map @readMap.");
        return null;
    }

    // Return
    const map = result;
    return map;

}

module.exports = readMap;