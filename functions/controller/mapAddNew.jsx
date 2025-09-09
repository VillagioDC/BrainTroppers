// FUNCTION TO ADD NEW MAP
// No dependencies

// Functions
const loadMapSchema = require('../utils/loadMapSchema.jsx');
const generateToken = require('../utils/generateToken.jsx');
const executeDB = require('../mongoDB/executeDB.jsx');

/* PARAMETERS
    input {string} - user query
    RETURN {object} - map data or null
*/

async function mapAddNew({userId, query}) {

    // Get empty map
    const map = await loadMapSchema();

    // Generate project ID
    const projectId = generateToken();

    // Add project ID
    map.projectId = projectId;

    // Add owner
    map.owner = userId;

    // Add user prompt
    map.userPrompt = query;

    // Add creation status
    map.creationStatus = 'requested';

    // Add last updated
    map.lastUpdated = new Date(Date.now());

    // Insert new map on MongoDB
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'insertOne',
                                     document: map });

    // Handle error
    if (!result || result.insertedCount === 0) {
        log("ERROR", "Unable to add new map @mapAddNew.");
        return null;
    }

    // Return
    return map;

}

module.exports = mapAddNew;