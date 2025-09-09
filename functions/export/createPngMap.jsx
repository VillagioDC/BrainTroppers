// FUNCTION TO EXPORT MAP IN PNG
// No dependencies

// Functions
const log = require('../utils/log.jsx');

/* PARAMETERS
  input {map} - map
  RETURN {bool} - sourceFilepath || null
*/

async function createPngMap(map) {

    // Check map
    if (!map || typeof map !== 'object' || !map.projectId) {
        log("ERROR", "Unable to export map @createPngMap.");
        return null;
    }

    // Create PNG file of map
    // Implement here

    // Construct source filepath
    const sourceFilepath = '../exportTemp/' + map.projectId + '.png';

    // Return
    return sourceFilepath;
}

module.exports = createPngMap;