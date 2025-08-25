// CANVAS SCRIPT
// MODULAR LOADER

document.addEventListener('DOMContentLoaded', function() {

    // Load all scripts in order
    Promise.all([
      // Load d3.js
      loadScript("https://d3js.org/d3.v7.min.js"),
    ])
    .then (() => {
      Promise.all([
        // Braintroop script
        loadScript('./src/scripts/canvas/braintroop.js'),
      ])
      .then(() => {
        Promise.all([
          // Load example map
          import('./canvas/utils/loadExampleMap.js'),
          // Interface
          import('./canvas/interface/sidebar.js'),
          import('./canvas/interface/userPanel.js'),
          import('./canvas/interface/userMenu.js'),
          import('./canvas/interface/mapList.js'),
          import('./canvas/interface/zoom.js'),
          import('./canvas/interface/newMap.js'),
          import('./canvas/interface/mapListPopup.js'),
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
          // Successfully loaded
          console.log('Canvas loaded.');
        })
        // Catch errors
        .catch(error => {console.error('Error loading user commands:', error);});})
      .catch(error => {console.error('Error loading initial scripts:', error);});})
    .catch(error => {console.error('Error loading D3.js:', error);});

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