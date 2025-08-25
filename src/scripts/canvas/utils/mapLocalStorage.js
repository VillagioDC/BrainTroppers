// CANVAS
// MAP LOCAL STORAGE MODULES

// Read local storage map
export function getLocalStorageMap() {
    if (!localStorage.getItem('braintroop-map')) return;
    return JSON.parse(localStorage.getItem('braintroop-map'));
}

// Set local storage map
export function setLocalStorageMap(map) {
    // Validate map object
    if (!map || typeof map !== 'object') {
        console.error('Invalid map object for local storage');
        return;
    }
    // Store map object in local storage
    localStorage.setItem('braintroop-map', JSON.stringify(map));
}

// Remove local storage map
export function removeLocalStorageMap() {
    localStorage.removeItem('braintroop-map');
}