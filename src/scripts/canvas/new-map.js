// CANVAS
// NEW MAP SCRIPT

window.initNewMap = function() {
    // Elements
    const newMapBtn = document.getElementById("new-map-btn");

    // Click on new map
    newMapBtn.addEventListener("click", addNewMap);

    // Add new map
    function addNewMap() {
        // Implement new map functionality
        console.log("+ New map clicked");
    }
}