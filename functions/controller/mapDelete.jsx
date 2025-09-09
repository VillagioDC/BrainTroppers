// FUNCTION TO DELETE MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object} - map
    RETURN (boolean) - true or false
*/

async function mapDelete(projectId) {

    // Delete node on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'deleteOne',
                                     filter: { projectId: projectId  } });
    // Handle error
    if (!result || result.deletedCount === 0) {
        log("ERROR", "Unable to delete map @deleteMap.");
        return false;
    }

    // Return
    return true;

}

module.exports = mapDelete;