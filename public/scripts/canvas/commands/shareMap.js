// CANVAS MODULES
// SHARE MAP MODULE

// Import modules
import { removeMapMenu } from '../interface/mapListPopup.js';

// Share map
export function shareMap() {
    // Get current map item
    const mapPopup = document.getElementById('map-menu-popup');
    const projectId = mapPopup.dataset.projectId;
    // Remove map menu
    removeMapMenu();
    // Implement share functionality
    console.log('Share map clicked for:', projectId);
}