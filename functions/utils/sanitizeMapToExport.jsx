// FUNCTION TO SANITIZE MAP TO EXPORT
// No dependencies

// Functions
const log = require('./log.jsx');

/* PARAMETERS
  input {fullMap} - map
  RETURN {map} - map || null
*/

async function sanitizeMapToExport(fullMap) {

    // Check map
    if (!fullMap || typeof fullMap !== 'object' || !fullMap.projectId) {
        log("ERROR", "Invalid input @sanitizeMap");
        return null;
    }

    // Create map
    let map = {};

    // Insert meta data
    map.projectId = fullMap.projectId;
    map.title = fullMap.title;
    map.lastUpdated = fullMap.lastUpdated;

    // Insert nodes
    map.nodes = [];
    for (let i=0; i<fullMap.nodes.length; i++) {
        // Create node
        const node = {}; 
        node.nodeId = fullMap.nodes[i].nodeId;
        node.shortName = fullMap.nodes[i].shortName;
        node.content = fullMap.nodes[i].content;
        node.detail = fullMap.nodes[i].detail;
        node.directLink = fullMap.nodes[i].directLink;
        node.relatedLink = fullMap.nodes[i].relatedLink;
        node.x = fullMap.nodes[i].x;
        node.y = fullMap.nodes[i].y;
        node.hidden = fullMap.nodes[i].hidden;
        node.colorScheme = fullMap.nodes[i].colorScheme;
        // Insert node
        map.nodes.push(node);
    }

    // Return
    return map;
}

module.exports = sanitizeMapToExport;