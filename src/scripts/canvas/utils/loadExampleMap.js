// CANVAS MODULES
// LOAD EXAMPLE MAP MODULE

// Import modules
import { setLocalStorageMap, getLocalStorageMap } from './mapLocalStorage.js';

(async function() {

    // Load example map JSON
    const exampleMap = await loadExampleMapJson();
    // Set map on local storage
    if (exampleMap) setLocalStorageMap(exampleMap);
    const map = getLocalStorageMap();
    if (!map) return;
    // Update map on canvas
    braintroop.setMap(map);

})();

// Load example map JSON
async function loadExampleMapJson() {
    const json = await fetch('./src/data/exampleMap.json');
    return json.json();
}