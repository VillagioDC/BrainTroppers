// CANVAS MODULES
// SHARE MAP MODULE

// Import modules
import { removeMapMenu } from '../interface/mapListPopup.js';

// Share map
export function shareMap(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get current map item
    const mapPopup = document.getElementById('map-menu-popup');
    const projectId = mapPopup.dataset.projectId;
    // Remove map menu
    removeMapMenu();
    // Show notification
    showNotification('Coming soon', 'info', 'wait');
    // Implement share functionality
}