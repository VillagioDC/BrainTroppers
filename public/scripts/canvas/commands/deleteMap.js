2// CANVAS MODULES
// DELETE MAP MODULE

// Import modules
import { removeMapFromMapList } from '../interface/mapList.js';
import { deleteMapApi } from '../apis/deleteMapApi.js';
import { showNotification, removeNotification } from '../../common/notifications.js'
import { removeMapMenu } from '../interface/mapListPopup.js';

// Delete map
export async function deleteMap(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get map id
    const mapPopup = document.getElementById('map-menu-popup');
    const projectId = mapPopup.dataset.projectId;
    // Remove map menu
    removeMapMenu();
    // Show notification
    showNotification('Processing', 'info', 'wait');
    // Delete map on database
    const result = await deleteMapApi(projectId);
    // Show notification
    if (result && result.error) {
        showNotification('Error deleting map', 'error');
        return;
    }
    // Remove map on map list
    removeMapFromMapList(projectId);
    // Remove map if is current map
    if (braintroop.projectId === projectId) {
        // Remove map on canvas
        braintroop.removeMap();
        // Start new map
        const newMapBtn = document.getElementById('new-map-btn');
        if (newMapBtn) newMapBtn.click();
    }
    // Remove notification
    removeNotification();
}