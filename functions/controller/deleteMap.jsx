// FUNCTION TO DELETE MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');

/* PARAMETERS
    input {object} - map
    RETURN (boolean) - true or false
*/

async function deleteMap(map) {

    // Delete node on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'deleteOne',
                                     filter: { projectId: map.projectId  } });
    // Handle error
    if (!result || result.deletedCount === 0) {
        log("SERVER ERROR", "Unable to delete map @deleteMapNode.");
        return false;
    }

    // Return
    return true;

}

module.exports = deleteMap;