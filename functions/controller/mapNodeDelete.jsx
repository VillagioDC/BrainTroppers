// FUNCTION TO DELETE NODE ON MAP
// No dependencies

// Functions
const executeDB = require('../mongoDB/executeDB.jsx');
const mapLastUpdated = require('./mapLastUpdated.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object, string} - map, nodeId
    RETURN {object} - updated map
*/

async function mapNodeDelete(map, nodeId) {

    // Check inputs
    if (!map || !nodeId) {
        log("ERROR", "Invalid inputs @mapNodeDelete.");
        return null;
    }

    // Clone nodes array to avoid mutating input
    let nodes = [...map.nodes];

    // Disconnect node
    nodes = nodes.map(node => ({
        ...node,
        directLink: node.directLink.filter(id => id !== nodeId),
        relatedLink: node.relatedLink.filter(id => id !== nodeId)
    }));

    // Update map without deleted node
    nodes = nodes.filter(node => node.nodeId !== nodeId);

    // Reconstruct map
    map = { ...map, nodes };

    // Delete node on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'updateOne',
                                     filter: { projectId: map.projectId  },
                                     update: { $pull: { nodes: { nodeId: nodeId } } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("ERROR", "Unable to delete node on map @mapNodeDelete.");
    }

    // Last update
    const updatedMap = await mapLastUpdated(map);

    // Return
    return updatedMap;

}

module.exports = mapNodeDelete;