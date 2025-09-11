// CANVAS MODULE
// MAXIMIZE AND MINIMIZE NODE MODULE

// Import modules
import { updateNode } from './updateNode.js';
import { toggleNodeToolsButtons } from '../interface/nodeToolsMenu.js';

export async function maximizeNode(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Node id
    const nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.warn('No node selected'); return; }
    // Maximize node
    braintroop.maximizeNode(nodeId);
    // Update node
    const changes = { nodeId, maximized: true };
    await updateNode(changes);
    // Toggle node tools
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (node) {
        toggleNodeToolsButtons(node);
    }
}

export async function minimizeNode(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Node id
    const nodeId = braintroop.selected.id;
    if (!nodeId) { console.warn('No node selected'); return; }
    // Mimimize node
    braintroop.minimizeNode(nodeId);
    // Update node
    const changes = { nodeId, maximized: false };
    await updateNode(changes);
    // Toggle node tools
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    if (node) {
        toggleNodeToolsButtons(node);
    }
}