// FUNCTION TO DISCONNECT TWO NODES
// No dependencies

const mapUpdate = require('./mapUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object, string, string} - map, nodeIdFrom, nodeIdTo
    RETURN {object} - updated map || null
*/

async function mapLinkDisconnect(map, nodeIdFrom, nodeIdTo) {

    // Check inputs
    if (!map || !nodeIdFrom || !nodeIdTo) {
        log("SERVER ERROR", "Invalid inputs @mapLinkDisconnect.");
        return null;
    }
    // Clone nodes array to avoid mutating input
    let nodes = [...map.nodes];

    // Update nodeFrom
    let nodeFrom = { ...nodes.find(n => n.nodeId === nodeIdFrom) };
    nodeFrom.relatedLink = nodeFrom.relatedLink.filter(id => id !== nodeIdTo);

    // Update nodeTo
    let nodeTo = { ...nodes.find(n => n.nodeId === nodeIdTo) };
    nodeTo.relatedLink = nodeTo.relatedLink.filter(id => id !== nodeIdFrom);

    // Replace updated nodes in array
    nodes = nodes.map(n => {
        if (n.nodeId === nodeFrom.nodeId) return nodeFrom;
        if (n.nodeId === nodeTo.nodeId) return nodeTo;
        return n;
    });

    // Build updated map
    const updatedMap = { ...map, nodes };

    // Save to database
    const result = await mapUpdate(updatedMap);
    if (!result || typeof result !== 'object' || result.projectId !== map.projectId) {
        log("SERVER ERROR", "Unable to disconnect nodes @mapLinkDisconnect.");
        return null;
    }

    // Return updated map
    return updatedMap;
}

module.exports = mapLinkDisconnect;
