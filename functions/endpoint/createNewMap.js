// ENDPOINT TO CREATE NEW MAP
// No dependencies

// Functions
const mapCreateNew = require('../controller/mapCreateNew.jsx');

// PARAMETERS
// No input
// RETURN {object} - ticket_id || error

function endpointCreateNewMap() {

    // Create new map
    const map = mapCreateNew();
    // Return
    return null;
}

module.exports = endpointCreateNewMap