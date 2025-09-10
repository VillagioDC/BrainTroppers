// CANVAS MODULES
// DELETE NODE MODULE

// Import modules
import { deleteNodeApi } from '../apis/deleteNodeApi.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

// Delete node
export async function deleteNode(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get node id
    let nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.error('No node selected'); return; }
    // Show notification
    await showNotification('Processing', 'info', 'wait');
    // Delete node
    const updatedMap = await deleteNodeApi(nodeId);
    if (!updatedMap) {
        showNotification('Error deleting node', 'error');
        return null;
    };
    // Update canvas
    braintroop.deleteNode(nodeId);
    braintroop.updateMap(true);
    // Remove notification
    removeNotification();
}