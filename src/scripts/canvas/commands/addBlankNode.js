// CANVAS MODULES
// ADD BLACK NODE MODULE

// Import modules
import { removeNodeToolsMenu } from './nodeToolsMenu.js';

// Add blank node to selected node
export async function addBlankNode() {
    // Get parent node
    const nodeTools = document.getElementById('node-tools');
    if (nodeTools && nodeTools.dataset.selectedNode) {
        const parentId = nodeTools.dataset.selectedNode;
        // Add blank node
        const blankNode = {
            parentId,
            shortName: "New node",
            content: "",
            detail: ""
        }
        braintroop.addNode(blankNode);
    }
    // Remove node tools popup menu
    removeNodeToolsMenu();
}