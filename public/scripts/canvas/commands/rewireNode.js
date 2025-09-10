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
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get selected node Id
    const nodeId = braintroop.getSelectedNodeId();
    if (!nodeId) { console.error('No node selected'); return; }
    // Show notification
    await showNotification('Requesting', 'info', 'wait');
    // Save current map
    const currentMap = braintroop.getBackendMap();
    const updatedMap = await updateMapApi(currentMap);
    // Check error requesting map
    if (!updatedMap || typeof updatedMap !== 'object') {
        // Show error notification
        showNotification('Error creating node', 'error');
        return;
    }
    // Submit query to rewire node
    const request = await rewireNodeApi({nodeId});
    // Check error requesting map
    if (!request || typeof request !== 'object' || !request.statusCode || request.statusCode !== 202) {
        // Show error notification
        showNotification('Error rewiring node', 'error');
        return;
    };
    // Get projectId
    const projectId = braintroop.getProjectId();
    // Pooling node
    await showNotification('Rewiring', 'info', 'wait');
    await pauseS(40);
    let creationStatus = 'creating';
    let result = {};
    while (creationStatus === 'creating') {
        // Call api
        result = await updateMapGetStatus(projectId);
        // Check status {status, user}
        if (result && result.status) {
            creationStatus = result.status;
        }
        // Wait
        if (creationStatus === 'creating') await pauseS(15);
    }
    // Update node
    if (result && result.map && creationStatus === 'created') {
        // Set map
        braintroop.setMap(result.map);           
        // Remove notification
        removeNotification();
    } else {
        // Show error notification
        showNotification('Error creating node', 'error');
        // Restore map creation status
        await updateMapApi(updatedMap);
    }
}