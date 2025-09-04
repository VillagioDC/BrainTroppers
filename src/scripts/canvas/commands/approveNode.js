// CANVAS MODULE
// APPROVE NODE MODULE

// Import modules
import { updateNode } from './updateNode.js';
import { toggleNodeToolsButtons } from './nodeToolsMenu.js';

export async function approveNode() {
    // Node id
    const nodeId = braintroop.selected.id;
    if (!nodeId) { console.warn('No node selected'); return; }
    // Approve node
    braintroop.approveNode(nodeId);
    // Update node
    const changes = { nodeId, approved: true };
    await updateNode(changes);
    // Toggle node tools
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (node)
        toggleNodeToolsButtons(node);
}

export async function unapproveNode() {
    // Node id
    const nodeId = braintroop.selected.id;
    if (!nodeId) { console.warn('No node selected'); return; }
    // Unnapprove node
    braintroop.unapproveNode(nodeId);
    // Update node
    const changes = { nodeId, approved: false };
    await updateNode(changes);
    // Toggle node tools
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (node)
        toggleNodeToolsButtons(node);
}