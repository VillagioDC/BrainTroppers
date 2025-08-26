// CANVAS MODULES
// MAP LIST MODULE

// Import modules
import { getLocalStorageUser } from '../../common/userLocalStorage.js';
import { loadMapApi } from '../commands/loadMapApi.js';
import { popupMapMenu } from './mapListPopup.js';

// Map list
(async function() {
    // On load
    await initMapList();
})();

// Init map list
async function initMapList() {
    // Read local storage user
    const user = getLocalStorageUser();
    if (!user || !user.maps || user.maps.length === 0) return;
    // Load map item HTML
    const html = await loadMapItemHtml();
    if (!html) return;
    // Place map item on canvas
    placeMapItem(user.maps, html);
    // Add event listeners
    bindMapItemEvents();
}

// Load map item HTML
async function loadMapItemHtml() {
    try {
        const response = await fetch('./src/snippets/map-item.html');
        if (!response.ok) throw new Error('failed to load map-item.html');
        const html = await response.text();
        return html;
    } catch (error) {
        console.error('Error loading map item:', error);
    }
}

// Place map item on sidebar map <ul>
function placeMapItem(maps, html) {
    // Parent element <ul>
    const mapUL = document.getElementById('map-list');
    // Sort maps by lastUpdate (most recent first)
    const sortedMaps = maps.sort((a, b) => {
        // Handle missing or invalid lastUpdate
        const dateA = a.lastUpdate ? new Date(a.lastUpdate) : new Date(0);
        const dateB = b.lastUpdate ? new Date(b.lastUpdate) : new Date(0);
        // Check if dates are valid
        if (isNaN(dateA.getTime())) dateA.setTime(0);
        if (isNaN(dateB.getTime())) dateB.setTime(0);            
        // Sort in descending order (most recent first)
        return dateB.getTime() - dateA.getTime();
    });
    // Place sorted maps
    sortedMaps.forEach(map => {
        // Check for required properties
        if (!map.title || !map.projectId) {
            console.warn('Map item missing title or projectId:', map);
            return;
        }
        // Replace map title
        let mapItemHtml = html.replace('{{Title}}', map.title);
        // Replace map id
        mapItemHtml = mapItemHtml.replace('{{projectId}}', map.projectId);
        // Insert HTML
        mapUL.insertAdjacentHTML('beforeend', mapItemHtml);
    });
}

// Add event listeners
function bindMapItemEvents() {
    // Elements
    const mapItems = document.querySelectorAll('.map-item');
    const mapItemsBtns = document.querySelectorAll('.map-menu-btn');
    // Event listeners
    mapItems.forEach(map => {map.addEventListener('click', loadMap);});
    mapItemsBtns.forEach(btn => {btn.addEventListener('click', popupMapMenu);});
}

// Load map
export async function loadMap(e) {
    const projectId = e.target.closest('.map-item').dataset.projectId;
    // Remove existing map menus on canvas
    braintroop.removeMap();
    // Load map on database
    const map = await loadMapApi(projectId);
    if (!map || typeof map !== 'object') return;
    // Set map on local storage
    setLocalStorageMap(map);
    // Set map on canvas
    braintroop.setMap(map);
}

// Create map item on sidebar
export async function createMapItem(newMap) {
    // Check map
    if (!newMap) return;
    // Fetch HTML
    const raw = await fetch('./src/snippets/map-item.html')
    // Replace map title
    const html = raw.replace('{{Title}}', newMap.title);
    // Keep projectId as placeholder for later substitution
    // Insert HTML on sidebar map ul
    const mapList = document.getElementById('map-list');
    mapList.insertAdjacentHTML('afterbegin', html);
}

// Set map item as active
export function setActiveMapItem(projectId) {
    // Remove all active map items
    const activeMaps = document.querySelectorAll('.map-item.active');
    if (activeMaps) return;
        activeMaps.forEach(mapItem => mapItem.classList.remove('active'));
    // Set active map item
    const mapItem = document.querySelector(`[data-project-id="${projectId}"]`);
    if (mapItem) mapItem.classList.add('active');
}

// Remove map from map list
export async function removeMapFromMapList(projectId) {
    const mapList = document.getElementById('map-list');
    if (!mapList) return;
    // Elements
    const mapItem = mapList.querySelector(`[data-project-id="${projectId}"]`);
    const mapItemBtn = mapItem.querySelector('.map-menu-btn');
    // Remove event listeners
    if (mapItem) mapItem.removeEventListener('click', loadMap);
    if (mapItemBtn) mapItemBtn.removeEventListener('click', popupMapMenu);
    // Remove map item
    if (mapItem) mapItem.remove();
}