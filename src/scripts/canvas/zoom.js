// ZOOM SCRIPT FOR CYTOSCAPE

zoomIn.addEventListener("click", () => {
    mindMap.cy.zoom(mindMap.cy.zoom() + 0.1);
});

zoomOut.addEventListener("click", () => {
    mindMap.cy.zoom(mindMap.cy.zoom() - 0.1);
});