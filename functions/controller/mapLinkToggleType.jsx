// FUNCTION TO TOGGLE LINK TYPE BETWEEN NODES
// No dependencies

// Functions
const mapUpdate = require('./mapUpdate.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
    input {object, string, string, string} - map, nodeIdFrom, nodeIdTo, linkType
    RETURN {object} - updated map || null
*/

async function mapLinkToggleType(map, nodeIdFrom, nodeIdTo, linkType) {

    // Check inputs
    if (!map || !nodeIdFrom || !nodeIdTo || !linkType) {
        log("SERVER ERROR", "Invalid inputs @mapLinkToggleType.");
        return null;
    }
    // Clone nodes array to avoid mutating input
    let nodes = [...map.nodes];

    // Update nodeIdFrom array
    const nf = nodes.findIndex(n => n.nodeId === nodeIdFrom);
    if (linkType === 'direct') {
        // Exclude nodeIdTo from related link array
        nodes[nf].relatedLink = nodes[nf].relatedLink.filter(id => id !== nodeIdTo);
        // Insert nodeIdTo on direct link array
        nodes[nf].directLink.push(nodeIdTo);
    } else if (linkType === 'related') {
        //  Exclude nodeIdTo from direct link array
        nodes[nf].directLink = nodes[nf].directLink.filter(id => id !== nodeIdTo);
        // Insert nodeIdTo on related link array
        nodes[nf].relatedLink.push(nodeIdTo);
    }

    // Update nodeIdTo array
    const nt = nodes.findIndex(n => n.nodeId === nodeIdTo);
    if (linkType === 'direct') {
        // Exclude nodeIdFrom from related link array
        nodes[nt].relatedLink = nodes[nt].relatedLink.filter(id => id !== nodeIdFrom);
        // Insert nodeIdFrom on direct link array
        nodes[nt].directLink.push(nodeIdFrom);
    } else if (linkType === 'related') {
        //  Exclude nodeIdFrom from direct link array
        nodes[nt].directLink = nodes[nt].directLink.filter(id => id !== nodeIdFrom);
        // Insert nodeIdFrom on related link array
        nodes[nt].relatedLink.push(nodeIdFrom);
    }

    // Build updated map
    const updatedMap = { ...map, nodes };

    // Save to database
    const result = await mapUpdate(updatedMap);
    if (!result || typeof result !== 'object' || result.projectId !== map.projectId) {
        log("SERVER ERROR", "Unable to update links @mapLinkToggleType.");
        return null;
    }

    // Return updated map
    return updatedMap;
}

module.exports = mapLinkToggleType;
