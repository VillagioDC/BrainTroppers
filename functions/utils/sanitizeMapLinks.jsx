// FUNCTION TO SANITIZE LINKS ON MAP
// No dependencies

// Functions
const log = require('./log.jsx');

/* PARAMETERS
    input {object} - map
    RETURN {object} - updatedMap || map
*/

function sanizizeMapLinks(map) {

    // Check inputs
    if (!map || typeof map !== "object" || !map.nodes || map.nodes.length === 0) {
        log("ERROR", "Invalid input @mapLinksSanitize.");
        return null;
    }

    // Construct nodes
    let nodes = [...map.nodes];

    // Remove duplicated nodeId in each directLink and relatedLink
    nodes = nodes.map(node => ({
        ...node,
        directLink: [...new Set(node.directLink.filter(link => link && link.trim() !== ''))],
        relatedLink: [...new Set(node.relatedLink.filter(link => link && link.trim() !== ''))]
    }));

    // Assure bilateral links on both directLink and relatedLink (1 to 2, 2 to 1)
    // Create a map of node indices for O(1) lookup
    const nodeIndexMap = new Map();
    nodes.forEach((node, index) => {
        if (node.nodeId) {
            nodeIndexMap.set(node.nodeId, index);
        }
    });

    // Ensure bilateral direct links
    nodes.forEach((node, nodeIndex) => {
        const currentNodeId = node.nodeId;
        if (!currentNodeId) return;

        // For each direct link from this node
        const directLinksToAdd = [];
        node.directLink.forEach(targetNodeId => {
            if (!targetNodeId || targetNodeId === currentNodeId) return; // Skip invalid or self-links
            
            const targetNodeIndex = nodeIndexMap.get(targetNodeId);
            if (targetNodeIndex !== undefined && targetNodeIndex !== nodeIndex) {
                // Check if the target node has a reverse direct link to current node
                if (!nodes[targetNodeIndex].directLink.includes(currentNodeId)) {
                    // Add reverse link if missing
                    nodes[targetNodeIndex].directLink.push(currentNodeId);
                    directLinksToAdd.push(targetNodeId); // Track for sorting
                }
            }
        });
    });

    // Ensure bilateral related links
    nodes.forEach((node, nodeIndex) => {
        const currentNodeId = node.nodeId;
        if (!currentNodeId) return;

        // For each related link from this node
        const relatedLinksToAdd = [];
        node.relatedLink.forEach(targetNodeId => {
            if (!targetNodeId || targetNodeId === currentNodeId) return; // Skip invalid or self-links
            
            const targetNodeIndex = nodeIndexMap.get(targetNodeId);
            if (targetNodeIndex !== undefined && targetNodeIndex !== nodeIndex) {
                // Check if the target node has a reverse related link to current node
                if (!nodes[targetNodeIndex].relatedLink.includes(currentNodeId)) {
                    // Add reverse link if missing
                    nodes[targetNodeIndex].relatedLink.push(currentNodeId);
                    relatedLinksToAdd.push(targetNodeId); // Track for sorting
                }
            }
        });
    });

    // Remove any remaining duplicates that might have been added during bilateral linking
    nodes = nodes.map(node => ({
        ...node,
        directLink: [...new Set(node.directLink)],
        relatedLink: [...new Set(node.relatedLink)]
    }));

    // Update map
    let updatedMap = { ...map, nodes };

    // Return
    return updatedMap;
}

module.exports = sanizizeMapLinks;