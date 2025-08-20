// FUNCTION TO ADD NODE ON MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const mapLastUpdate = require('./mapLastUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object, object} - map, node
    RETURN {object} - updated map
*/

async function mapNodeAdd(map, node) {

    // Add new node to map
    map.nodes.push(node);

    // Add new node on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'updateOne',
                                     filter: { projectId: map.projectId  },
                                     update: { $push: { nodes: node } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to add new node on map @mapNodeAdd.");
    }

    // Last update
    const updatedMap = await mapLastUpdate(map);

    // Return
    return updatedMap;

}

module.exports = mapNodeAdd;