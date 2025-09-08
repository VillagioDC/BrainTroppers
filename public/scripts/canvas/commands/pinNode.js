// CANVAS MODULE
// PIN AND UNPIN NODE MODULE

// Import modules
import { updateNode } from './updateNode.js';
import { toggleNodeToolsButtons } from './nodeToolsMenu.js';

export async function pinNode() {
    // Node id
    const nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.warn('No node selected'); return; }
    // Lock node on canvas
    braintroop.lockNode(nodeId);
    // Update node on DB
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (!node) { console.warn('No node found'); return; }
    const changes = { nodeId, x: node.x, y: node.y, locked: true };
    await updateNode(changes);
    // Toggle node tools
    toggleNodeToolsButtons(node);
}

export async function unpinNode() {
    // Node id
    const nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.warn('No node selected'); return; }
    // Unlock node on canvas
    braintroop.unlockNode(nodeId);
    // Update node on DB
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (!node) { console.warn('No node found'); return; }
    const changes = { nodeId, locked: false };
    await updateNode(changes);
    // Toggle node tools
    toggleNodeToolsButtons(node);
}