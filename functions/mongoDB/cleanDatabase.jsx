// FUNCTION TO CLEAN DATABASE
// No dependencies

// Functions
const executeDB = require('./executeDB.jsx');
const log = require('../utils/log.jsx');

/* Delete all documents from database
   PARAMETERS
    input () - none
    RETURN none
*/

async function cleanDatabase() {

    // Collections
    const collections = ['maps'];

    try {
        // Delete all documents from collections
        for (const collectionName of collections) {
            await executeDB({ collectionName: collectionName, type: 'deleteMany', filter: {} });
        }

        // Return
        return;

    // Catch error
    } catch (error) {
        log("SERVER ERROR", `Error deleting collection @cleanDatabase`, error);
        return { success: false, data: null, error: error.message };
    }
}

module.exports = cleanDatabase;