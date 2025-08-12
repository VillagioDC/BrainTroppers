// FUNCTION TO UPDATE NODE ON MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const mapLastUpdate = require('./mapLastUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object, object} - map, node
    RETURN {object} - updated map
*/

async function mapNodeUpdate(map, node) {

    // Update one node on map
    const nodes = map.nodes.map(n => n.nodeId === node.nodeId ? node : n);
    let updatedMap = { ...map, nodes };

    // Update one node on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'updateOne',
                                     filter: { projectId: map.projectId, 'nodes.nodeId': node.nodeId },
                                     update: { $set: { 'nodes.$': node } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to update node on map @mapNodeUpdate.");
    }

    // Last update
    updatedMap = await mapLastUpdate(updatedMap);

    // Return
    return updatedMap;

}

module.exports = mapNodeUpdate;