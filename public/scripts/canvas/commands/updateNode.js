// CANVAS MODULES
// MAP NODE UPDATE MODULE

// Import modules
import { updateNodeApi } from '../apis/updateNodeApi.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

// Update map node
export async function updateNode(changes) {

    // Check node 
    if (!changes || !changes.nodeId) { console.error('Missing node'); return; }
    // Get map from local storage
    const map = braintroop.getBackendMap();
    if (!map) { console.error('Missing map'); return; }
    // Show notification
    showNotification('Processing', 'info', 'wait');
    // Get node from map
    const node = map.nodes.find(n => n.nodeId === changes.nodeId);
    // Update node
    const updatedNode = {
        nodeId: node.nodeId,
        shortName: changes.shortName || node.shortName,
        content: changes.content || node.content,
        detail: changes.detail || node.detail,
        directLink: changes.directLink || node.directLink,
        relatedLink: changes.relatedLink || node.relatedLink,
        x: changes.x || node.x,
        y: changes.y || node.y,
        locked: changes.locked || node.locked,
        approved: changes.approved || node.approved,
        hidden: changes.hidden || node.hidden,
        colorScheme: changes.colorScheme || node.colorScheme,
        layer: changes.layer || node.layer
    };
    // Update node on map
    const n = map.nodes.findIndex(n => n.nodeId === node.nodeId);
    map.nodes[n] = updatedNode;
    // Update node on database
    const updatedMap = await updateNodeApi(updatedNode);
    if (!updatedMap) {
        showNotification('Error updating node', 'error');
        return null;
    };
    // Remove notification
    removeNotification();
    // Return updated node
    return updatedNode;
}