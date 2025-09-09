// CANVAS MODULES
// REWIRE NODE MODULE

// Import modules
import { updateMapApi } from '../apis/updateMapApi.js';
import { rewireNodeApi } from '../apis/rewireNodeApi.js';
import { updateMapGetStatus } from '../poolling/updateMapGetStatus.js';
import { pauseS } from '../utils/pauseS.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

// Rewire node
export async function rewireNode(e) {
    // Get selected node Id
    const nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.error('No node selected'); return; }
    // Show notification
    await showNotification('Requesting...', 'info', 'wait');
    // Save current map
    const currentMap = braintroop.getBackendMap();
    let updatedMap = await updateMapApi(currentMap);
    // Check error requesting map
    if (!updatedMap || typeof updatedMap !== 'object') {
        // Show error notification
        showNotification('Error creating node', 'error');
        return;
    }
    // Submit query to rewire node
    const response = await rewireNodeApi({nodeId});
    // Check error requesting map
    if (!response || typeof response !== 'object' || !response.statusCode || response.statusCode !== 202) {
        // Show error notification
        showNotification('Error rewiring node', 'error');
        return;
    };
    // Get projectId
    const projectId = braintroop.getProjectId();
    // Pooling node
    await showNotification('Rewiring...', 'info', 'wait');
    await pauseS(40);
    let creationStatus = 'creating';
    updatedMap = {};
    while (creationStatus === 'creating') {
        // Call api
        updatedMap = await updateMapGetStatus(projectId);
        // Check status
        if (updatedMap && updatedMap.creationStatus) {
            creationStatus = updatedMap.creationStatus;
        }
        // Wait
        await pauseS(15);
    }
    // Update node
    if (updatedMap && updatedMap.creationStatus === 'created') {
        // Set map
        braintroop.setMap(updatedMap);           
        // Remove notification
        removeNotification();
    } else {
        // Show error notification
        showNotification('Error creating node', 'error');
        // Restore map creation status
        await updateMapApi(currentMap);
    }
}