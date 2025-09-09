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
        log("ERROR", "Invalid inputs @mapLinkDisconnect.");
        return null;
    }

    // Clone nodes array to avoid mutating input
    let nodes = [...map.nodes];

    // Update nodeFrom
    let nodeFrom = { ...nodes.find(n => n.nodeId === nodeIdFrom) };
    // Exclude direct link
    nodeFrom.directLink = nodeFrom.directLink.filter(id => id !== nodeIdTo);
    // Exclude indirect link
    nodeFrom.relatedLink = nodeFrom.relatedLink.filter(id => id !== nodeIdTo);

    // Update nodeTo
    let nodeTo = { ...nodes.find(n => n.nodeId === nodeIdTo) };
    // Exclude direct link
    nodeTo.directLink = nodeTo.directLink.filter(id => id !== nodeIdFrom);
    // Exclude indirect link
    nodeTo.relatedLink = nodeTo.relatedLink.filter(id => id !== nodeIdFrom);

    // Replace updated nodes in array
    nodes = nodes.map(n => {
        if (n.nodeId === nodeFrom.nodeId) return nodeFrom;
        if (n.nodeId === nodeTo.nodeId) return nodeTo;
        return n;
    });

    // Build updated map
    const updatedMap = { ...map, nodes };

    // Update entire map on database
    const result = await mapUpdate(updatedMap);
    if (!result || typeof result !== 'object' || result.projectId !== map.projectId) {
        log("ERROR", "Unable to disconnect nodes @mapLinkDisconnect.");
        return null;
    }

    // Return updated map
    return updatedMap;
}

module.exports = mapLinkDisconnect;
