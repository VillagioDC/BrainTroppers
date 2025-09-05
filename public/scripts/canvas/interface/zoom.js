// CANVAS MODULES
// ZOOM MODULE

(function () {
    // Elements
    const zoomFit = document.getElementById('zoom-fit');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');

    // Event listeners
    if (zoomFit) zoomFit.addEventListener('click', () => {
        braintroop.zoomFit();
    });
    if (zoomIn) zoomIn.addEventListener('click', () => {
        braintroop.zoomBy(1.2);
    });
    if (zoomOut) zoomOut.addEventListener('click', () => {
        braintroop.zoomBy(0.83333333333);
    });

})();