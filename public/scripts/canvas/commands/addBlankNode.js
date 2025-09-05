// CANVAS MODULES
// ADD BLANK NODE MODULE

// Import modules
import { openDetailPopup } from './detailNode.js';

// Add blank node to selected node
export async function addBlankNode() {
    // Get selected node Id
    const parentId = braintroop.selected.id;

    // Add blank node
    const blankNode = {
        parentId,
        shortName: "New node",
        content: "",
        detail: ""
    }
    // Add blank node to canvas
    braintroop.addNode(blankNode);
    // Open detail popup
    openDetailPopup();
}