// FUNCTION TO EXPORT MAP IN PDF
// No dependencies

// Functions
const log = require('../utils/log.jsx');

/* PARAMETERS
  input {map} - map
  RETURN {bool} - sourceFilepath || null
*/

async function createPdfMap(map) {

    // Check map
    if (!map || typeof map !== 'object' || !map.projectId) {
        log("ERROR", "Unable to export map @createPdfMap.");
        return null;
    }

    // Create PDF file of map
    // Implement here

    // Construct source filepath
    const sourceFilepath = '../exportTemp/' + map.projectId + '.pdf';

    // Return
    return sourceFilepath;
}

module.exports = createPdfMap;