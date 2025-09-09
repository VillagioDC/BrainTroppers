// CANVAS MODULE
// EXPORT MAP MODULE

// Import modules
import { exportMapApi } from '../apis/exportMapApi.js';
import { removeMapMenu } from '../interface/mapListPopup.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

export async function exportMap({type}) {
    // Check input
    if (!type) return;
    // Get menu map project id
    const popupMapMenu = document.getElementById('map-menu-popup');
    const projectId = popupMapMenu.dataset.projectId;
    if (!projectId) { console.error('Missing project'); return; }
    // Remove map menu
    removeMapMenu();
    // Show notification
    await showNotification('Exporting...', 'info', 'wait');
    // Export map
    const result = await exportMapApi({projectId, type});
    // Check result
    if (!result || typeof result !== 'object') {
        showNotification('Error exporting map', 'error');
        return;
    }
    // Get download url
    const downloadUrl = result.downloadUrl;
    // Check url
    if (!downloadUrl) {
        showNotification('Export failed', 'error');
        return;
    }
    // Open url in new tab
    window.open(downloadUrl, '_blank');
    // Remove notification
    removeNotification();
}
