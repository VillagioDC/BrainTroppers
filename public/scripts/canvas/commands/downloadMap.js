// CANVAS MODULES
// DOWNLOAD MAP MODULE

// Import modules
import { removeMapMenu } from '../interface/mapListPopup.js';

// Download map
export function downloadMap() {
    // Get current map item
    const mapPopup = document.getElementById('map-menu-popup');
    const projectId = mapPopup.dataset.projectId;
    // Remove map menu
    removeMapMenu();
    // Implement download functionality
    console.log('Download map clicked for:', projectId);
}