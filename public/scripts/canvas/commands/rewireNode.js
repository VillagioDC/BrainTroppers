// CANVAS MODULES
// REWIRE NODE MODULE

// Import modules
import { rewireNodeApi } from './rewireNodeApi.js'
import { showNotification, removeNotification } from '../../common/notifications.js';

// Rewire node
export async function rewireNode() {
    // Get selected node Id
    const nodeId = braintroop.selected.id;
    // Show notification
    await showNotification('Processing...', 'info', 'wait');
    // Submit query to rewire node
    const updatedMap = await rewireNodeApi( {nodeId} );
    if (updatedMap) {
        // Set data
        braintroop.setData(updatedMap);
    }
    // Remove notification
    removeNotification();
}