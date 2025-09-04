// CANVAS MODULES
// UNLINK NODE MODULE

// Import modules
import { removeLinkToolsMenu } from "./linkToolsMenu.js";

export async function unlinkNode() {
    // Get selected edge
    const edgeId = braintroop.selected.id;
    if (!edgeId) { console.warn("No edge selected"); return; }
    const edge = braintroop.map.edges.find(e => e.id === edgeId);
    if (!edge) { console.warn("Edge not found in map"); return; }

    // Delete the edge
    braintroop.deleteEdge(edgeId);

    // Close menu after action
    removeLinkToolsMenu();
}