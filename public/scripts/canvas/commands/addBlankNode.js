// CANVAS MODULES
// ADD BLANK NODE MODULE

// Import modules
import { addBlankNodeApi } from '../apis/addBlankNodeApi.js';
import { openDetailPopup } from './detailNode.js';

// Add blank node to selected node
export async function addBlankNode(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get selected node Id
    const parentId = braintroop.getSelectedNodeId();
    if (!parentId) { console.error('No node selected'); return; }

    // Add blank node
    const blankNode = {
        parentId,
        shortName: "New node",
        content: "",
        detail: ""
    }
    // Add blank node to canvas
    const newNodeId = braintroop.addNode(blankNode);
    // Select new node
    braintroop.selectElement({ nodeId: newNodeId });
    // Open detail popup
    openDetailPopup(newNodeId);
}

export async function addBlankdNodeHandler(nodeId) {
    // Check nodeId
    if (!nodeId) { console.warn('Missing node id'); return; };
    // Get new node
    const node = braintroop.map.nodes.find(n => n.nodeId === nodeId);
    // Construct new node
    const newNode = {
        nodeId: node.nodeId,
        shortName: node.shortName,
        content: node.content,
        detail: node.detail,
        directLink: [node.parentId],
        relatedLink: [],
        x: node.x,
        y: node.y,
        locked: false,
        approved: true,
        maximized: false,
        hidden: false,
        colorSchemeName: node.colorSchemeName,
    };
    // Create blank node on DB
    const updatedMap = await addBlankNodeApi({parentId: node.parentId, node: newNode});
    // Update node Id
    const newNodeId = updatedMap.nodes[updatedMap.nodes.length - 1].nodeId;
    braintroop.updateNodeInfo({nodeId: node.nodeId, newNodeId});
}