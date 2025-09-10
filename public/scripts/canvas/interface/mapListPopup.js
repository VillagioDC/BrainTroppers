// CANVAS MODULES
// MAP LIST POPUP MODULE

// Import modules
import { renameMap } from '../commands/renameMap.js';
import { cloneMap } from '../commands/cloneMap.js';
import { exportDocxMap, exportPngMap, exportPdfMap } from '../commands/exportMap.js';
import { shareMap } from '../commands/shareMap.js';
import { deleteMap } from '../commands/deleteMap.js';

// Popup map menu
export async function popupMapMenu(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    // Remove existing map menus
    await removeMapMenu();
    // Get current map item
    const currentMapItem = e.currentTarget.closest('.map-item');
    // Show menu
    await loadMapMenu(currentMapItem);
    // Bind event listeners
    bindMapPopupMenuListeners();
    // Filter map if not active
    if (!currentMapItem.classList.contains('active')) {
        // Remove export to Png item
        removeExportToPngItem();
    }
    // Show pop menu
    if (document.getElementById('map-menu-popup'))
        document.getElementById('map-menu-popup').style.display = 'block';
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
    // Rename
    if (document.getElementById('map-item-rename'))
        document.getElementById('map-item-rename').addEventListener('click', renameMap);
    // Clone
    if (document.getElementById('map-item-clone'))
        document.getElementById('map-item-clone').addEventListener('click', cloneMap);
    // Export PDF
    if (document.getElementById('map-item-pdf'))
        document.getElementById('map-item-pdf').addEventListener('click', exportPdfMap);
    // Export DOC
    if (document.getElementById('map-item-docx'))
        document.getElementById('map-item-docx').addEventListener('click', exportDocxMap);
    // Export PNG
    if (document.getElementById('map-item-image'))
        document.getElementById('map-item-image').addEventListener('click', exportPngMap);
    // Share
    if (document.getElementById('map-item-share'))
        document.getElementById('map-item-share').addEventListener('click', shareMap);
    // Delete
    if (document.getElementById('map-item-delete'))
        document.getElementById('map-item-delete').addEventListener('click', deleteMap);
    // Add outside click handler
    document.addEventListener('click', outsideClickHandler);
    // Escape key handler
    document.addEventListener('keydown', keydownHandler);
}

function removeExportToPngItem() {
    // Remove event listeners
    if (document.getElementById('map-item-image'))
        document.getElementById('map-item-image').removeEventListener('click', exportPngMap);
    // Remove html
    if (document.getElementById('map-item-image'))
        document.getElementById('map-item-image').remove();
}

// Remove map menu HTML
export async function removeMapMenu() {
    // Remove event listeners from map menu items
    if (document.getElementById('map-item-rename'))
        document.getElementById('map-item-rename').removeEventListener('click', renameMap);
    if (document.getElementById('map-item-clone'))
        document.getElementById('map-item-clone').removeEventListener('click', cloneMap);
    if (document.getElementById('map-item-pdf'))
        document.getElementById('map-item-pdf').removeEventListener('click', exportPdfMap);
    if (document.getElementById('map-item-docx'))
        document.getElementById('map-item-docx').removeEventListener('click', exportDocxMap);
    if (document.getElementById('map-item-image'))
        document.getElementById('map-item-image').removeEventListener('click', exportPngMap);
    if (document.getElementById('map-item-share'))
        document.getElementById('map-item-share').removeEventListener('click', shareMap);
    if (document.getElementById('map-item-delete'))
        document.getElementById('map-item-delete').removeEventListener('click', deleteMap);
    // Outside click handler
    document.removeEventListener('click', outsideClickHandler);
    // Escape key handler
    document.removeEventListener('keydown', keydownHandler);
    // Remove popup container
    if (document.getElementById('map-menu-popup'))
        document.getElementById('map-menu-popup').remove();
}

// Outside click handler
function outsideClickHandler(e) {
    const mapMenuPopup = document.getElementById('map-menu-popup');
    if (!mapMenuPopup || !mapMenuPopup.contains(e.target)) {
        removeMapMenu();
    }
}

// Escape key handler
function keydownHandler(e) {
    if (e.key === 'Escape') {
        removeMapMenu();
    }
}