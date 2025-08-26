// CANVAS
// BRAINTROOP INTERNAL API MODULE

// Import modules
import { openNodeToolsMenu } from './nodeToolsMenu.js';

// Braintroop internal API
(function () {

    // Elements
    const canvas = document.querySelector('#canvas');

    // Event listeners
    if (canvas) canvas.addEventListener('select', (event) => {
        const { nodeId, edgeId } = event.detail;
        // If node only
        if (nodeId && !edgeId) {
            let selectedNode = window.braintroop.map.nodes.find(n => n.id === nodeId);
            // Call to action
            onNodeSelected(selectedNode);
        }
        // If edge only
        else if (edgeId && !nodeId) {
            let selectedEdge = window.braintroop.map.edges.find(e => e.id === event.detail.edgeId);
            // Call to action
            onEdgeSelected(selectedEdge);
        // If none or both
        } else {
            console.log('No element selected');
        }
    });
        
})();

// On node selected
async function onNodeSelected(node) {
    // Open node tools popup menu
    await openNodeToolsMenu(node);
}

// On edge selected
function onEdgeSelected(edge) {
    console.log('Selected Edge:', edge);
    // Open edge tools popup menu
    // Pending
}