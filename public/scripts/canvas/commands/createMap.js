// CANVAS MODULES
// CREATE NEW MAP

// Import modules
import { checkQuery } from '../utils/validate.js';
import { newMapClick, removeNewMapContainer } from '../interface/newMap.js';
import { showNotification, removeNotification } from '../../common/notifications.js';
import { createMapApi } from '../apis/createMapApi.js';
import { createMapGetStatus } from '../poolling/createMapGetStatus.js';
import { assignMapToUserApi } from '../apis/assignMapToUserApi.js';
import { deleteMapApi } from '../apis/deleteMapApi.js';
import { createMapItem, setActiveMapItem } from '../interface/mapList.js';
import { setLocalStorageUser } from '../../common/userLocalStorage.js';
import { pauseS } from '../utils/pauseS.js';

// Create new map
export async function createNewMap(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Element
    const queryEl = document.getElementById('map-new-query');
    if (!queryEl) { console.error('Missing query element'); return; };
    // Check query
    const query = checkQuery(queryEl);
    if (!query) return;
    // Add first node (placeholder)
    const placeholderNodeId = addFirstNode();
    // Close new map container
    removeNewMapContainer();
    // Show notification
    await showNotification('Requesting', 'info', 'wait');
    // Request creation of map
    const reqMap = await createMapApi(query);
    // Check error requesting map
    if (!reqMap || typeof reqMap !== 'object') {
        // Remove temp node (placeholder)
        deleteFirstNode(placeholderNodeId);
        // Show error notification
        showNotification('Error creating map', 'error');
        return;
    };
    // Pooling map
    await showNotification('Creating', 'info', 'wait');
    await pauseS(40);
    let creationStatus = 'creating';
    let result = {};
    while (creationStatus === 'creating') {
        // Call api
        result = await createMapGetStatus(reqMap.projectId);
        // Check result {status, user, map}
        if (result && result.status) {
            creationStatus = result.status;
        }
        // Pause
        if (creationStatus === 'creating') await pauseS(15);
    }
    // Remove temp node (placeholder)
    deleteFirstNode(placeholderNodeId);
    // Check result
    if (!result || typeof result !== 'object' || !result.user || !result.map || result.status === 'failed') {
        // Update notification
        showNotification('Error creating map', 'error');
        // Remove map on database
        if (result.map.creationStatus === 'failed') await deleteMapApi(reqMap.projectId);
        // Get back to new map container
        await newMapClick(null);
        return;
    }
    // Update user
    const user = result.user;
    setLocalStorageUser(user);
    // Remove new map container
    removeNewMapContainer();
    // Update map
    const newMap = result.map;
    // Update map list
    await createMapItem(newMap);
    // Set map on canvas
    braintroop.setMap(newMap);
    // Rebuild map 
    braintroop.rebuildMap();
    // Fit map to canvas
    braintroop.zoomFit();
    // Set active map item
    setActiveMapItem(newMap.projectId);
    // Remove notification
    removeNotification();
}

// Add first node (placeholder)
function addFirstNode() {
    // Add first node (placeholder)
    const parentId = 1;
    const shortName = "New map";
    // Add temp node (create, update)
    const nodeId = braintroop.addTempNode({parentId, shortName});
    return nodeId;
}

// Delete first node (placeholder)
function deleteFirstNode(id) {
    // Delete node (placeholder)
    braintroop.deleteNode(id);
}