// FUNCTION TO UPDATE TITLE ON MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const mapLastUpdate = require('./mapLastUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object, string} - map, title
    RETURN {object} - updated map || previous map
*/

async function mapTitleUpdate(map, title) {

    // Update title on map
    map.title = title;

    // Update title on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'updateOne',
                                     filter: { projectId: map.projectId },
                                     update: { $set: { title: title } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to update title on map @mapTitleUpdate.");
    }

    // Last update
    const updatedMap = await mapLastUpdate(map);

    // Return
    return updatedMap;

}

module.exports = mapTitleUpdate;