// CANVAS MODULE
// EXPORT MAP MODULE

// Import modules
import { exportMapToPng } from './exportMapToPng.js';
import { exportMapApi } from '../apis/exportMapApi.js';
import { removeMapMenu } from '../interface/mapListPopup.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

// Export map handlers
export async function exportPngMap(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get projectId
    const popupMapMenu = document.getElementById('map-menu-popup');
    const projectId = popupMapMenu.dataset.projectId;
    if (!projectId) { console.error('Missing project'); return; }
    // Get project title
    const mapList = document.getElementById('map-list');
    const currentMapItem = mapList.querySelector(`[data-project-id="${projectId}"]`);
    const currentTitle = currentMapItem.querySelector('.map-title').textContent;
    if (!currentTitle) return;
    // Construct filename
    const filename = currentTitle.replace(/\s+/g, '_') + ".png";
    await exportMapToPng(filename);
}

export async function exportPdfMap(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    await exportMap({type: 'pdf'});
}
export async function exportDocxMap(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    await exportMap({type: 'docx'});
}

async function exportMap({type}) {
    // Check input
    if (!type) return;
    // Get menu map project id
    const popupMapMenu = document.getElementById('map-menu-popup');
    const projectId = popupMapMenu.dataset.projectId;
    if (!projectId) { console.error('Missing project'); return; }
    // Remove map menu
    removeMapMenu();
    // Show notification
    await showNotification('Exporting', 'info', 'wait');
    // Remove notification
    removeNotification();
    // Export map
    const result = await exportMapApi(projectId, type);
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
    // Process url
}