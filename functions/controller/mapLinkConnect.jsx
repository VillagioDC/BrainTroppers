// FUNCTION TO APPROVE NODE ON MAP
// No dependencies

// Functions
const mapUpdate = require('./mapUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object, string, string} - map, nodeId
    RETURN {object} - updated map
*/

async function mapLinkConnect(map, nodeIdFrom, nodeIdTo) {

    // Create links between nodes
    // Clone nodes array to avoid mutating input
    let nodes = [...map.nodes];

    // Update nodeFrom
    let nodeFrom = { ...nodes.find(n => n.nodeId === nodeIdFrom) };
    if (!nodeFrom.relatedLink.includes(nodeIdTo)) {
        nodeFrom.relatedLink = [...nodeFrom.relatedLink, nodeIdTo];
    }

    // Update nodeTo
    let nodeTo = { ...nodes.find(n => n.nodeId === nodeIdTo) };
    if (!nodeTo.relatedLink.includes(nodeIdFrom)) {
        nodeTo.relatedLink = [...nodeTo.relatedLink, nodeIdFrom];
    }

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
    // Handle error
    if (!result || result.modifiedCount === 0) {
        log("SERVER ERROR", "Unable to connect nodes @mapLinkConnect.");
    }

    // Return
    return updatedMap;

}

module.exports = mapLinkConnect;