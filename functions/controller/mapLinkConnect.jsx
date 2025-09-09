// FUNCTION TO CONNECT TWO NODES
// No dependencies

// Functions
const mapUpdate = require('./mapUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object, string, string} - map, nodeId
    RETURN {object} - updated map
*/

async function mapLinkConnect(map, nodeIdFrom, nodeIdTo) {

    // Check inputs
    if (!map || !nodeIdFrom || !nodeIdTo) {
        log("ERROR", "Invalid inputs @mapLinkConnect.");
        return null;
    }

    // Clone nodes array to avoid mutating input
    let nodes = [...map.nodes];

    // Update nodeFrom
    let nodeFrom = { ...nodes.find(n => n.nodeId === nodeIdFrom) };
    // Include direct link
    if (!nodeFrom.directLink.includes(nodeIdTo)) {
        nodeFrom.directLink = [...nodeFrom.relatedLink, nodeIdTo];
    }
    // Exclude indirect link
    nodeFrom.relatedLink = nodeFrom.relatedLink.filter(id => id !== nodeIdTo);

    // Update nodeTo
    let nodeTo = { ...nodes.find(n => n.nodeId === nodeIdTo) };
    // Include direct link
    if (!nodeTo.directLink.includes(nodeIdFrom)) {
        nodeTo.directLink = [...nodeTo.relatedLink, nodeIdFrom];
    }
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
        log("ERROR", "Unable to disconnect nodes @mapLinkConnect.");
        return null;
    }

    // Return
    return updatedMap;

}

module.exports = mapLinkConnect;