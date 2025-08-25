// CANVAS MODULES
// NEW MAP CLICK MODULE

// Import modules

// New map button click
export async function newMapClick() {
        // Remove existing map from canvas
        removeExistingMap();
        // Load new map container
        if (newMapContainer) return;
        // Load new map container
        await loadNewMapContainer();
        // Focus on text area
        document.getElementById('map-new-query').focus();
    }
