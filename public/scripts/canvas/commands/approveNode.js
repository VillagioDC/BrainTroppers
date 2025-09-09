// CANVAS MODULE
// APPROVE NODE MODULE

// Import modules
import { updateNode } from './updateNode.js';
import { toggleNodeToolsButtons } from '../interface/nodeToolsMenu.js';

export async function approveNode() {
    // Node id
    const nodeId = braintroop.selected.id;
    if (!nodeId) { console.warn('No node selected'); return; }
    // Get node
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);

    // Approve node
    if (node && !node.approved) {
        braintroop.approveNode(nodeId);
        // Update node
        const changes = { nodeId, approved: true };
        await updateNode(changes);
    // Revoke node approval
    } else {
        braintroop.revokeNode(nodeId);
        // Update node
        const changes = { nodeId, approved: false };
        await updateNode(changes);
    }
    // Toggle node tools
    toggleNodeToolsButtons(node);
}