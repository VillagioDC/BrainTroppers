// CANVAS
// ZOOM SCRIPT

// Zoom in 
document.getElementById('zoom-in').addEventListener('click', () => {
    mindMap.svg.transition().call(mindMap.zoom.scaleBy, 1.2);
});

// Zoom out
document.getElementById('zoom-out').addEventListener('click', () => {
    mindMap.svg.transition().call(mindMap.zoom.scaleBy, 0.8);
});