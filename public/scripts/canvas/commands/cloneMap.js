// CANVAS MODULES
// CLONE MAP MODULE

// Import modules
import { removeMapMenu } from '../interface/mapListPopup.js';
import { cloneMapApi } from '../apis/cloneMapApi.js';
import { removeNewMapContainer } from '../interface/newMap.js';
import { createMapItem, setActiveMapItem } from '../interface/mapList.js';
import { setLocalStorageUser } from '../../common/userLocalStorage.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

// Share map
export async function cloneMap(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get current map item
    const mapPopup = document.getElementById('map-menu-popup');
    const projectId = mapPopup.dataset.projectId;
    // Remove map menu
    removeMapMenu();
    // Show notification
    showNotification('Processing', 'info', 'wait');
    // Call API to clone map - result: {user, map}
    const result = await cloneMapApi(projectId);
    // Check result
    if (!result || typeof result !== 'object' || !result.user || !result.map) {
        showNotification('Error cloning map', 'error');
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