// CANVAS MODULES
// ZOOM MODULE

(function () {
    // Elements
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomFit = document.getElementById('zoom-fit');
    const zoomCenter = document.getElementById('zoom-center');

    // Event listeners
    if (zoomIn) zoomIn.addEventListener('click', () => {
        braintroop.zoomBy(1.2);
    });
    if (zoomOut) zoomOut.addEventListener('click', () => {
        braintroop.zoomBy(0.83333333333);
    });
    if (zoomFit) zoomFit.addEventListener('click', () => {
        braintroop.zoomFit();
    });
    if (zoomCenter) zoomCenter.addEventListener('click', () => {
        braintroop.centerOnNode();
    });

})();