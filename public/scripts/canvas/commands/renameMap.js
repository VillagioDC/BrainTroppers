// CANVAS MODULES
// RENAME MAP MODULE

// Import modules
import { removeMapMenu } from '../interface/mapListPopup.js';
import { renameMapApi } from '../apis/renameMapApi.js';
import { showNotification, removeNotification } from '../../common/notifications.js';

// Rename map
export async function renameMap(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get current map item
    const mapList = document.getElementById('map-list');
    const popupMapMenu = document.getElementById('map-menu-popup');
    const projectId = popupMapMenu.dataset.projectId;
    const currentMapItem = mapList.querySelector(`[data-project-id="${projectId}"]`);
    // Remove map menu
    removeMapMenu();
    // Load rename map html
    await loadRenameMapPopup();
    // Bind event listeners
    bindRenameMapListeners();
    // Set title popup and input
    setRenameTitle(currentMapItem);
}

// Load rename map html
async function loadRenameMapPopup() {
    try {
        const response = await fetch('./snippets/rename-title.html');
        if (!response.ok) throw new Error('Failed to load rename-title.html');
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading rename map popup:', error);
    }
}

// Bind event listeners
function bindRenameMapListeners() {
    // Rename confirm
    if (document.getElementById('rename-title-confirm'))
        document.getElementById('rename-title-confirm').addEventListener('click', renameConfirm);
    // Rename cancel
    if (document.getElementById('rename-title-cancel'))
        document.getElementById('rename-title-cancel').addEventListener('click', renameCancel);
    // Outside click handler
    document.addEventListener('click', outsideRenameMapClickHandler);
    // Escape key handler
    document.addEventListener('keydown', escapeKeyHandler);
}

// Set rename title popup and input
function setRenameTitle(currentMapItem) {
    // Fill existing title
    const currentTitle = currentMapItem.querySelector('.map-title').textContent;
    const titleInput = document.getElementById('rename-title-input');
    if (!titleInput || !currentTitle) return;
    titleInput.value = currentTitle.trim();
    // Position popup near clicked button
    const buttonRect = currentMapItem.getBoundingClientRect();
    const popup = document.getElementById('rename-title-popup');
    if (!popup) return;
    popup.style.top = `${buttonRect.bottom + window.scrollY - 45}px`;
    // Focus
    titleInput.focus();
}

// Rename confirm
async function renameConfirm(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); };
    // Get input value
    const input = document.getElementById('rename-title-input');
    if (!input) return;
    const newTitle = input.value.trim();
    if (newTitle) {
        // Show notification
        await showNotification('Processing', 'info', 'wait');
        // Update title on database
        const updatedMap = await renameMapApi(newTitle);
        // Update title on canvas
        if (updatedMap) {
            // Set map
            braintroop.setMap(updatedMap);
            // Update map title on sidebar
            const projectId = updatedMap.projectId;
            const mapList = document.getElementById('map-list');
            const currentMapItem = mapList.querySelector(`[data-project-id="${projectId}"]`);
            const titleElement = currentMapItem.querySelector('.map-title');
                if (titleElement) {
                    titleElement.textContent = newTitle;
        }}
        // Remove notification
        removeNotification();
    }
    // Remove popups
    removeRename();
}

// Rename cancel
function renameCancel() {
    // Clean input
    const input = document.getElementById('rename-title-input');
    input.value = '';
    // Remove rename popup
    removeRename();
}

// Remove rename popup
function removeRename() {
    // Remove event listeners
    if (document.getElementById('rename-title-confirm'))
        document.getElementById('rename-title-confirm').removeEventListener('click', renameConfirm);
    if (document.getElementById('rename-title-cancel'))
        document.getElementById('rename-title-cancel').removeEventListener('click', renameCancel);
    document.removeEventListener('click', outsideRenameMapClickHandler);
    document.removeEventListener('keydown', escapeKeyHandler);
    // Remove popup container
    if (document.getElementById('rename-title-popup'))
        document.getElementById('rename-title-popup').remove();
}

// Outside click handler
function outsideRenameMapClickHandler(e) {
    if (!document.getElementById('rename-title-popup') || !document.getElementById('rename-title-popup').contains(e.target)) {
        removeRename();
    }
}

// Escape key handler
function escapeKeyHandler(e) {
    if (e.key === 'Escape') {
        removeRename();
    }
}