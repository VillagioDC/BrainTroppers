// CANVAS MODULES
// CREATE NEW MAP

// Import modules
import { checkQuery } from '../utils/validade.js';
import { removeNewMapContainer } from '../interface/newMap.js';
import { showNotification, removeNotification } from '../../common/notifications.js';
import { createMapApi } from './createMapApi.js';
import { setLocalStorageMap } from '../utils/mapLocalStorage.js';
import { createMapItem, setActiveMapItem } from '../interface/mapList.js';

// Create new map
export async function createNewMap() {
    // Element
    const queryEl = document.getElementById('map-new-query');
    // Check query
    const query = checkQuery(queryEl);
    // Check query
    if (query) {
        // Add first node (temporary)
        const tempNodeId = addFirstNode();
        // Close new map container
        removeNewMapContainer();
        // Show notification
        await showNotification('Processing...', 'info', 'wait');
        // Create map
        const newMap = await createMapApi(query);
        // Remove temp node
        deleteFirstNode(tempNodeId);
        // Place new map
        if (newMap) {
            // Set local storage
            setLocalStorageMap(newMap);
            // Set data
            braintroop.setData();
            // Create map item
            await createMapItem(newMap);
            // Set new map item as active
            setActiveMapItem(newMap.projectId);
        }
        // Remove notification
        removeNotification();
    }
}

// Add first node (temporary)
function addFirstNode() {
    // Add first node    
    const id = `node-${Date.now()}`;
    const shortName = "Creating...";
    const x = braintroop.canvas.offsetWidth;
    const y = braintroop.canvas.offsetHeight;
    braintroop.addNode({ id, shortName, x, y});
    return id;
}

// Delete first node
function deleteFirstNode(id) {
    braintroop.deleteNode(id);
}