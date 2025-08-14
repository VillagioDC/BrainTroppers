// CANVAS SCRIPT

document.addEventListener('DOMContentLoaded', function() {
  Promise.all([
    // Interface
    loadScript('../scripts/canvas/sidebar.js'),
    loadScript('../scripts/canvas/map-menu.js'),
    loadScript('../scripts/canvas/user-menu.js'),
    loadScript('../scripts/canvas/theme.js'),
    // Canvas handling
    loadScript('../scripts/canvas/zoom.js'),
    // Node handling
    loadScript('../scripts/canvas/mindmap2.js'),
    loadScript('../scripts/canvas/add-node.js'),
    loadScript('../scripts/canvas/edit-node.js'),
  ]).then(() => {
    console.log('Page loaded successfully');
  }).catch(error => {
    console.error('Error loading canvas scripts:', error);
  });

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
});