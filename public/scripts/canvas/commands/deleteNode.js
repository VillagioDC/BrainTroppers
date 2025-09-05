// CANVAS MODULES
// DELETE NODE MODULE

// Import modules
import { deleteNodeApi } from './deleteNodeApi.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

// Delete node
export async function deleteNode() {
    // Get node id
    let nodeId = braintroop.selected.type === 'node' ? braintroop.selected.id : null;
    if (!nodeId) { console.error('No node selected'); return; }
    // Show notification
    await showNotification('Processing...', 'info', 'wait');
    // Delete node
    const updatedMap = await deleteNodeApi(nodeId);
    if (!updatedMap) {
        showNotification('Error deleting node', 'error');
        return null;
    };
    // Update canvas
    braintroop.setMap(updatedMap);
    // Remove notification
    removeNotification();
}