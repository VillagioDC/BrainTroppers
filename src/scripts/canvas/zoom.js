// CANVAS
// ZOOM SCRIPT

// Zoom in
if (document.getElementById('zoom-in'))
    document.getElementById('zoom-in').addEventListener('click', () => {
        braintroop.zoomBy(1.2);
    });

// Zoom out
if (document.getElementById('zoom-out'))
    document.getElementById('zoom-out').addEventListener('click', () => {
        braintroop.zoomBy(0.83333333333);
    });

// Zoom fit
if (document.getElementById('zoom-fit'))
    document.getElementById('zoom-fit').addEventListener('click', () => {
        braintroop.zoomFit();
});

// Center viewport on node
if (document.getElementById('zoom-center'))
    document.getElementById('zoom-center').addEventListener('click', () => {
        braintroop.centerOnNode();
    });