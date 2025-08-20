// CANVAS SCRIPT
// MODULAR LOADER

document.addEventListener('DOMContentLoaded', function() {

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

    // Load UI + D3 + MindMap core + data + commands
    Promise.all([
      // Interface pieces
      loadScript('./src/scripts/canvas/sidebar.js').catch(() => {}),
      loadScript('./src/scripts/canvas/user-menu.js').catch(() => {}),
      loadScript('./src/scripts/canvas/new-map.js').catch(() => {}),
      loadScript('./src/scripts/canvas/map-menu-popup.js').catch(() => {}),
      loadScript('./src/scripts/canvas/theme.js').catch(() => {}),
      // Core mind map canvas + initial nodes
      loadScript('./src/scripts/canvas/mindmap-canvas.js'),
      loadScript('./src/scripts/canvas/nodes.js'),
      loadScript('./src/scripts/canvas/zoom.js').catch(() => {}),
    ])
    .then(() => {
      // Initialize UI scripts in context
      if (typeof window.initSidebar === 'function') window.initSidebar();
      if (typeof window.initUserMenu === 'function') window.initUserMenu();
      if (typeof window.initNewMap === 'function') window.initNewMap();
      if (typeof window.initMapMenu === 'function') window.initMapMenu();

      // Seed data
      if (window.NodeStore && window.mindMapCanvas) {
        const data = window.NodeStore.getInitialData();
        window.mindMapCanvas.setData(data);
      }

      // Load command scripts
      Promise.all([
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
        showNotification('Failed to load canvas components.', 'error');
      });
    })
    .catch(error => {
      console.error('Error loading initial scripts:', error);
      showNotification('Failed to initialize canvas.', 'error');
    });
});