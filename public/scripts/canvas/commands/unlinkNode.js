// CANVAS MODULES
// UNLINK NODE MODULE

// Import modules
import { unlinkNodeApi } from "../apis/unlinkNodeApi.js";
import { removeLinkToolsMenu } from "../interface/linkToolsMenu.js";
import { showNotification, removeNotification } from "../../common/notifications.js";

export async function unlinkNode(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get selected edge
    const selectedEdgeId = braintroop.getSelectedEdgeId();
    if (!selectedEdgeId) { console.warn("No edge selected"); return; }
    const edge = braintroop.map.edges.find(e => e.id === selectedEdgeId)
    if (!edge) { console.warn("Edge not found"); return; }

    // Show notification
     await showNotification('Processing', 'info', 'wait');

    // Delete link on DB
    const projectId = braintroop.getProjectId();
    const nodeFrom = braintroop.map.nodes.find(n => n.nodeId === edge.source);
    const nodeTo = braintroop.map.nodes.find(n => n.nodeId === edge.target);
    const updatedMap = await unlinkNodeApi({projectId, nodeIdFrom: nodeFrom.nodeId, nodeIdTo: nodeTo.nodeId});

    // Delete the edge
    if (updatedMap)
        braintroop.deleteEdge(selectedEdgeId);

    // Remove notification
    removeNotification();
    // Close menu after action
    removeLinkToolsMenu();
}