2// CANVAS MODULES
// DELETE MAP MODULE

// Import modules
import { removeMapFromMapList } from '../interface/mapList.js';
import { deleteMapApi } from './deleteMapApi.js';
import { showNotification } from '../../common/notifications.js'
import { removeMapMenu } from '../interface/mapListPopup.js';

// Delete map
export async function deleteMap() {
    // Get map id
    const mapPopup = document.getElementById('map-menu-popup');
    const projectId = mapPopup.dataset.projectId;
    // Remove map if is current map
    if (braintroop.projectId === projectId) {
        // Remove map on canvas
        braintroop.removeMap();
        // Start new map
        const newMapBtn = document.getElementById('new-map-btn');
        if (newMapBtn) newMapBtn.click();
    }
    // Remove map on map list
    removeMapFromMapList(projectId);
    // Delete map on database
    const result = await deleteMapApi(projectId);
    // Show notification
    if (result && result.error)
        showNotification(result.error, 'error');
    if (result && result.message)
        showNotification(result.message, 'success');
    // Remove map menu
    removeMapMenu();
}