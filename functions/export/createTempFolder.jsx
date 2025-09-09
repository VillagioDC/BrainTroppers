// FUNCTION TO CREATE TEMP EXPORT FOLDER
// Dependencies
const fs = require('fs').promises;

// Functions
const log = require('../utils/log.jsx');

/* PARAMETERS
  no input
  RETURN null
*/
async function createTempFolder() {

    // Temp folder
    const outputDir = './private/exportTemp';

    // Create output directory if it doesn't exist
    try {
        await fs.mkdir(outputDir, { recursive: true });
    // Catch error
    } catch (error) {
        log("ERROR", `Failed to create output directory @createTempFolder: ${error.message}`);
    }

    // Return
    return null;
}

module.exports = createTempFolder;