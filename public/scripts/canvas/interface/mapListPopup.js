// CANVAS MODULES
// MAP LIST POPUP MODULE

// Import modules
import { renameMap } from '../commands/renameMap.js';
import { shareMap } from '../commands/shareMap.js';
import { downloadMap } from '../commands/downloadMap.js';
import { deleteMap } from '../commands/deleteMap.js';

// Popup map menu
export async function popupMapMenu(e) {
    e.stopPropagation();
    // Remove existing map menus
    await removeMapMenu();
    // Set current map item
    const currentMapItem = e.currentTarget.closest('.map-item');
    // Show menu
    await loadMapMenu(currentMapItem);
    bindMapPopupMenuListeners();
};

// Fetch and load map menu HTML
async function loadMapMenu(currentMapItem) {
    try {
        const response = await fetch('./snippets/map-menu-popup.html');
        if (!response.ok) throw new Error('Failed to load map-menu-popup.html');
        const raw = await response.text();
        // Replace map title
        const projectId = currentMapItem.dataset.projectId;
        const html = raw.replace('{{projectId}}', projectId);
        // Create popup container
        document.body.insertAdjacentHTML('beforeend', html);
        const mapMenuPopup = document.getElementById("map-menu-popup");
        // Position popup near the clicked button
        const buttonRect = currentMapItem.getBoundingClientRect();
        mapMenuPopup.style.top = `${buttonRect.bottom + window.scrollY - 45}px`;
        mapMenuPopup.style.left = `${buttonRect.right + window.scrollX}px`;
    // Catch errors
    } catch (error) {
        console.error('Error loading map menu:', error);
    }
}

// Add event listeners to map menu items
function bindMapPopupMenuListeners() {
    document.getElementById('map-item-rename').addEventListener('click', renameMap);
    document.getElementById('map-item-share').addEventListener('click', shareMap);
    document.getElementById('map-item-download').addEventListener('click', downloadMap);
    document.getElementById('map-item-delete').addEventListener('click', deleteMap);
    document.addEventListener('click', outsideClickHandler);
}

// Remove map menu HTML
export async function removeMapMenu() {
    // Remove event listeners from map menu items
    if (document.getElementById('map-item-rename'))
        document.getElementById('map-item-rename').removeEventListener('click', renameMap);
    if (document.getElementById('map-item-share'))
        document.getElementById('map-item-share').removeEventListener('click', shareMap);
    if (document.getElementById('map-item-download'))
        document.getElementById('map-item-download').removeEventListener('click', downloadMap);
    if (document.getElementById('map-item-delete'))
        document.getElementById('map-item-delete').removeEventListener('click', deleteMap);
    document.removeEventListener('click', outsideClickHandler);
    // Remove popup container
    if (document.getElementById('map-menu-popup'))
        document.getElementById('map-menu-popup').remove();
}

// Outside click handler
function outsideClickHandler(e) {
    const mapMenuPopup = document.getElementById('map-item-rename');
    if (!mapMenuPopup || !mapMenuPopup.contains(e.target)) {
        removeMapMenu();
    }
}