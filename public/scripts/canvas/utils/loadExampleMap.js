// CANVAS MODULES
// LOAD EXAMPLE MAP MODULE

// Import modules

(async function() {

    // Load example map JSON
    const exampleMap = await loadExampleMapJson();
    // Update map on canvas
    braintroop.setMap(exampleMap);

})();

// Load example map JSON
async function loadExampleMapJson() {
    const json = await fetch('./data/exampleMap.json');
    return json.json();
}