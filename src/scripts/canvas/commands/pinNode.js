// CANVAS MODULE
// PIN AND UNPIN NODE MODULE

// Import modules
import { updateNode } from './updateNode.js';
import { toggleNodeToolsButtons } from './nodeToolsMenu.js';

export async function pinNode() {
    // Node id
    const nodeId = braintroop.selected.id;
    if (!nodeId) { console.warn('No node selected'); return; }
    // Lock node
    braintroop.lockNode(nodeId);
    // Update node
    const changes = { nodeId, locked: true };
    await updateNode(changes);
    // Toggle node tools
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (node)
        toggleNodeToolsButtons(node);
}

export async function unpinNode() {
    // Node id
    const nodeId = braintroop.selected.id;
    if (!nodeId) { console.warn('No node selected'); return; }
    // Unlock node
    braintroop.unlockNode(nodeId);
    // Update node
    const changes = { nodeId, locked: false };
    await updateNode(changes);
    // Toggle node tools
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (node)
        toggleNodeToolsButtons(node);
}