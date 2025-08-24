// CANVAS
// LOAD EXAMPLE MAP SCRIPT

(function() {

    // Load example map
    async function loadExampleMap() {
        // Load example map JSON
        const exampleMap = await loadExampleMapJson();
        // Set map on local storage
        if (exampleMap) setLocalStorageMap(exampleMap);
        map = localStorage.getItem('braintroop-map');
        if (!map) return;
        // Update map on canvas
        braintroop.setMap(map);
    }

    // Load new map container
    async function loadExampleMapJson() {
        const json = await fetch('./src/data/exampleMap.json');
        return json.json();
    }

    // On load
    loadExampleMap();

})();