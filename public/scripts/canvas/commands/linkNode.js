// CANVAS MODULES
// LINK TWO NODES MODULE

// Import modules
import { linkNodeApi } from '../apis/linkNodeApi.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

// Link node
export function linkNode(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Show notification
    showNotification('Select node', 'info', 'connect');
    // Link node
    braintroop.startConnection();
}

// End link command
export function endLinkCommand({nodeIdFrom, nodeIdTo}) {
    if (!nodeIdFrom || !nodeIdTo) {
        // Remove notification
        removeNotification();
        return;
    }
    // Handle new link
    handleNewLink(nodeIdFrom, nodeIdTo);
}

// Handle new link
async function handleNewLink(nodeIdFrom, nodeIdTo) {
    // Show notification
     await showNotification('Processing', 'info', 'wait');

    // Delete link on DB
    const projectId = braintroop.getProjectId();
    const updatedMap = await linkNodeApi({projectId, nodeIdFrom, nodeIdTo});
 
    // If error on database update
    if (!updatedMap) {
        showNotification('Error linking nodes', 'error');
        return;
    }
    // Remove notification
    removeNotification();
}