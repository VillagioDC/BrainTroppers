// CANVAS MODULES
// NEW MAP MODULE

// Import modules
import { createNewMap } from '../commands/createMap.js';
import { getLocalStorageUser } from '../../common/userLocalStorage.js';

(function() {
    
    // Event listeners
    if (document.getElementById('new-map-btn'))
        document.getElementById('new-map-btn').addEventListener("click", newMapClick);

    // On load
    initNewMap();

})();

// Initialize function with new map container
async function initNewMap() {
    // Elements
    const newMapContainer = document.getElementById("new-map-container");
    // Prevent reloading new map container
    if (newMapContainer) return;
    // Prevent loading map container if there is a current map active
    const currentMap = braintroop.map;
    const activeMap = document.querySelector('.map-item.active');
    if (currentMap && currentMap.projectId && activeMap) return;
    // Load new map container
    await loadNewMapContainer();
}

// New map button click
export async function newMapClick(e) {
    e.preventDefault();
    // Remove existing map from canvas
    braintroop.deleteMap();
    // Prevent reloading new map container
    const newMapContainer = document.getElementById("new-map-container");
    if (newMapContainer) return;
    // Load new map container
    await loadNewMapContainer();
}

// Load new map container
async function loadNewMapContainer() {
    return await fetch('./src/snippets/map-new.html')
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
            // Bind new map events
            bindNewMapEvents();
            // Replace user name
            replaceUserNameOnNewMap();
            // Focus on text area
            document.getElementById('map-new-query').focus();
        });
}

// Bind new map events
function bindNewMapEvents() {
    // Elements
    const query = document.getElementById('map-new-query');
    const submit = document.getElementById('map-new-submit');
    // Event listeners
    if (query) query.addEventListener('input', ResizeTextArea);
    if (submit) submit.addEventListener('click', async (e) => {
        e.preventDefault();
        createNewMap();
    });
}

// Replace user name
function replaceUserNameOnNewMap() {
    // Element
    const newMapContainer = document.getElementById("new-map-container");
    const headline = newMapContainer.querySelector('h2');
    if (!headline) return;
    // Get user name
    const user = getLocalStorageUser();
    let name = '';
    if (user && user.name && typeof user.name === 'string' && user.name)
        name = ` ${user.name}`;
    // Replace user name
    headline.textContent = headline.textContent.replace(' {{username}}', name);
}

// Resize textarea
function ResizeTextArea() {
    // Element
    let textArea = document.getElementById('map-new-query');
    if (!textArea) return;
    // Resize
    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`;
}

// Remove new map container
export function removeNewMapContainer() {
    // Remove event listeners
    if (document.getElementById('map-new-query'))
        document.getElementById('map-new-query').removeEventListener('input', ResizeTextArea);
    if (document.getElementById('map-new-submit'))
        document.getElementById('map-new-submit').removeEventListener('click', createNewMap);
    // Remove new map container
    if (document.getElementById("new-map-container"))
        document.getElementById("new-map-container").remove();
}