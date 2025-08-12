// FUNCTION TO GET INSTRUCTIONS ACCORDING TO THE ROLE
const fs = require('fs'); // native
const path = require('path'); // native

// Log function
const log = require('../utils/log.jsx');

/* PARAMETERS
    role {string} - role
    RETURN {string} || null - instructions
*/

async function getInstructionsTxt(role) {

    // File paths
    const pathToDirectory = '../data';
    const fileName = `${role}.txt`;

    // Set path to file
    const filePath = path.join(__dirname, pathToDirectory, fileName);

    // Handle unexisting file error
    if (!fs.existsSync(filePath)) {
        log("SERVER ERROR", "Unable to find the instructions file @getInstructions.", filePath);
        return null;
    }

    // Get participant instructions according to the role
    const instructionsString = fs.readFileSync(filePath, "utf-8");

    // Handle reading file error
    if (!instructionsString) {
        log("SERVER ERROR", "Unable to get instructions from file @getInstructions.");
        return null;
    }

    // Return instructions
    return instructionsString;
}

module.exports = getInstructionsTxt;