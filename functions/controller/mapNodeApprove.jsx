// FUNCTION TO APPROVE NODE ON MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const mapLastUpdate = require('./mapLastUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object, string} - map, nodeId
    RETURN {object} - updated map
*/

async function mapNodeApprove(map, nodeId) {

    // Approve one node on map
    let node = map.nodes.find(n => n.nodeId === nodeId);
    node.status = "approved";
    const nodes = map.nodes.map(n => n.nodeId === node.nodeId ? node : n);
    let updatedMap = { ...map, nodes };

    // Update one node on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'updateOne',
                                     filter: { projectId: map.projectId, 'nodes.nodeId': node.nodeId },
                                     update: { $set: { 'nodes.$': node } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to approve node on map @mapNodeApprove.");
    }

    // Last update
    updatedMap = await mapLastUpdate(updatedMap);

    // Return
    return updatedMap;

}

module.exports = mapNodeApprove;