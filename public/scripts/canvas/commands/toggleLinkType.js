// CANVAS MODULES
// TOGGLE LINK TYPE MODULE

// Import modules
import { toggleLinkTypeApi } from "../apis/toggleLinkTypeApi.js";
import { toggleLinkToolsButtons } from "./linkToolsMenu.js";
import { showNotification, removeNotification } from "../../common/notifications.js";

export async function toggleLinkType() {
    // Get selected edge
    const selectedEdgeId = braintroop.getSelectedEdgeId();
    if (!selectedEdgeId) { console.warn("No edge selected"); return; }
    const edge = braintroop.map.edges.find(e => e.id === selectedEdgeId)
    if (!edge) { console.warn("Edge not found"); return; }

    // Show notification
    await showNotification('Processing...', 'info', 'wait');

    // Update link type on DB
    const projectId = braintroop.getProjectId();
    const nodeFrom = braintroop.map.nodes.find(n => n.nodeId === edge.source);
    const nodeTo = braintroop.map.nodes.find(n => n.nodeId === edge.target);
    // Set new edge type
    const newEdgeType = edge.type === "direct" ? "related" : "direct";
    const updatedMap = await toggleLinkTypeApi({projectId, nodeIdFrom: nodeFrom.nodeId, nodeIdTo: nodeTo.nodeId, linkType: newEdgeType});

    // Toggle edge type to related
    if (updatedMap)
        braintroop.toggleEdgeType(edge.id);

    // Remove notification
    removeNotification();
    // Keep menu opened after action
    // Toggle edge tools
    toggleLinkToolsButtons(edge);
}