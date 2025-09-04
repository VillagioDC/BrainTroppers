// CANVAS MODULE
// HIDE AND SHOW NODE MODULE

// Import modules
import { updateNode } from './updateNode.js';
import { toggleNodeToolsButtons } from './nodeToolsMenu.js';

export async function hideNode() {
    // Node id
    const nodeId = braintroop.selected.id;
    if (!nodeId) { console.warn('No node selected'); return; }
    // Hide node
    braintroop.hideNode(nodeId);
    // Update node
    const changes = { nodeId, hidden: true };
    await updateNode(changes);
    // Toggle node tools
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (node) {
        toggleNodeToolsButtons(node);
    }
}

export async function unhideNode() {
    // Node id
    const nodeId = braintroop.selected.id;
    if (!nodeId) { console.warn('No node selected'); return; }
    // Show node
    braintroop.unhideNode(nodeId);
    // Update node
    const changes = { nodeId, hidden: false };
    await updateNode(changes);
    // Toggle node tools
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (node) {
        toggleNodeToolsButtons(node);
    }
}