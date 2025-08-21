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

async function mapAddNew(query) {

    // Get empty map
    const map = await loadMapSchema();

    // Generate project ID
    const projectId = generateToken();

    // Add project ID
    map.projectId = projectId;

    // Add user prompt
    map.userPrompt = query;

    // Add last updated
    map.lastUpdated = Date.now();

    // Insert new map on MongoDB
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'insertOne',
                                     document: map });

    // Return
    return map;

}

module.exports = mapAddNew;