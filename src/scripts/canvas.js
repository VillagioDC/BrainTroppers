// CANVAS SCRIPT
// MODULAR LOADER

document.addEventListener('DOMContentLoaded', function() {

    // Load all scripts in order
    Promise.all([
      // Local storage
      loadScript('./src/scripts/canvas/local-storage.js').catch(() => {}),
    ])
    .then (() => {
      Promise.all([
        // Interface pieces
        loadScript('./src/scripts/canvas/sidebar.js').catch(() => {}),
        loadScript('./src/scripts/canvas/user-menu.js').catch(() => {}),
        loadScript('./src/scripts/canvas/new-map.js').catch(() => {}),
        loadScript('./src/scripts/canvas/map-list.js').catch(() => {}),
        loadScript('./src/scripts/canvas/theme.js').catch(() => {}),
        loadScript('./src/scripts/notifications.js').catch(() => {}),
        // Core mind map canvas + initial nodes
        loadScript('./src/scripts/canvas/mindmap-canvas.js'),
        loadScript('./src/scripts/canvas/zoom.js').catch(() => {}),
      ])
      .then(() => {
        Promise.all([
          // Map menu popup
          loadScript('./src/scripts/canvas/map-menu-popup.js').catch(() => {}),
          // Load command scripts
          loadScript('./src/scripts/canvas/detail-node.js'),
          loadScript('./src/scripts/canvas/add-node.js'),
          loadScript('./src/scripts/canvas/expand-node.js'),
          loadScript('./src/scripts/canvas/rewrite-node.js'),
          loadScript('./src/scripts/canvas/approve-node.js'),
          loadScript('./src/scripts/canvas/delete-node.js'),
          loadScript('./src/scripts/canvas/connect-node.js'),
          loadScript('./src/scripts/canvas/disconnect-node.js'),
          loadScript('./src/scripts/canvas/rewire-all.js'),
        ])
        .then(() => {
          console.log('Canvas loaded.');
        })
        .catch(error => {
          console.error('Error loading user commands:', error);
        });
      })
      .catch(error => {
        console.error('Error loading initial scripts:', error);
      });
    })
    .catch(error => {
      console.error('Error loading base scripts:', error);
    });

    // Helper: dynamic script loader
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.type = 'text/javascript';
        s.async = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(s);
      });
    }

});