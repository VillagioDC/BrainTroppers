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

    // Update map without deleted node
    const nodes = map.nodes.filter(node => node.nodeId !== nodeId);
    let updatedMap = { ...map, nodes };

    // Delete node on database
    const result = await executeDB({ collectionName: 'maps',
                                     type: 'updateOne',
                                     filter: { projectId: map.projectId  },
                                     update: { $pull: { nodes: { nodeId: nodeId } } } });
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to delete node on map @mapNodeDelete.");
    }

    // Last update
    updatedMap = await mapLastUpdated(updatedMap);

    // Return
    return updatedMap;

}

module.exports = mapNodeDelete;