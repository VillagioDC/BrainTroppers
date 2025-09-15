// LOAD SANITIZE MAP TO PASS AI
// Dependencies

// Functions
const log = require('./log.jsx');

/* PARAMETERS
    input ({object, string}) - map, type ()
    RETURN {object} - Return map || null
*/
function sanitizeMap({map, type}) {

    // Check map
    if (!map || typeof map !== 'object') {
        log("ERROR", "Invalid input @sanitizeMap.");
        return null;
    }

    // Create map copy
    let smallMap = {};

    // Select meta content
    smallMap.projectId = map.projectId;
    smallMap.title = map.title;
    smallMap.query = map.query;
    smallMap.creationStatus = map.creationStatus;

    // Select node content
    smallMap.nodes = [];
    for (let i=0; i<map.nodes.length; i++) {
        const smallNode = {};
        // To all
        smallNode.nodeId = map.nodes[i].nodeId;
        smallNode.topic = map.nodes[i].topic;
        smallNode.content = map.nodes[i].content;
        smallNode.detail = map.nodes[i].detail;
        // According to type
        if (type === 'rewireNode') {
            smallNode.directLink = map.nodes[i].directLink;
            smallNode.relatedLink = map.nodes[i].relatedLink;
        }
        // Push
        smallMap.nodes.push(smallNode);
    }

    // Return
    return smallMap;
} 

// Export
module.exports = sanitizeMap;