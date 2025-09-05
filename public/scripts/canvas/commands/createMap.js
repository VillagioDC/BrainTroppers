// CANVAS MODULES
// CREATE NEW MAP

// Import modules
import { checkQuery } from '../utils/validade.js';
import { removeNewMapContainer } from '../interface/newMap.js';
import { showNotification, removeNotification } from '../../common/notifications.js';
import { createMapApi } from './createMapApi.js';
import { assignMapToUserApi } from './assignMapToUserApi.js';
import { createMapItem, setActiveMapItem } from '../interface/mapList.js';
import { setLocalStorageUser } from '../../common/userLocalStorage.js';

// Create new map
export async function createNewMap() {
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
    await showNotification('Processing...', 'info', 'wait');
    // Create map
    const map = await createMapApi(query);
    // Remove temp node (placeholder)
    deleteFirstNode(placeholderNodeId);
    // Place new map
    if (map) {
        // Set data
        braintroop.setMap(map);
        // Create map item
        await createMapItem(map);
        // Set new map item as active
        setActiveMapItem(map.projectId);
        // Add map to user as owner
        const updatedUser = await assignMapToUserApi( {map, assignedUserId: map.owner } );
        // Update user on local storage
        setLocalStorageUser(updatedUser);
    }
    // Remove notification
    removeNotification();
}

// Add first node (placeholder)
function addFirstNode() {
    // Add first node (placeholder)
    const parentId = 1;
    const shortName = "New map";
    // Add temp node (create, update)
    braintroop.addTempNode({parentId, shortName});
    return parentId;
}

// Delete first node (placeholder)
function deleteFirstNode(id) {
    // Delete node (placeholder)
    braintroop.deleteNode(id);
}